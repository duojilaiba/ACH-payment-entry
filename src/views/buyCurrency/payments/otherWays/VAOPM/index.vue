<template>
  <div id="indonesianPayment">
    <div id="indonesianPayment-box" ref="box_ref" @scroll="handleScroll">
      <div class="view-content" ref="form_ref">
        <!-- 支付倒计时提示 -->
        <div class="payTips" v-if="startPayment && routerParams.payWayCode === '10003'">{{ $t('nav.buy_configPayIDR_timeDownTips') }} <span>{{ paymentCountDownMinute }}</span></div>
        <!-- 费用明细 -->
        <!-- 支付方式 10003-Virtual Account | 10008-OPM -->
        <div class="payAmountInfo-title">{{ $t('nav.buy_configPay_title1') }}</div>
        <div class="payAmountInfo-box" v-if="routerParams.payWayCode === '10003'">Virtual Account</div>
        <div class="payAmountInfo-box" v-else-if="routerParams.payWayCode === '10008'">OPM</div>
        <!-- 支付方式 VA-Virtual Account | OPM-->
        <VA ref="va_ref" v-if="routerParams.payWayCode === '10003'"/>
        <OPM ref="opm_ref" v-else-if="routerParams.payWayCode === '10008'"/>
        <CryptoCurrencyAddress/>
        <IncludedDetails class="includedDetails" ref="includedDetails_ref" :network="$store.state.buyRouterParams.network"/>
        <AuthorizationInfo class="authorizationInfo" :childData="childData" v-if="AuthorizationInfo_state"/>
        <!-- 墨西哥支付确认弹框 -->
        <div class="routerMenu_loginOut" v-show="MEXConfirmState" @click="MEXConfirmState=false">
          <div class="content" @click.stop="show=true">
            <h2>{{ $t('nav.buy_configPay_title3') }}</h2>
            <div class="options">
              <div @click="MEXConfirmOut">{{ $t('nav.buy_configPay_title4') }}</div>
              <p @click.stop="MEXConfirmState=false">{{ $t('nav.buy_configPay_title5') }}</p>
            </div>
          </div>
        </div>
        <!-- tips icon -->
        <transition>
          <div class="downTips-icon" v-show="goDown_state" @click="goDown"><img src="@/assets/images/downIcon.svg" ref="downTips_ref" alt=""></div>
        </transition>
      </div>
      <!-- 墨西哥支付按钮 -->
      <button class="continue" @click="MEXConfirmState = true" v-if="routerParams.payWayCode === '10008'" ref="button_ref">
        {{ $t('nav.queryOderState') }}
        <img class="rightIcon" src="@/assets/images/button-right-icon.svg">
      </button>
      <!-- I confirm that the payment has been completed.-->
      <Button :buttonData="buttonData" :disabled="payState" @click.native="submit" ref="button_ref" v-else></Button>
      <div class="companyAddress">Alchemy GPS Europe UAB, Laisvés pr. 60, LT-05120 Vilnius</div>
    </div>
  </div>
</template>

<script>
import { querySubmitToken } from "../../../../../utils/publicRequest";
import CryptoCurrencyAddress from '@/components/CryptoCurrencyAddress';
import AuthorizationInfo from '@/components/AuthorizationInfo';
import IncludedDetails from '@/components/IncludedDetails';
import VA from './VA';
import OPM from './OPM';

