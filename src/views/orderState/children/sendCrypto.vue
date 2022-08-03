<template>
  <div class="sendCrypto-container" >
    <div class="sendCrypto_nav">
      <div class="sendCrypto_nav_left" @click="buttonNext('goHome')">
        <img src="@/assets/images/goBack.png" alt="">
        <p>Sell {{orderStateData.cryptocurrency}}</p>
      </div>
          <div class="sendCrypto_nav_right" >
            <img class="menu" style="height:.18rem;cursor: pointer;" src="@/assets/images/meun-icon.png" v-if="this.$parent.$parent.routerViewState" @click="openMenu">
          </div>
      </div>
    <div v-if="[0,1].includes(orderStateData.orderStatus)">
      <div>
        <div class="sendCrypto_title">
      <p>{{ $t('nav.home_sellFee_title1') }}  <span> {{ $store.state.sellRouterParams.amount }} {{ $store.state.sellRouterParams.cryptoCurrency }}</span>  {{ $t('nav.home_sellFee_title2') }} <span> {{ feeInfo.fiatSymbol }} {{ amountFee }}  </span> </p>
      <p style="display:flex;justify-content:space-between;width:.37rem"><img  src="@/assets/images/timeSell.svg" alt=""><span >{{ timerNumber }} </span> s</p>

    </div>
    <div class="sendCrypto_title" style="margin-top:.16rem">
      <p>{{ $t('nav.home_buyFee_rampFee') }} </p>
      <p style="color:#063376">{{ feeInfo.fiatSymbol }} {{ rampFeeSell }}</p>
    </div>
    <div class="sendCrypto_title" style="margin-top:.16rem">
      <p >{{ $t('nav.Sellorder_Id') }}</p>
      <p style="cursor: pointer;" class="order-con" @click="copy" :data-clipboard-text="orderStateData.orderId">
        <span style="width:2rem;overflow:hidden;font-style: normal;text-overflow: ellipsis;text-align:right" >{{ orderStateData.orderId }}</span>
        <img style="height:.2rem;margin-left:.08rem;flex:1" src="@/assets/images/copySell.png" alt="">
      </p>
    </div>
    <div class="sendCrypto_qrcode">
      <p >{{ $t('nav.Sellorder_transfer') }} {{orderStateData.cryptocurrency}} {{ $t('nav.Sellorder_within') }} <span>{{ turnMinute(orderStateData.expirationTime) }}</span></p>
      <div ref="qrCodeUrl" class="qrCodeUrl"></div>
    </div>
    <div class="sendCrypto_content" style=" align-items: center;">
      <div class="title">{{ $t('nav.Sellorder_Address') }} ({{orderStateData.cryptocurrency}})</div>
      <div class="content order-con" @click="copy" :data-clipboard-text="orderStateData.address">
        <p style="max-width:2.5rem;white-space: normal;overflow:hidden;overflow:hidden;font-style: normal;text-overflow: ellipsis; " >{{ orderStateData.address }}</p>
        <img style="height:.2rem" src="@/assets/images/copySell.png" alt="">
      </div>
    </div>
    <div class="sendCrypto_content">
      <div class="title">{{  $t('nav.Sellorder_Network') }}</div>
      <div class="content" @click="Network_show = true">
        <p >{{ orderStateData.networkName }}</p>
        <img style="height:.2rem" src="@/assets/images/SelectNetwork.png" alt="">
      </div>
    </div>
    <div class="sendCrypto_bottom_title">{{ $t('nav.sell_Order_network_selected') }}</div>
      </div>
      <div class="sendCrypto_button" @click="buttonNext('button')"><!-- transferredShow=true -->
      <div>
          {{ $t('nav.Sell_Order_haveSent') }} {{orderStateData.cryptocurrency}}
          <img src="@/assets/images/rightIconSell.png" alt="">
      </div>
    </div>
    </div>

    <div v-else-if="orderStateData.orderStatus == 7 || orderStateData.expirationTime == 0" class="sendCrypto_timeError">
      <div class="sendCrypto_title" style="margin-top:.42rem">
      <p >{{ $t('nav.Sellorder_Id') }}</p>
      <p style="cursor: pointer;" class="order-con" @click="copy" :data-clipboard-text="orderStateData.orderId">
        <span style="width:2rem;overflow:hidden;font-style: normal;text-overflow: ellipsis;text-align:right">{{ orderStateData.orderId }}</span>
        <img style="height:.2rem;margin-left:.08rem;flex:1" src="@/assets/images/copySell.png" alt="">
      </p>
    </div>
    <div class="sendCrypto_content1">
      <img src="@/assets/images/SellOrderTime.svg" alt="">
      <p style="color:#6E7687">Your order has expired, please do not send money to this address, otherwise the asset may be lost.</p>
    </div>
    <div class="sendCrypto_button" @click="$router.replace('/')">
      <div>
          Back to Home page
          <img src="@/assets/images/rightIconSell.png" alt="">
      </div>
    </div>
    </div>
    <!-- 二次确认弹框-->
    <div v-else></div>
    <div class="sendCrypto_confing" v-show="transferredShow" >
      <!-- <div class="content" v-if="confirmSecondary" key="goback">
        <p style="height:.5rem">If you leave the current page, this order will be automatically closed. Are you sure to stop this order?</p>
        <div>
          <p @click.stop="confirmSell">{{ $t('nav.Confirm') }}</p>
          <p @click.stop="transferredShow = false">Cancel</p>
        </div>
      </div> -->
      <div class="content" key="next">
        <p style="height:.5rem">{{ $t('nav.Sell_Order_transferred') }}</p>
        <div>
          <p @click.stop="confirmSell">{{ $t('nav.Confirm') }}</p>
          <p @click.stop="transferredShow = false">Not Yet</p>
        </div>
      </div>
    </div>

   <div class="sendCrypto_bottom" v-show="Network_show" @click.stop="Network_show = false">

   </div>
   <div :class="!Network_show?'sendCrypto_bottomContent':'sendCrypto_bottomContent sendCrypto_bottomContentActive'" >
       <div class="Network-title" >{{ $t('nav.Sellorder_Network') }} <div style="padding:.1rem" @click="Network_show = false"><img style="width:.22rem;"  src="@/assets/images/ShutDown.png" alt=""></div></div>
       <div class="Network-content" v-for="item in Sellorder_NetworkList?Sellorder_NetworkList:''" :key="item.id" @click="networkSelect(item)">{{ item.networkName }} <img :src="item.networkName==orderStateData.networkName?NetworkCheck:''" alt=""></div>
     </div>
  </div>
