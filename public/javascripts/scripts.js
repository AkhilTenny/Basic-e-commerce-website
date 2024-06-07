
function addToKart(proid){
  $.ajax({
    
    url:"/add-kart/"+proid,
    method:"get",
    success:(responce)=>{
    $("#cart-count").html(responce)
    }
    
  })
}
function changeProductCount(proid,userid,count){
  $.ajax({

    url:'/changeProductCount/',
    data:{
      proId:proid,
      userId:userid,
      Count:count
    },
    method:"POST",
    success:(responce)=>{
      
      newCount = Number($('#item-count-'+proid).html()) + count
      $('#item-count-'+proid).html(newCount)
    }
  })
}