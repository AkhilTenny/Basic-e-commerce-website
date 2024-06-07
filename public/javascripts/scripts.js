
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
      if(newCount == 1){
       
        $("#count-dec-btn-"+proid).addClass('disabled').attr('disabled', true);
      }else if(newCount != 1){
        $("#count-dec-btn-"+proid).removeClass('disabled').removeAttr('disabled');
      }
      
     
      $('#item-count-'+proid).html(newCount)
    }
  })}

  function removeCartItem(proid,userid){
    $.ajax({
      url:'/removeCartItem/',
      data:{
        proId:proid,
        userId:userid
      },
      method:"POST",
      success:(responce)=>{
        console.log(responce)
        $('#product-list-'+proid).remove()
      }
    })
  }
  