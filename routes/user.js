const express = require('express');
const router = express.Router();
const productHelpers = require('../Helpers/product-helpers');
const userHelpers = require('../Helpers/user-helpers');
const { helpers } = require('handlebars');
const session = require('express-session');

var user={}

const checkLogedIn=(req,res,next)=>{
  if(req.session.loggedin){
    next()
  }else{
    res.redirect('/login')
  }
}

const app = express();


router.get("/",async function (req, res, next) {
  let kartcount 
   if(req.session.user){
    await userHelpers.kartCount(req.session._Id).then((value)=>{
     kartcount = value;
    })
   }
  productHelpers.findProducts().then((products) => {
   
   user.name = req.session.user
   user.id = req.session._Id
    res.render("./users/index", { products, admin: false,user,kartcount });
  });
});
router.get("/login", function(req,res,next){
  res.render("./users/login",{"loginErr":req.session.loginErr})
  req.session.loginErr = false
})

router.get("/signin", function(req,res){
  res.render("./users/signin")
})
router.post("/signin",function(req,res){
  if(req.body.password == req.body.confirmPassword){
      userHelpers.doSignUp(req.body).then(data=>{
        req.session.loggedin = true;
        req.session.user = data.username
        req.session._Id = data._id.toString()
        res.redirect('/')
      })}
  else{
  }
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then(data=>{
    if(data.result){
      req.session.loggedin = true;
      req.session.user = data.username
      req.session._Id = data.Id
    res.redirect('/')
    }else{
      req.session.loginErr = "Invalid Username or Password"
      res.redirect('login')
    }
  
  }
)
})
router.get("/logout",(req,res)=>{
  req.session.destroy()
  
  user.name = req.session.user
  user.id = req.session._Id
  res.redirect('/')

})

router.get("/cart",checkLogedIn,(req,res)=>{
  //only to check the user is logged in 
})    

router.get("/cart/:id",checkLogedIn,async(req,res)=>{
  total = await userHelpers.cartTotalAmount(req.params.id)
  userHelpers.findProductsKart(req.params.id).then((products)=>{
  
  res.render("./users/cart", {  admin: false,user,products,total})
  
  })
   
})

router.get("/add-kart/:id", async(req,res)=>{
 
  userHelpers.addToKart(req.session._Id,req.session.user,req.params.id)
  res.json(await userHelpers.kartCount(req.session._Id))
})

router.post('/changeProductCount',async(req,res)=>{
  userHelpers.changeKartProductCount(req.body)

  res.json(await userHelpers.cartTotalAmount(req.body.userId))
})

router.post("/removeCartItem",async(req,res)=>{
  userHelpers.deleteProductInUserKart(req.body)
  res.json("hai")
})
router.get('/place-order/:id',async(req,res)=>{
  total = await userHelpers.cartTotalAmount(req.params.id)
  const currencyTotal = total.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
  console.log(user.id)
  res.render("./users/place-order",{"total":total,user})

})
router.post('/placeOrder',async(req,res)=>{
  userHelpers.MakeBill(req.body).then((products)=>{
    
    userHelpers.addItemsToOrders(products,req.body.userid)
    userHelpers.clearKart(req.body.userid)
    
  })
 
})
router.get('/view-orders/:id',(req,res)=>{
 
  userHelpers.findOrderedProducts(req.params.id).then((value)=>{
  
    res.render('./users/orders',{"products":value})
  })
})
  
module.exports = router
