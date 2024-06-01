var express = require('express');
var router = express.Router();
const helpers = require("../Helpers/product-helpers.js")




/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render("index", {admin:true});
  

});

router.get('/view-products', function(req, res, next) {
  helpers.findProducts().then((products)=>{
    
    res.render("admin/show-products",{products} );
  })
});



router.get("/add-product",function(req,res,next){
  res.render("admin/add-product")
})

router.post("/add-product",function(req,res,next){

  helpers.addProduct(req.body,(id)=>{
    let image = req.files.Image
    
    image.mv('./public/images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }else{
      }
    })
  })
  res.redirect('/admin/view-products')
})

 router.get("/delete-product/:id",function(req,res,) {
  let proId = req.params.id
  
  helpers.deleteProduct(proId).then(data=>{
    if(data){
      res.redirect('/admin/view-products')
    }
  })
 })
 
 router.get("/edit-product/:id",async function(req,res) {
  let proId = req.params.id;
  const product = await helpers.findProduct(proId)
  res.render('admin/edit',{product})
 })

 router.post('/edit-product/:id',(req,res)=>{
   helpers.editProduct(req.params.id,req.body)
   if(req.files){
    let image = req.files.Image
    
    image.mv('./public/images/'+req.params.id+'.jpg')
   }
   res.redirect('/admin/view-products')
  }
)
module.exports = router;
