<template>
  <div class="sellState-container">
    <div class="sellState_nav">
      <p>Order Status</p>
      <div style="padding:.1rem 0 .1rem .1rem; cursor: pointer;" @click="goSellOrder"><img  src="@/assets/images/ShutDown.png" alt=""></div>
    </div>
    <div class="sellState_content">
      <div class="sellState" >
          <img v-if="[0].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon1_no.png" alt="">
          <img v-else-if="[1].includes(orderStateData.orderStatus)"  src="@/assets/images/stateSell/icon1_In.png" alt="">
          <img v-else-if="[2,3,4,5,6,9,8].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon1_finish.png" alt="">
        <div class="sellState_right" >
          <p :style="{ color:orderStateData.orderStatus==0?'#6E7687':'' }">Crypto Sent</p>
          <p v-if="orderStateData.orderStatus!==0" :style="{color:orderStateData.orderStatus==1?'#0059DA':'#031633'}">Block confirmed ( {{ orderStateData.confirmBlock }} / {{ orderStateData.totalBlock }} )</p>
        </div>
      </div>
      <img class="line" :src="[0,1].includes(orderStateData.orderStatus)?line.LineImg:line.LineImgActive" alt="">
    </div>
    <div class="sellState_content">
      <div class="sellState" >
          <img v-if="[0,1].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon2_no.png" alt="">
          <img v-else-if="[2].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon2_In.png" alt="">
          <img v-else-if="[2,3,4,5,6,9,8].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon2_fil.png" alt="">
        <div class="sellState_right" >
          <p :style="{ color:[0,1].includes(orderStateData.orderStatus)?'#6E7687':'' }">Confirm Order</p>
          <p v-if="[3,4,5,6,9,8].includes(orderStateData.orderStatus)" style="color:#031633">Your order has been confirmed</p>
        </div>
      </div>
      <img class="line" :src="[0,1,2].includes(orderStateData.orderStatus)?line.LineImg:line.LineImgActive" alt="">
    </div>
    <div class="sellState_content">
      <div class="sellState" >
          <img v-if="[0,1,2].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon3_no.png" alt="">
          <img  v-else-if="[3].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon3_In.png" alt="">
          <img v-else-if="[4,5,6,9,8].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon3_fil.png" alt="">
        <div class="sellState_right">
          <p :style="{ color:[0,1,2].includes(orderStateData.orderStatus)?'#6E7687':'' }">In Transfer</p>
          <p v-if="[4,5,6,9,8].includes(orderStateData.orderStatus)" style="color:#031633">Your fiat is in transfer</p>
        </div>
      </div>
      <img class="line" :src="[0,1,2,3,].includes(orderStateData.orderStatus)?line.LineImg:line.LineImgActive" alt="">
    </div>
    <div class="sellState_content">
      <div class="sellState" >
          <img v-if="[0,1,2,3].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon4_no.png" alt="">
          <img v-else-if="orderStateData.orderStatus==4" src="@/assets/images/stateSell/icon4_In.png" alt="">
          <img v-else-if="orderStateData.orderStatus==5" src="@/assets/images/stateSell/icon4_fil.png" alt="">
          <img v-else-if="[6,9,8].includes(orderStateData.orderStatus)" src="@/assets/images/stateSell/icon4_error.png" alt="">
        <div class="sellState_right">
          <p :style="{ color:[0,1,2,3].includes(orderStateData.orderStatus)?'#6E7687':'' }">Result</p>
          <p v-if="[5,6,9,8].includes(orderStateData.orderStatus)" style="color:#031633">{{ orderStateData.orderStatus==5?'Order completed':'Order fail' }}</p>
        </div>
      </div>
      
    </div>
    <div class="sellState_bottom">
      <p>You may leave this page. Order updates will be sent to your email and can be checked in the order history.</p>
      <div class="button" @click="goHistry">
        <p>Order History</p>
        <img src="@/assets/images/rightIconSell.png" alt="">
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name:'sellState',
  props:{
    orderStateData:{
      default:''
    },

  },
  data(){
    return{
  
      line: {
          LineImg:require('@/assets/images/stateSell/Line.png'),
          LineImgActive:require('@/assets/images/stateSell/LineActive.png'),
        },
      state:2
    }
  },
  methods:{
    goSellOrder(){
    
      setTimeout(() => {
        this.$store.state.nextOrderState = 1
      }, 1000);
      this.$router.replace('/')
    },
    goHistry(){
      this.$store.state.historyTab = 'sell'
      this.$router.push('/tradeHistory')
    }
  },

}
</script>
<style lang="scss" scoped>
.sellState-container{
  width: 100%;
  .sellState_nav{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .4rem;
    p{
      font-size: .18rem;
      color: #031633;
      font-family: SFProDisplaybold;
    }
    img{
      height: .2rem;
     
    }
  }
  .sellState_content{
    width: 100%;
    // margin-top: .08rem;
    .sellState{
      width: 100%;
      display: flex;
       img{
         width: .4rem;
       height: .4rem;
       margin-right: .16rem;
       border: none;
       }
     .sellState_right{
       display: flex;
       flex-direction: column;
       justify-content: center;
       p:nth-of-type(1){
         color: #031633;
         font-size: .16rem;
         line-height: .18rem;
         margin-top: .02rem;
         font-family: SFProDisplayRegular;
       }
       p:nth-of-type(2){
         font-size: .13rem;
         color: #031633;
         line-height: .13rem;
         margin-top: .08rem;
         font-family: SFProDisplayRegular;
       }
     }
    }
    .line{
      height: .45rem;
      margin-left: .2rem;
      margin-top: .08rem;
    }
  }
  .sellState_bottom{
    width: 88%;
    position: absolute;
    bottom: .2rem;
    left: 6%;
    cursor: pointer;
    >p{
      font-style: normal;
      line-height: 18px;
      font-size: 13px;
      color: #94ACBA;
      font-family: SFProDisplayRegular;
    }
    .button{
      width: 100%;
      height: .58rem;
      border-radius: .3rem;
      background: linear-gradient(88.06deg, #0059DA 0%, #1BB2F2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: .16rem;
       font-family: SFProDisplaybold;
      p{
        color: #fff;
        margin-right: .12rem;
      }
      img{
        height: .2rem;
        margin-top: .04rem;
      }
    }
  }
}
</style>