</template>
<script>
import Clipboard from 'clipboard'
import QRCode from 'qrcodejs2';
export default {

  name:'sendCrypto',
  props:{
    orderStateData:{
      default:''
    }
  },
  data(){
    return{
      transferredShow:false,
      Network_show:false,
      timeText:'',
      Sellorder_NetworkList:'',
      NetworkCheck:require('@/assets/images/cardCheckIcon.png'),
      feeInfo:'',
      timerNumber:15,
      timeOut:null,
      //二次确认的显示隐藏
      confirmSecondary:true
    }
  },
  mounted(){
    // this.$parent.routerViewState = true
    setTimeout(() => {
      if(this.orderStateData.orderStatus == 7 || this.orderStateData.expirationTime == 0){
        return false
      }
      this.getNetworkList()
    }, 1000);
    this.queryFee()
    if((this.orderStateData.orderStatus === 7 && this.$store.state.nextOrderState ==1 )|| (this.$store.state.nextOrderState ==1&& this.orderStateData.expirationTime <=0)){
      return
    }
    if(this.timerNumber >= 0 ){
        clearInterval(this.timeOut)
       this.timeOut =  setInterval(()=>{
          this.timerNumber--
          if(this.timerNumber< 0 && [0,1].includes(this.orderStateData.orderStatus)){
            this.queryFee()
            this.timerNumber = 15
          }else if(this.orderStateData.orderStatus === 7 ||  this.orderStateData.expirationTime <=0){
            clearInterval(this.timeOut)
          }
        },1000)
      }


  },

  activated(){

    //网络列表延迟请求
    setTimeout(() => {

      this.getNetworkList()
    }, 1000);
    this.queryFee()
     if((this.orderStateData.orderStatus === 7 && this.$store.state.nextOrderState ==1 )|| (this.$store.state.nextOrderState ==1&& this.orderStateData.expirationTime <=0)){
      return
    }
    this.timerNumber = 15
    if(this.timerNumber >= 0 ){
        clearInterval(this.timeOut)
       this.timeOut =  setInterval(()=>{
          this.timerNumber--
          if(this.timerNumber< 0 && [0,1].includes(this.orderStateData.orderStatus)){
            this.queryFee()
            this.timerNumber = 15
          }else if(this.orderStateData.orderStatus === 7 ||  this.orderStateData.expirationTime <=0){
            clearInterval(this.timeOut)
          }
        },1000)
      }
  },
  deactivated(){
    this.timerNumber = 15
    clearInterval(this.timeOut)
  },
  destroyed(){
    clearInterval(this.timeOut)

  },
  methods:{
    //确认切换
    confirmSell(){

      this.transferredShow = false


      this.$store.state.nextOrderState = 2
    },
    //复制
    copy(){
        let clipboard = new Clipboard('.order-con');
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
    //二维码
    generateQRcode(){
      // console.log(this.orderStateData.orderStatus);
    if(this.orderStateData.orderStatus==1 || this.orderStateData.orderStatus==0){
       this.$refs.qrCodeUrl.innerHTML = "";
      new QRCode(this.$refs.qrCodeUrl, {
        text: this.orderStateData.address,
        width: '140',
        height: '140',
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
      return
    }

    },
    //获取网络列表
     async  getNetworkList(){
        // console.log();
      let params = {
        coin:this.$store.state.sellRouterParams.cryptoCurrency
      }
      let res  = await this.$axios.get(this.$api.get_networkList,params)
      if(res.data && res.returnCode === '0000')
      this.Sellorder_NetworkList =  res.data
     },
     //Calculate minutes and seconds
    turnMinute(value){
      if(value >= 0){
        var num = value;
        return '0'.repeat(2 - String(Math.floor(num / 3600)).length) + Math.floor(num / 3600) + ':' + '0'.repeat(2 - String(Math.floor((num%3600) / 60)).length) + Math.floor((num%3600) / 60) + ':' + '0'.repeat(2 - String(Math.floor((num%3600) % 60)).length) + Math.floor((num%3600) % 60)

      }
    },
    //确认网络
    networkSelect(val){
      if(this.orderStateData.network===val.network){
        this.Network_show = false
        return false
      }
       let params = {
        // id:'15',
        orderId:this.orderStateData.orderId,
        network:val.network//val.networkName
      }
      this.Network_show = false
      this.$axios.post(this.$api.post_sellSelectNet,params).then(res=>{
        if(res && res.data){
          this.Network_show = false
          if(res.data.status==1){
            this.$toast('Your order is below its minimum amount')
            return
          }else if(res.data.status==2){
            this.$toast('Your order is higher than its maximum amount')
            return
          }else{
            // this.$toast('success')
            return
          }
        }
      })
    } ,

     //费率刷新
    queryFee(){

      let patams = JSON.parse(JSON.stringify(this.$store.state.feeParams_order))

       this.$axios.get(this.$api.get_sellRampfee,patams).then(res=>{
         if(res && res.returnCode === "0000"){
          this.feeInfo = res.data;
            //手续费
          this.feeInfo.rampFee = (this.$store.state.sellRouterParams.amount * this.feeInfo.price * this.feeInfo.percentageFee + this.feeInfo.fixedFee) * this.feeInfo.rate;
            //换算成法币的钱
            this.feeInfo.amount = (this.$store.state.sellRouterParams.amount *this.feeInfo.price *this.feeInfo.rate) -this.feeInfo.rampFee
         }
       })
    },
    //打开菜单栏
    openMenu(){
      this.$parent.$parent.routerViewState === true ? this.$parent.$parent.routerViewState = false : this.$parent.$parent.routerViewState = true;
    },
    //进行返回首页或者下一步的显示隐藏
    buttonNext(val){
      if(val == 'button'){
        this.transferredShow = true
        this.confirmSecondary =false
        return
      }

      if(val === 'goHome'){
        this.$router.replace('/')
        return
      }else  if(this.$store.state.sellRouterParams.historyBack == 'back'){
         this.$router.go(-1)
         this.$store.state.sellRouterParams.historyBack = ''
      }
    }

  },
  watch:{
    'orderStateData.address':{
      immediate:true,
      deep:true,
      handler(newVal,oldVal){
        if(newVal !== oldVal){
          this.$nextTick(()=>{
            this.generateQRcode()
          })
        }
      }
    }
  },
  computed:{
    //卖币法币价格
    amountFee(){
      let decimalDigits = 0;
      let resultValue = parseFloat(this.feeInfo.amount);
      resultValue >= 1 ? decimalDigits = 2 : decimalDigits = 6;
      let rampFee = resultValue.toFixed(decimalDigits);
      isNaN(resultValue) || rampFee <= 0 ? rampFee = 0 : '';

      return rampFee
    },
    //卖币手续费
    rampFeeSell(){
      let decimalDigits = 0;
      let resultValue = parseFloat(this.feeInfo.rampFee);
      resultValue >= 1 ? decimalDigits = 2 : decimalDigits = 6;
      let rampFee = resultValue.toFixed(decimalDigits);
      isNaN(resultValue) || rampFee <= 0 ? rampFee = 0 : '';

      return rampFee
    }
  },
}
</script>
<style lang="scss" scoped>

.sendCrypto-container{
  width: 100%;

  // padding-bottom: .6rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: .0rem 0 .6rem 0;
 .sendCrypto_timeError{
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   .sendCrypto_content1{
     width: 100%;
     text-align: center;
     margin-top: .2rem;
     border-top: 1px solid #D9D9D9;
     >img{
       height: 1.58rem;
       margin: .8rem 0 .2rem;
     }
     p{
       text-align: justify;
       font-style: normal;
       font-size: .13rem;
       line-height: .18rem;
       color: #6E7687;
     }
   }
 }
 .sendCrypto_nav{
   width: 100%;
   padding: .1rem 0 .1rem;
   background: #FFFFFF;
   display: flex;
   justify-content: space-between;
   align-items: center;
   position:sticky;
   top:0;
   >img{
       width: .19rem;
       cursor: pointer;
     }
   .sendCrypto_nav_left{
     display: flex;
     cursor: pointer;
     img{
      //  width: .12rem;
       height: .22rem;
      //  margin-top: .01rem;
     }
     p{
       margin-left: .04rem;
       font-size: .18rem;
       color: #031633;
       font-family: SFProDisplaybold;
       margin-top: .01rem;
       white-space: nowrap;
     }
   }
 }

  .sendCrypto_title{
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-between;
    font-size: .13rem;
    color: #6E7687;
    margin-top: .35rem;
    font-family: SFProDisplayRegular;
    p:first-child{

      font-style: normal;
      span{
        color: rgba(6, 51, 118, 1);
        margin: 0 .04rem 0;
      }
    }
    p:last-child{
      display: flex;
      align-items: center;
      font-size: .13rem;
      font-style: normal;
      img{
        height: .14rem;
      }
    }
  }
  .sendCrypto_qrcode{
    width: 100%;
    margin-top: .24rem;
    background: #F4F5F7;
    border-radius: .06rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: .2rem;
    font-family: SFProDisplayRegular;
    p{
      font-size: .13rem;
      color: #6E7687;
      margin: .2rem 0 .16rem 0;
      text-align: center;
      display: flex;
      align-items: center;
      span{
        width: .54rem;
        color: #FF2C2C;
      }
    }
  }
  .sendCrypto_content{
    width: 100%;
    cursor: pointer;
    margin-top: .24rem;
    font-family: SFProDisplayRegular;
    .title{
      font-size: .13rem;
      font-style: normal;
      color: #6E7687;
      font-weight: 400;
    }
    .content{
      width: 100%;
      height: .56rem;
      background: #F4F5F7;
      font-size: .16rem;
      color: #6E7687;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: .08rem;
      padding: 0 .16rem 0 .16rem;
      border-radius: .06rem;
      img{
        height: .2rem;
      }
    }
  }
  .sendCrypto_bottom_title{
    font-size: .13rem;
    color: #94ACBA;
    font-style: normal;
    line-height: .18rem;
    margin-top: .08rem;
    font-family: SFProDisplayRegular;
  }
  .sendCrypto_button{
    width: 90%;
    height: .65rem;
    background: #FFFFFF;
    padding-top: .07rem;
    
    div{
      width: 100%;
      height: .58rem;
       background: #0059DA;
      color: #FFFFFF;
      border-radius: .3rem;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-family: SFProDisplaybold;
    }

    position: absolute;
    bottom: .2rem;
    left: 5%;
    img{
      height: .2rem;
      margin-left: .12rem;
      margin-top: .02rem;
    }
  }
  .sendCrypto_confing{
    width: 100%;
    height: 100%;
    position: fixed;
    background: rgba(0, 0, 0, 0.15);
    left: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    .content{
      width: 3.45rem;
      height: 1.95rem;
      background: #FFFFFF;
      border-radius: .18rem;
      padding: .32rem .16rem;

      >p{
        text-align: center;
        color: #6E7687;
        font-size: .16rem;
        line-height: .24rem;
        font-family: "SFProDisplayRegular";
      }
      >div{
        display: flex;
        margin-top: .3rem;
        p:first-child{
          width: 1.5rem;
          height: .5rem;
          background: #0059DA;
          border-radius: .25rem;
          color: #FFFFFF;
          line-height: .5rem;
          text-align: center;
          margin-right: .1rem;
          cursor: pointer;
          font-family: SFProDisplaybold;
        }
        p:last-child{
          width: 1.5rem;
          height: .5rem;
          color: #031633;
          text-align: center;
          line-height: .5rem;
          background: #FFFFFF;
          border: 1px solid #EEEEEE;
          border-radius: .25rem;
          cursor: pointer;
          font-family: SFProDisplaybold;
        }
      }
    }
  }
  .sendCrypto_bottom{
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.15);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1;

  }
  .sendCrypto_bottomContent{
    width: 100%;
    min-height: 5rem;
    background: #FFFFFF;
    padding:  0 .3rem .3rem .3rem;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translate(0,5rem);
    border-radius: .2rem .2rem 0 0 ;
    box-shadow: 0px -8px 20px rgba(0, 89, 218, 0.08);
    z-index: 2;
    transition: .5s ;

    .Network-title{
      font-size: .18rem;
      color: #031633;
      text-align: center;
      margin: .3rem 0 .3rem;
      position: relative;
      font-weight: 500;
       font-family: SFProDisplaybold;
      div{
         position: absolute;
          right: -.1rem;
          top: -.1rem;
          cursor: pointer;
        img{
          width: .2rem;
        }
      }
    }
    .Network-content{
      width: 100%;
      // height: .35rem;
      border-bottom: 1px solid #D9D9D9;
      padding: .16rem 0 .16rem;
      color: #6E7687;
      font-size: .16rem;
      display: flex;
      line-height: .19rem;
      justify-content: space-between;
      align-items: center;
       font-family: SFProDisplayRegular;
       font-weight: 400;
      cursor: pointer;
      img{
        height: .15rem;
      }
    }
  }
  .sendCrypto_bottomContentActive{
    transform: translate(0,0rem) !important;
    transition: .5s;
  }

}
</style>
