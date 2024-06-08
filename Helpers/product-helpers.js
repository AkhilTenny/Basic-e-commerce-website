const mongoose = require('mongoose')
const crypto = require("crypto");


const productSchema = mongoose.Schema({
  No:Number,
  name: String,
  brand: String,
  Description: String,
  Price:Number,
  count:Number,
  cryptoId:String
})

const product = mongoose.model("products",productSchema);

async function addProduct(data,id){
 
  const randomBytes = crypto.randomBytes(12)
  const uniqueId = randomBytes.toString('hex')
  
  const newProduct = new product({
  
  name: data.Name,
  brand: data.Brand,
  Description: data.Description,
  Price: data.Price,
  count:0,
  cryptoId:uniqueId

  })
  await newProduct.save();
  id(uniqueId); 
  
}
function findProducts(){
  return new Promise(async function(resolve,reject){
  const products = await product.find({})
 
  resolve(products)

})}

function deleteProduct(proId){
  return new Promise(async function(resolve,reject){
      const dltProduct = await product.findByIdAndDelete(proId);
      resolve(dltProduct);
  })
}
function findProduct(proId){  
    return new Promise(async function(resolve,reject){
      await product.findOne({_id:proId}).then((response)=>{
        resolve(response)
      })
    })
}
function editProduct(proId,productInfo){
  return new Promise(async function(resolve,reject){
    await product.findOneAndUpdate({_id:proId},{
      name: productInfo.Name,
      brand: productInfo.Brand,
      Description: productInfo.Description,
      Price:productInfo.Price,
      count:0
  
    })
  })
}
function findProductsKart(userid){
  
  return new Promise(async(resolve,reject)=>{
    let kartProducts = kart.aggregate(
      [
        {
          $match: {
            userId: userid,
          },
        },
       
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $group: {
            _id: "$products.product_crypto_id",
            count:{$sum:1}
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "cryptoId",
            as: "productsDetails"
          }
        },
        {
          $project: {
            count:"$count",
            product:"$productsDetails"
            
          }
          
        },
      ]
    )
    resolve(kartProducts)
   

  })
}

async function findProductCryptoId(id){
  let foundproduct = await product.findOne({_id:id})
  return foundproduct.cryptoId
}


module.exports={

  addProduct,
  findProducts,
  deleteProduct,
  findProduct,
  findProductsKart,
  editProduct,
  findProductCryptoId,
}