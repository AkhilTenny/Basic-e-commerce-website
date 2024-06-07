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
   console.log(user)
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
        
        console.log(req.session.id)
        res.redirect('/')
      })}
  else{
    console.log("passwords doesn't matched")
  }
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then(data=>{
    if(data.result){
      req.session.loggedin = true;
      req.session.user = data.username
      req.session._Id = data.Id
      console.log(data.Id)
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

router.get("/cart/:id",checkLogedIn,(req,res)=>{
  userHelpers.kartFindProducts(req.params.id).then((value)=>{
  productHelpers.findProductsKart(value).then((products)=>{
  
  res.render("./users/cart", {  admin: false,user,products})
  
  })
  })  
})

router.get("/add-kart/:id", async(req,res)=>{
 
  userHelpers.addToKart(req.session._Id,req.session.user,req.params.id)
  res.json(await userHelpers.kartCount(req.session._Id))
})

router.post('/changeProductCount',async(req,res)=>{
  userHelpers.changeKartProductCount(req.body)
  res.json("hai")
})
  
module.exports = router
