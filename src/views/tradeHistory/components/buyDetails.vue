<template>
  <div class="buyDetails-container">
    <div class="buyDetails_title">
      <div class="line_left">Buy {{ buyData.cryptoCurrency }}</div>
      <div class="lineRight">
        <div class="Transferring"></div>
        <p class="Transferring_con">Transferring</p>
      </div>
    </div>
    <div class="buyDetails_content">
      <div class="buyDetails_con">
        <p>Amount (USD)</p>
        <p>5,000</p>
      </div>
      <div class="buyDetails_con">
        <p>Crypto</p>
        <p>5,000</p>
      </div>
      <div class="buyDetails_con">
        <p>Price (USD)</p>
        <p>5,000</p>
      </div>
      <div class="buyDetails_con">
        <p>Total (USDT)</p>
        <p>5,000</p>
      </div>
      <div class="buyDetails_con">
        <p>Ramp Fee (USD)</p>
        <p>5,000</p>
      </div>
      <div class="buyDetails_con">
        <p>Network Fee (USD)</p>
        <p>5,000</p>
      </div>
    </div>
    <div class="buyDetails_OrderId">
        <div class="copyView" @click="copy" data-clipboard-text="12345678923ddavfseerh">
          <p>Order ID:</p>
          <p><span>12345678923ddavfseerh</span> <img src="@/assets/images/copySell.png" alt=""></p>
        </div>
        <div>
          <p>Order Time:</p>
          <p style="color:#031633">2022-06-10 15:40:03</p>
        </div>
        <div>
          <p>Payment Time:</p>
          <p style="color:#031633">2022-06-10 15:40:03</p>
        </div>
      </div>
      <div class="buyDetails_OrderId" style="margin-top:.12rem">
        <div>
          <p>Network:</p>
          <p style="color:#031633">Trc20</p>
        </div>
        <div class="copyView" @click="copy" data-clipboard-text="12345678923ddavfseerh">
          <p>Address:</p>
          <p><span>12345678923ddavfseerh</span> <img src="@/assets/images/copySell.png" alt=""></p>
        </div>
        <div>
          <p>Hash ID:</p>
          <p><span>12345678923ddavfseerh</span> </p>
        </div>
        <div>
          <p>Payer Account:</p>
          <p style="color:#031633">Mastercard  **** 8111</p>
        </div>
      </div>
  </div>
</template>
<script>
import Clipboard from "clipboard";
export default {
  name:'buyDetails',
  props:{
    buyData:{
      type:Object
    }
  },
  methods:{
      copy(){
      //copy bank code
      let clipboard = new Clipboard('.copyView');
      clipboard.on('success', () => {
        this.$toast({
          duration: 3000,
          message: this.$t('nav.copyTips')
        });
        clipboard.destroy()
      })
      clipboard.on('error', () => {
        clipboard.destroy()
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.buyDetails-container{
  width: 100%;
  // height: auto !important;
  .buyDetails_title{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #D9D9D9;
    padding-bottom: .16rem;
    margin-top: .22rem;
    .line_left{
      color: #031633;
      font-size: .16rem;
      font-family: SFProDisplaybold;
    }
    .lineRight{
      
      font-family: SFProDisplayRegular;
      font-size: .13rem;
      display: flex;
      align-items: center;
      .Transferring{
        width: .04rem;
        height: .04rem;
        background: #0047AD;
        border-radius: 50%;
        margin-right: .04rem;
      }
      .Transferring_con{
        color: #0047AD;
      }
    }
  
  }
  .buyDetails_content{
    width: 100%;
    font-family: SFProDisplayRegular;
    .buyDetails_con{
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .16rem;
      font-size: .13rem;
      p:first-child{
        color: #6E7687;
        
      }
      p:last-child{
        color: #031633;
      }
    }
    
  }
  .buyDetails_OrderId{
      width: 100%;
      font-family: SFProDisplayRegular;
      background: #F4F5F7;
      padding: .23rem .16rem .01rem;
      border-radius: .06rem;
      margin-top: .58rem;
      >div{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: .19rem;
        p:nth-of-type(1){
          color: #6E7687;
          font-size: .13rem;
        }
        p:nth-of-type(2){
          color: #6E7687;
          font-size: .13rem;
          display: flex;
          align-items: center;
          img{
            width: .2rem;
          }
          span{
            width: 1.48rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-right: .02rem;
          }
        }
      }
    }
}
</style>