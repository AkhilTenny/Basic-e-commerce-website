
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
         $('#total').html(responce)
         console.log(responce)
        $("#count-dec-btn-"+proid).addClass('disabled').attr('disabled', true);
      }else if(newCount != 1){
        $("#count-dec-btn-"+proid).removeClass('disabled').removeAttr('disabled');
        $('#total').html(responce)
        console.log(responce)

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
          location.reload()
      }
    })
  }
  function placeOrder(userid){
    let adress = $("#address").val()
    let pincode = $("#pincode").val()
    let mobileNo = $("#mobileNo").val()

    let paymentOption = $("input[name='payment-radio']:checked").val()
    if(paymentOption == "payment-COD"){
      $.ajax({
        url:'/placeOrder/',
        data:{
          adress:adress,
          pincode:pincode,
          paymentOption:paymentOption,
          userid:userid,
          mobileNo:mobileNo
        },
        method:"POST",
        success:(responce)=>{
          console.log(responce)
        }
      })
    }


  }
  