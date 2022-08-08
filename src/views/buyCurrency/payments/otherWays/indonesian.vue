<template>
  <div id="confirmPayment">
    <div id="confirmPayment-box" ref="box_ref" @scroll="handleScroll">
      <div class="confirmPayment-content" ref="form_ref">
        <div class="payTips" v-if="startPayment">{{ $t('nav.buy_configPayIDR_timeDownTips') }} <span>{{ paymentCountDownMinute }}</span></div>
        <div class="payAmountInfo-title">{{ $t('nav.buy_configPay_title1') }}</div>
        <div class="payAmountInfo-box">{{ parameter.payWayName }}</div>
        <!-- QRIS -->
        <div class="QRISView" v-show="parameter.payWayCode === '10004' && qrCodeState">
          <div class="QRISCode" ref="qrCodeUrl"></div>
          <div class="QRISText">{{ $t('nav.buy_configPayIDR_codeTips') }}</div>
        </div>
        <!-- OVO -->
        <div class="OVOView"  v-if="parameter.payWayCode === '10006'">
          <div class="payAmountInfo-title">{{ $t('nav.buy_configPayIDR_ovo_title') }}</div>
          <div class="payAmountInfo-box ovoPhone">
            <div class="region">+ 62</div>
            <div class="input">
              <van-field class="number_input" type="digit" v-model="phone" :disabled="ovoLoading" maxlength="12"/>
              <sapn class="loading" v-if="ovoLoading"><van-loading color="#1989fa" /></sapn>
            </div>
          </div>
        </div>
        <div class="ovoTips" v-if="parameter.payWayCode === '10006' && startPayment">{{ $t('nav.buy_configPayIDR_ovo_phoneTips') }}</div>
        <!-- 选择接收方式的网络地址和名称 -->
        <CryptoCurrencyAddress class="CryptoCurrencyAddress"/>
        <IncludedDetails class="IncludedDetails" ref="includedDetails_ref" :class="{'IncludedDetails_top': AuthorizationInfo_state===false}" :network="$store.state.buyRouterParams.network"/>
        <AuthorizationInfo class="AuthorizationInfo" :childData="childData" v-if="AuthorizationInfo_state"/>
        <!-- tips icon -->
        <transition>
          <div class="downTips-icon" v-show="goDown_state" @click="goDown"><img src="@/assets/images/downIcon.svg" ref="downTips_ref" alt=""></div>
        </transition>
      </div>
      <Button :buttonData="buttonData" :disabled="disabled" ref="button_ref" @click.native="submit"></Button>
      <div class="companyAddress">Alchemy GPS Europe UAB, Laisvés pr. 60, LT-05120 Vilnius</div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2';
import IncludedDetails from '@/components/IncludedDetails';
import CryptoCurrencyAddress from '@/components/CryptoCurrencyAddress';
import AuthorizationInfo from '@/components/AuthorizationInfo';
import { timeDown } from '@/utils/index';
import {querySubmitToken} from "../../../../utils/publicRequest";

