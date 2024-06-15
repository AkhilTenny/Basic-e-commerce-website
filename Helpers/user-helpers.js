const mongooseFile = require('../config/connection')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require("crypto")
const productHelpers = require('./product-helpers')

const usersSchema = mongoose.Schema({
  gmail:String,
  username:String,
  password:String
})
const user = mongoose.model("users",usersSchema)

const kartScheme = mongoose.Schema({
  userId:String,
  userName:String,
  products: [{product_crypto_id:String}]
})
const kart = mongoose.model('userKart',kartScheme)


//schema for bill

const billSchema = mongoose.Schema({
  userId: String,
  userName:String,
  total:String,
  mobileNo:Number,
  address:String,
  pincode:Number,
  paymentOption:String,
  products:[{
    product_crypto_id:String,
    productName:String,
    productCount:Number
  }],
  deliveredStatus:Boolean,
  paymentStatus:Boolean,
  ordered:Boolean,
  cancelStatus:Boolean,
  date:String,
  
})

const bill = mongoose.model("bills",billSchema)

const ordersSchema = mongoose.Schema({
  userid:String,
  products:[{
    product_crypto_id:String,
    productName:String,
    productCount:Number,
    date:String,
  }]

})

const order = mongoose.model('orders',ordersSchema)

async function doSignUp(userData){
  return new Promise(async(resolve,reject)=>{
  
    userData.password = await bcrypt.hash(userData.password,10);
    
    const newUser = new user({
      gmail:userData.email,
      username:userData.username,
      password:userData.password
    })


      await newUser.save();
      resolve(newUser)

   }) 
}
async function doLogin(logData){
  return new Promise(async(resolve,reject)=>{
    const loggedUser = await user.findOne({gmail:logData.email})  
  const response = {}
  if(loggedUser){
   bcrypt.compare(logData.password, loggedUser.password,(err,result)=>{
    if(result){
      response.Id = loggedUser._id.toString()
      response.username = loggedUser.username
      response.result = true
      response.issue = false
      resolve(response)
    }else{{
      response.result = false
      response.issue = "wrong password"
      resolve(response)
    }}
   })
   
  }else{
    response.result = false
    response.issue = "no user found"
    resolve(response)
  }
  })
  
  
}async function addToKart(usrId,usrNme,proCryptoId){
  const userKart = await kart.findOne({userId:usrId})


  if(userKart){
     const kartProduts = await kart.findOneAndUpdate({userId:usrId},{ $push:{products: {
      product_crypto_id: proCryptoId
     }}})
  }else{
   var newUserKart = new kart({
      userId:usrId,
      userName:usrNme,
      Products:[]
    })
    await newUserKart.save()
    addToKart(usrId,usrNme,proCryptoId)

  }
}async function kartFindProducts(id){
  return new  Promise(async(resolve,reject)=>{
    const kartProduts= await kart.aggregate(
      [
        {
          $match: {
            userId: id,
          },
        },
        {
          $unwind: {
            path: "$products",
          },
        },{
          $group: {
            _id: "$products.product_crypto_id",
            count:{
              $sum:+1,
            }
          }
        }
      ]
    )
  resolve(kartProduts)
    })
 
 }
 async function kartCount(id){
  return new Promise(async(resolve,reject)=>{
    const products =await kart.aggregate([
      {
        $match: {
          userId:id
        }
      },
      {
        $unwind: {
          path: "$products"}
      },
      {
        $project: {
          products:"$products.product_crypto_id"
        }
      },{
        $group: {
          _id: "$products"
        }
      }
    ]) 
    resolve(products.length)
  })
 }

 async function findUserName(id){
  return new Promise(async(resolve,reject)=>{
    resolve(await user.findOne({_id:id},{username:1}))
  })
 }

 async function changeKartProductCount(about){
  return new Promise(async(resolve,reject)=>{
    let userid = about.userId
   let productId  = about.proId
    if(about.Count == +1){
   await kart.findOneAndUpdate({userId:about.userId},{$push:{products: {product_crypto_id:about.proId}}})
   
    }else if(about.Count == -1){
      let removingProductids = await kart.aggregate([
        {
          $match: {
            userId: about.userId,
          },
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $project: {
            id: "$products._id",
            productId: "$products.product_crypto_id",
          },
        },
        {
          $match:
             
            {
              productId: about.proId, 
            },
        },
        {
          $project: {
            id:"$id"
          }
        }
      ])
      await kart.findOneAndUpdate({userId:about.userId},{$pull:{products: {_id:removingProductids[0].id}}})

    } 
  })
 }
 async function deleteProductInUserKart(data){
  await kart.findOneAndUpdate({
      userId:data.userId
    },{$pull:{
        products:{
          product_crypto_id:data.proId
        }
    }})
 }
 async function cartTotalAmount(userid){
   return new Promise(async(resolve,reject)=>{
    let kartProductInfo = await kart.aggregate(
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
          $project: {
            id: "$products.product_crypto_id",
          },
        },
        {
          $group: {
            _id: "$id",
            number: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "cryptoId",
            as: "product",
          },
        },
        {
          $unwind: {
            path: "$product",
          },
        },
        {
          $project: {
            count:"$number",
            name: "$product.name",
            brand: "$product.brand",
            Description: "$product.Description",
            Price: "$product.Price",
          },
        },
      ]
    )
    let totalAmount = 0
    let currencyTotal = 0
    for(let i=0;i<kartProductInfo.length;i++){
     const amount =   kartProductInfo[i].count*kartProductInfo[i].Price;
     totalAmount = amount+totalAmount
     console.log(kartProductInfo[i].count)
    }
  currencyTotal = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'INR' });

    resolve(currencyTotal)
   })
  
    
 }
 function findProductsKart(userid){
  
  return new Promise(async(resolve,reject)=>{
    let kartProducts = await kart.aggregate(
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
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "cryptoId",
            as: "productsDetails",
          },
        },
        {
          $unwind: {
            path: "$productsDetails",
          },
        },
      
        {
          $project: {
            count: "$count",
            name: "$productsDetails.name",
            brand: "$productsDetails.brand",
            Description: "$productsDetails.Description",
            Price: "$productsDetails.Price",
            cryptoId: "$productsDetails.cryptoId",
          },
        },
      ]
    )
    resolve(kartProducts)
   })
}


