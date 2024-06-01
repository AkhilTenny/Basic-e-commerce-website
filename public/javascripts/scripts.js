
function addToKart(proid){
  $.ajax({
    
    url:"/add-kart/"+proid,
    method:"get",
    success:(responce)=>{
      console.log(responce)
    $("#cart-count").html(responce)
    }
    
  })
}