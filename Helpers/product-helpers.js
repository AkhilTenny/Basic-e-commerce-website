const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
  No:Number,
  name: String,
  brand: String,
  Description: String,
  count:Number
})

const product = mongoose.model("products",productSchema);

async function addProduct(data,id){
 

  const newProduct = new product({
  
  name: data.Name,
  brand: data.Brand,
  Description: data.Description,
  count:0

  })
  await newProduct.save();
  id(newProduct._id.valueOf().toString()); 
  
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
      count:0
  
    })
  })
}
function findProductsKart(kartProductsInfo){
  return new Promise(async(resolve,reject)=>{
    var kartProducts=[]
    var count = []
    for(let i=0;i<kartProductsInfo.length;i++){
     let productInfo = await product.findOne({_id:kartProductsInfo[i]._id})
       if (productInfo){
        kartProducts[i] = productInfo
        kartProducts[i].count = kartProductsInfo[i].count


       }
    }
    resolve(kartProducts)
   

  })
}





module.exports={

  addProduct,
  findProducts,
  deleteProduct,
  findProduct,
  findProductsKart,
  editProduct,
}