export default {
  name: "otherWays-VA",
  components: { VA, OPM, CryptoCurrencyAddress, AuthorizationInfo, IncludedDetails },
  data(){
    return{
      routerParams: {},

      //VA支付卡信息
      payExplain: [],

      //卡验证码 - 功能:复制验证码
      payCode: '',
      //支付倒计时
      paymentCountDownMinute:  "15:00",
      //支付倒计时状态
      startPayment: false,

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

      MEXConfirmState: false,

      goDown_state: false,
      oldOffsetTop: 0,
      scrollTimeDown: null,
    }
  },
  computed: {
    //确认按钮状态
    payState() {
      // pay methods 10003-Virtual Account | 10008-OPM
      if(this.routerParams.payWayCode === '10003'){
        if(this.payExplain.length !== 0 && this.childData.agreement === true){
          return  false;
        }
        return true;
      }
      if(this.routerParams.payWayCode === '10008' && this.childData.agreement === true){
        return false;
      }else if(this.routerParams.payWayCode === '10008' && this.childData.agreement === false){
        return true;
      }
    }
  },
  mounted(){
    //初始化根据可视高度控制向下提示按钮状态
    setTimeout(()=>{
      if(this.$refs.box_ref.offsetHeight + 4 < document.getElementById("indonesianPayment-box").scrollHeight - 50){
        this.goDown_state = true;
      }else{
        this.goDown_state = false;
      }
    })
    this.receiveInfo();
  },
  methods: {
    receiveInfo(){
      this.routerParams = this.$store.state.buyRouterParams;
      if(this.routerParams.payWayCode === '10008' && !sessionStorage.getItem("indonesiaPayment")) {
        this.MEXPay();
      }
      //还原刷新前数据状态
      if(sessionStorage.getItem("indonesiaPayment")) { // && this.routerParams.payWayCode === '10003'
        this.payExplain = JSON.parse(sessionStorage.getItem("indonesiaPayment"));
        this.AuthorizationInfo_state = JSON.parse(sessionStorage.getItem("indonesiaPayment")).AuthorizationInfo_state;
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
    async submit(){
      if(this.childData.agreement === false){
        return;
      }
      if(this.buttonData.triggerNum === 1){
        await this.pay();
      }else{
        this.requestStatus();
      }
    },
    async pay(){
      // pay methods 10003-Virtual Account | 10008-OPM
      let submitToken = await querySubmitToken();
      if(submitToken === true && this.routerParams.payWayCode === '10003'){
        this.AuthorizationInfo_state = false;
        this.$refs.va_ref.VAPay();
        return;
      }
    },
    //墨西哥支付
    async MEXPay(){
      let submitToken = await querySubmitToken();
      if(submitToken === true){
        this.AuthorizationInfo_state = false;
        this.$refs.opm_ref.OPMpay();
      }
    },
    async MEXConfirmOut(){
      this.$router.push('/tradeHistory');
    },
    //order status
    requestStatus(){
      let params = {
        "orderNo": this.$store.state.buyRouterParams.orderNo
      }
      this.$axios.get(this.$api.get_payResult,params).then(res=>{
        if(res && res.returnCode === '0000' && res.data.orderStatus > 2 && res.data.orderStatus <= 6){
          this.$parent.$parent.tipsState = false;
          this.$router.replace(`/paymentResult?customParam=${this.$store.state.buyRouterParams.orderNo}`);
        }
      })
    },

    //按钮进入可视区域，隐藏滚动到底部按钮
    handleScroll(val){
      window.clearTimeout(this.scrollTimeDown);
      this.scrollTimeDown = null;

      let offset = '';
      if(this.routerParams.payWayCode === '10008'){
        offset = this.$refs.button_ref.getBoundingClientRect();
      }else{
        offset = this.$refs.button_ref.$refs.buttonChild_ref.getBoundingClientRect();
      }

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
        if(this.routerParams.payWayCode === '10008'){
          this.$refs.button_ref.scrollIntoView({behavior: "smooth", block: "end", inline: 'end'})
        }else{
          this.$refs.button_ref.$refs.buttonChild_ref.scrollIntoView({behavior: "smooth", block: "end", inline: 'end'})
        }
        this.goDown_state = false;
      })
    },
  },
  destroyed() {
    this.$store.commit("clearToken"); //取消请求
    this.$store.commit("emptyToken"); // 清空token数组
  }
}
</script>

<style lang="scss" scoped>
#indonesianPayment-box{
  height: 100%;
  overflow-y: auto;
  .payTips{
    margin: 0.08rem 0 0.1rem 0;
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
    padding-top: 0.32rem !important;
  }

  .payAmountInfo-box {
    margin-top: 0.1rem;
    min-height: 0.56rem;
    background: #F3F4F5;
    border-radius: 0.12rem;
    font-size: 0.16rem;
    font-family: 'Jost', sans-serif;
    font-weight: 500;
    color: #232323;
    line-height: 0.6rem;
    padding: 0 0.16rem;
  }

  .includedDetails{
    margin-top: 0.1rem;
  }
  .authorizationInfo{
    margin-bottom: 0.2rem;
  }

  .routerMenu_loginOut{
    z-index: 1;
    width: 100%;
    height: 100%;
    background: #00000080;
    position: fixed;
    left: 0;
    top: 0;
    .content{
      width: 100%;
      max-width: 3.5rem;
      background: #FFFFFF;
      border-radius: 0.16rem;
      position: absolute;
      left:50%;
      top: 50%;
      transform: translate(-50%,-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.32rem 0.16rem;
      box-sizing: border-box;
      h2{
        width: 90%;
        text-align: center;
        font-weight: normal;
        color: #232323;
        line-height: .31rem;
        font-family: GeoDemibold;
        font-size: .21rem;
      }
      .options{
        width: 90%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 0.32rem;
        div{
          flex: 1;
          height: .5rem;
          background: #E55643;
          border-radius: .25rem;
          text-align: center;
          line-height: .5rem;
          position: relative;
          font-size: .16rem;
          font-weight: normal;
          color: #FFFFFF;
          font-family: SFProDisplayMedium;
          cursor: pointer;
          margin-right: 0.13rem;
        }
        p{
          flex: 1;
          border: 1px solid #D9D9D9;
          border-radius: .25rem;
          height: .5rem;
          line-height: 0.5rem;
          text-align: center;
          font-weight: normal;
          color: #232323;
          font-family: SFProDisplayMedium;
          font-size: .16rem;
          cursor: pointer;
        }
      }
    }
  }
  .continue{
    width: 100%;
    height: 0.58rem;
    background: #0059DA;
    border-radius: 0.29rem;
    font-size: 0.17rem;
    font-family: "GeoRegular", GeoRegular;
    font-weight: normal;
    color: #FFFFFF;
    margin-top: 0.16rem;
    cursor: pointer;
    border: none;
    position: relative;
    .rightIcon{
      width: 0.24rem;
      position: absolute;
      top: 0.17rem;
      right: 0.16rem;
      font-size: 0.12rem;
    }
    .loadingIcon{
      top: 0.15rem;
    }
  }
  .continue:disabled{
    background: rgba(0, 89, 218, 0.5);
    cursor: no-drop;
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
}

@keyframes loadingIcon {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .loadingIcon {
    animation: loadingIcon infinite 2s linear;
  }
}

.downTips-icon{
  z-index: 9;
  position: absolute;
  bottom: 1.1rem;
  right: 0.3rem;
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
</style>