export default {
  name: "otherWayPay",
  components: { IncludedDetails, CryptoCurrencyAddress, AuthorizationInfo },
  data(){
    return{
      parameter: {},

      phone: "",
      ovoLoading: false,

      qrCodeState: false,
      qrUrl: "",

      startPayment: false,

      paystateTimeOut: null,

      paymentCountDown: null,
      paymentCountDownNum: 900,
      paymentCountDownMinute: "15:00",

      //勾选协议
      childData: {
        agreement: false,
      },
      AuthorizationInfo_state: true,

      //按钮状态
      buttonData: {
        loading: false,
        triggerNum: 0,
        customName: false,
      },

      goDown_state: false,
      oldOffsetTop: 0,
      scrollTimeDown: null,
    }
  },
  beforeRouteLeave(to,from,next){
    if(to.path !== '/tradeHistory' && to.path !== '/paymentResult'){
      sessionStorage.removeItem("indonesiaPayment");
    }
    next()
  },
  mounted(){
    //初始化根据可视高度控制向下提示按钮状态
    setTimeout(()=>{
      if(this.$refs.box_ref.offsetHeight + 4 < document.getElementById("confirmPayment-box").scrollHeight - 50){
        this.goDown_state = true;
      }else{
          this.goDown_state = false;
      }
    })
    this.receiveInfo();
  },
  destroyed(){
    this.$store.commit("clearToken"); //取消请求
    this.$store.commit("emptyToken"); // 清空token数组
    window.clearInterval(this.paystateTimeOut);
    window.clearInterval(this.paymentCountDown);
    this.paystateTimeOut = null;
    this.paymentCountDown = null;
  },
  computed: {
    disabled() {
      if(this.childData.agreement === true && (this.parameter.payWayCode === '10005' || this.parameter.payWayCode === '10004')){
        return false;
      }else if(this.childData.agreement === true && this.phone !== '' && this.parameter.payWayCode === '10006'){
        return false;
      }else{
        return true;
      }
    }
  },
  methods: {
    receiveInfo(){
      this.parameter = this.$store.state.buyRouterParams;
      //Restore the data before refreshing the page
      if(sessionStorage.getItem("indonesiaPayment")) {
        let data = JSON.parse(sessionStorage.getItem("indonesiaPayment"));
        this.startPayment = true;
        this.paymentCountDownNum = data.paymentCountDownNum;
        this.paymentCountDownMinute = data.paymentCountDownMinute;
        this.refreshPaystate();
        //QRIS
        if(this.parameter.payWayCode === '10004'){
          this.qrCodeState = true;
          this.qrUrl = data.webUrl;
          this.generateQRcode();
        }
        //OVO
        if(this.parameter.payWayCode === '10006'){
          this.phone = data.phone;
          this.ovoLoading = true;
        }

        this.AuthorizationInfo_state = data.AuthorizationInfo_state;
        this.childData = {
          agreement: true,
        };
        this.buttonData = {
          loading: true,
          triggerNum: 1,
          customName: false,
        };
      }
    },

    generateQRcode(){
      this.$nextTick(()=>{
        new QRCode(this.$refs.qrCodeUrl, {
          text: this.qrUrl,
          width: 140,
          height: 140,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        })
      })
    },

    async submit(){
      if(this.childData.agreement === false){
        return;
      }
      if(this.buttonData.triggerNum === 1){
        this.AuthorizationInfo_state = false;
        await this.pay();
      }else{
        this.requestStatus();
      }
    },
    async pay(){
      let submitToken = await querySubmitToken();
      if(submitToken === true){
        //DANA、QRIS
        var params = {
          orderNo: this.$store.state.buyRouterParams.orderNo,
          lastname: "11111"
        }
        //OVO
        if(this.parameter.payWayCode === '10006'){
          params.phone = this.phone;
          this.ovoLoading = true;
        }
        this.$axios.post(this.$api.post_indonesiaBuy,params,'submitToken').then(res=>{
          if(res && res.returnCode === '0000'){
            this.storeData(res);
            //Happy countdown refresh order status
            this.startPayment = true;
            this.refreshPaystate();
            //QRIS
            if(this.parameter.payWayCode === '10004'){
              this.qrCodeState = true;
              this.qrUrl = res.data.webUrl;
              this.generateQRcode();
              return;
            }
            //DANA
            if(this.parameter.payWayCode === '10005'){
              window.location = res.data.webUrl;
              return;
            }
            //OVO
            if(this.parameter.payWayCode === '10006'){
              this.ovoLoading = true;
              return;
            }
          }else{
            this.startPayment = false;
          }
        })
      }
    },

    //Store data to prevent page refresh
    storeData(){
      let newData = {};
      newData.webUrl = this.qrUrl;
      newData.phone = this.phone;
      newData.paymentCountDownMinute = this.paymentCountDownMinute;
      newData.paymentCountDownNum = this.paymentCountDownNum;
      newData.AuthorizationInfo_state = this.AuthorizationInfo_state;
      sessionStorage.setItem("indonesiaPayment",JSON.stringify(newData));
    },

    refreshPaystate(){
      //15 minutes order countdown
      this.paymentCountDown = setInterval(()=>{
        //order overtime
        if(this.paymentCountDownNum === 0){
          this.$router.replace(`/paymentResult?customParam=${this.$store.state.buyRouterParams.orderNo}`);
        }
        this.paymentCountDownMinute = timeDown(this.paymentCountDownNum);
        this.paymentCountDownNum -= 1;
        this.storeData();
      },1000);
      //Refresh payment status
      this.requestStatus();
      this.paystateTimeOut = setInterval(()=>{
        this.requestStatus();
      },1000);
    },
    requestStatus(){
      let params = {
        "orderNo": this.$store.state.buyRouterParams.orderNo
      }
      this.$axios.get(this.$api.get_payResult,params).then(res=>{
        if(res && res.returnCode === '0000' && (res.data.orderStatus === 0 || (res.data.orderStatus > 2 && res.data.orderStatus <= 6))){
          this.$parent.$parent.tipsState = false;
          this.$router.replace(`/paymentResult?customParam=${this.$store.state.buyRouterParams.orderNo}`);
        }
      })
    },

    //按钮进入可视区域，隐藏滚动到底部按钮
    handleScroll(val){
      window.clearTimeout(this.scrollTimeDown);
      this.scrollTimeDown = null;
      let offset = this.$refs.button_ref.$refs.buttonChild_ref.getBoundingClientRect();

      //滚动的像素+容器的高度>可滚动的总高度-50像素
      if(this.oldOffsetTop !== offset.top && (val.srcElement.scrollTop+val.srcElement.offsetHeight<val.srcElement.scrollHeight - 50)){
        this.goDown_state = false;
        window.clearTimeout(this.scrollTimeDown);
        this.scrollTimeDown = null;
        this.scrollTimeDown = setTimeout(()=>{
          this.goDown_state = true;
        },1000)
      }

      if(val.srcElement.scrollTop+val.srcElement.offsetHeight>val.srcElement.scrollHeight - 50) {
        window.clearTimeout(this.scrollTimeDown);
        this.scrollTimeDown = null;
        this.goDown_state = false;
      }
      this.oldOffsetTop = offset.top;
    },
    goDown(){
      setTimeout(()=>{
        this.$refs.button_ref.$refs.buttonChild_ref.scrollIntoView({behavior: "smooth", block: "end", inline: 'end'})
        this.goDown_state = false;
      })
    },
  },
}
</script>

