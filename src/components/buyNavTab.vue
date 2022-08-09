<template>
  <div class="buyNavTab-container" v-if="tabShow">
    
    <div class="buyNavTab_content">
      <img class="icon" src="../assets/images/buyTabImg/Receive.png" v-if="$route.name !== 'receivingMode'" alt="">
      <img class="iconActive" src="../assets/images/buyTabImg/ReceiveActive.png" alt="" v-if="$route.name === 'receivingMode'">
    </div>
    <img  src="../assets/images/buyTabImg/IconRight.png" alt="">
      <div class="buyNavTab_content">
        <img class="icon" src="../assets/images/buyTabImg/parment.png" v-if="$route.name !== 'paymentMethod'" alt="">
        <img class="iconActive" src="../assets/images/buyTabImg/parmentActive.png" v-if="$route.name === 'paymentMethod'" alt="">
    </div>
    <img  src="../assets/images/buyTabImg/IconRight.png" alt="">
    <div class="buyNavTab_content">
      <img class="icon" src="../assets/images/buyTabImg/order.png" v-if="$route.name !=='creditCardConfig'" alt="">
      <img class="iconActive" src="../assets/images/buyTabImg/orderActive.png" v-if="$route.name ==='creditCardConfig'" alt="">
    </div>
      
      
  </div>
</template>
<script> 
export default{
  name:'BuyNavTab',
  data(){
    return{
      
    }
  },
  computed:{
    tabShow(){
      if((this.$route.name === 'receivingMode' ||this.$route.name === 'paymentMethod'  ||this.$route.name === 'modifyCardInfo' || this.$route.name ==='creditCardConfig' || this.$route.name ==='otherWays-VA' || this.$route.name ==='otherWayPay' || this.$route.name ==='paymentResult') && this.$parent.$refs.viewTab.tabState === true){
        return true
      }else{
        return false
      }
      
    }
  }
}

</script>
<style lang="scss" scoped>
.buyNavTab-container{
  width: 100%;
  padding: .16rem 0 .2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  >img{
    height: .24rem;
  }
  .buyNavTab_content{
   
    .icon{
      height: .36rem;
    }
    .iconActive{
      height: .48rem;
    }
  }
}
</style>