async function MakeBill(data){
  return new Promise(async(resolve,reject)=>{
    
    const [totalAmount,products,username]= await Promise.all([
      cartTotalAmount(data.userid),
      findProductsKart(data.userid),
      findUserName(data.userid)

    ])
 
    let productsSimpleObejct = products.map(item=>({
      product_crypto_id:item.cryptoId,
      productName:item.name ,
      productCount:item.count,
    }))
    console.log(productsSimpleObejct)
    newbill = new bill({
      userId: data.userid,
      userName:username.username,
      total:totalAmount,
      mobileNo:data.mobileNo,
      address:data.address,
      pincode:data.pincode,
      paymentOption:data.paymentOption,
      products:[...productsSimpleObejct],
      deliveredStatus:false,
      paymentStatus:false,
      ordered:false,
      cancelStatus:false,
      date: new Date()
    })
      await newbill.save()

   console.log("haida",data.userid)
      resolve(productsSimpleObejct)
  })
}
async function addItemsToOrders(products,userId) {
  console.log(userId)
  productsWithoutId = [];
  products.forEach(element => {
    element.date = new Date();
    delete element._id
    
  });
  if(await order.findOne({userid:userId})){
    await order.findOneAndUpdate({userid:userId},{
      $push:{products}
    })
  }else{
    const newOrder = new order({
      userid:userId,
      Products:[]
    })
   await newOrder.save()

   addItemsToOrders(products,userId)
  }
 
  }
  
function findOrderedProducts(id){
 return new Promise(async(resolve,reject)=>{ 
  let userOrders = await order.findOne({userid:id})
  resolve(userOrders.products)
 })
}

function clearKart(id){
  return new Promise(async(resolve,reject)=>{
    await kart.findOneAndDelete({userId:id})
    resolve(true)
  })
}

 
module.exports={  
  doSignUp, 
  doLogin,  
  addToKart,  
  kartFindProducts,
  kartCount,
  changeKartProductCount,
  deleteProductInUserKart,
  cartTotalAmount,
  findProductsKart,
  MakeBill,
  findUserName,
  addItemsToOrders,
  findOrderedProducts,
  clearKart
}