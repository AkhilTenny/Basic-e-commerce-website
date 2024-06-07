const mongooseFile = require('../config/connection')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const usersSchema = mongoose.Schema({
  gmail:String,
  username:String,
  password:String
})
const user = mongoose.model("users",usersSchema)

const kartScheme = mongoose.Schema({
  userId:String,
  userName:String,
  products: [{product_id:String}]
})

const kart = mongoose.model('userKart',kartScheme)

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
       console.log("string:",loggedUser._id.toString())
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
  
  
}async function addToKart(usrId,usrNme,proId){
  const userKart = await kart.findOne({userId:usrId})

  if(userKart){
     
     const kartProduts = await kart.findOneAndUpdate({userId:usrId},{ $push:{products: {product_id:proId}}})
  }else{
   var newUserKart = new kart({
      userId:usrId,
      userName:usrNme,
      Products:[]
    })
    await newUserKart.save()
    addToKart(usrId,usrNme,proId)

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
            _id: "$products.product_id",
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
          products:"$products.product_id"
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

 async function changeKartProductCount(about){
  return new Promise(async(resolve,reject)=>{
    let userid = about.userId
   let productId  = about.proId
    if(about.Count == +1){
   await kart.findOneAndUpdate({userId:about.userId},{$push:{products: {product_id:about.proId}}})
   
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
            productId: "$products.product_id",
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
  console.log(data)  
  await kart.findOneAndUpdate({
      userId:data.userId
    },{$pull:{
        products:{
          product_id:data.proId
        }
    }})
 }
 
module.exports={  
  doSignUp,
  doLogin,
  addToKart,
  kartFindProducts,
  kartCount,
  changeKartProductCount,
  deleteProductInUserKart
  
}