<style lang="scss" scoped>
#confirmPayment-box{
  position: relative;
  height: 100%;
  overflow-y: auto;
  .payTips{
    padding: 0.1rem 0;
    font-size: 0.13rem;
    font-family: "GeoLight", GeoLight;
    font-weight: normal;
    color: #232323;
    span{
      color: #E55643;
    }
  }
  .payAmountInfo-title{
    font-size: 0.13rem;
    font-family: "GeoRegular", GeoRegular;
    font-weight: normal;
    color: #707070;
    margin-top: 0.32rem;
  }
  .payAmountInfo-box {
    margin-top: 0.08rem;
    height: 0.56rem;
    background: #F3F4F5;
    border-radius: 0.12rem;
    font-size: 0.16rem;
    font-family: "GeoRegular", GeoRegular;
    font-weight: normal;
    color: #232323;
    line-height: 0.6rem;
    padding: 0 0.16rem;
  }
}

.QRISView{
  .QRISCode{
    min-height: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.16rem;
  }
  .QRISText{
    font-size: 0.13rem;
    font-family: "GeoLight", GeoLight;
    font-weight: normal;
    color: #232323;
    text-align: center;
    margin-top: 0.08rem;
  }
}

.ovoPhone{
  display: flex;
  align-items: center;
  min-height: 0.3rem !important;
  line-height: 0.33rem !important;
  padding: 0.15rem 0 !important;
  .region{
    min-width: 0.75rem;
    text-align: center;
    border-right: 1px solid #E6E6E6;
    font-size: 0.16rem;
    font-family: "GeoRegular", GeoRegular;
    font-weight: normal;
    color: #232323;
  }
  .input{
    width: 100%;
    display: flex;
    position: relative;
    input{
      display: flex;
      padding: 0 0.16rem;
      border: none;
      width: 100%;
      background: #F3F4F5;
      font-size: 0.16rem;
      font-family: "GeoRegular", GeoRegular;
      font-weight: normal;
      color: #232323;
      letter-spacing: 4px;
    }
  }
  .loading{
    position: absolute;
    top: 0.07rem;
    right: 0.16rem;
    width: 0.24rem;
    height: 0.24rem;
  }
}
.ovoTips{
  font-size: 0.15rem;
  font-family: "GeoRegular", GeoRegular;
  font-weight: normal;
  color: #0059DA;
  margin-top: 0.08rem;
}

.CryptoCurrencyAddress{
  margin-top: 0.2rem;
}

.IncludedDetails{
  margin-top: 0.1rem;
}

.AuthorizationInfo{
  margin-top: 0.16rem;
  //margin-bottom: 0.2rem;
}

.number_input{
  background: #F3F4F5;
}
.number_input ::v-deep .van-field__control{
  letter-spacing: 4px !important;
}

.downTips-icon{
  position: absolute;
  bottom: 1.1rem;
  right: 0;
  width: 0.58rem;
  height: 0.58rem;
  border-radius: 50%;
  //background: #0059DA;
  background: rgba(131,179,249,1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  img{
    width: 0.3rem;
  }
}
.downTips-icon img{
  animation: jumpBoxHandler 1.8s infinite;/* 1.8s 事件完成时间周期 infinite无限循环 */
}
.v-enter-active,.v-leave-active{
  transition: all 1s;
}
.v-enter,.v-leave-to{
  opacity: 0;
}
.v-enter-to,.v-leave{
  opacity: 0.8;
}
@keyframes jumpBoxHandler { /* css事件 */
  0% {
    transform: translate(0px, 0);
  }
  50% {
    transform: translate(0px, 0.06rem); /* 可配置跳动方向 */
  }
  100% {
    transform: translate(0px, 0px);
  }
}

//二维码
.QRISCode:hover{
  pointer-events: none;
}

.companyAddress{
  width: 100%;
  font-size: 0.13rem;
  font-family: "GeoLight", GeoLight;
  font-weight: normal;
  color: #c2c2c2c2;
  text-align: center;
  margin-top: 0.12rem;
}
</style>
