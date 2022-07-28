<template>
  <!-- Payment information -->
  <div class="paymentInformation" v-if="orderState===null">
    <div class="feeTitle">
      <div class="feeTitle-name">1 USDT ≈ 29,000 USD</div>
      <div class="feeTitle-value">
        <div class="loading-svg">
<!--          <img src="../assets/images/countDownIcon.png" alt="">-->
          <img src="@/assets/images/SellTime.png" alt="">
        </div>
        <div class="feeTitle-value-text"><span>{{ timeDownNumber }}</span>{{ $t('nav.codeSecond') }}</div>
      </div>
    </div>
    <div class="fee-content">
      <div class="fee-content-title" @click="expandFee">
        <div class="left">
          {{ $t('nav.home_sellFee_title1') }} <span>{{ routerParams.amount }} {{ currencyData.name }}</span> {{ $t('nav.home_sellFee_title2') }} <span>{{ positionData.code }} {{ routerParams.getAmount }}</span>
        </div>
        <div class="right">
         <img src="@/assets/images/blackDownIcon1.png">
        </div>
      </div>
      <div class="fee-content-details" v-if="feeState">
        <div class="fee-content-details-line">
          <div class="title">{{ $t('nav.fee_listTitle_price') }}</div>
          <div class="value">{{ feeInfo.fiatSymbol }} {{ price }}</div>
        </div>
        <div class="fee-content-details-line">
          <div class="title">
            {{ $t('nav.home_sellFee_rampFee') }}
            <el-popover
                placement="top"
                :trigger="triggerType"
                :offset="-18"
                :content="$t('nav.fee_tips')">
              <div slot="reference"><img class="tipsIcon" src="../assets/images/exclamatoryMarkIcon.png"></div>
            </el-popover>
          </div>
          <div class="value">
            <span class="minText">{{ $t('nav.home_feeRampFeeTips') }}</span>
            - {{ feeInfo.fiatSymbol }} {{ rampFee }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 下单成功不刷新费用 -->

  <div class="paymentInformation" v-else>
    <div class="feeTitle">
      <div class="feeTitle-name">{{ $t('nav.home_feeTimeDownTitle') }}</div>
      <div class="feeTitle-value" v-show="timeDownState!==false">
        <div class="loading-svg"><img src="../assets/images/countDownIcon.png" alt=""></div>
        <div class="feeTitle-value-text">{{ $t('nav.home_feeTimeDown') }} {{ timeDownNumber }}{{ $t('nav.codeSecond') }}</div>
      </div>
    </div>
    <div class="fee-content">
      <div class="fee-content-title" @click="expandFee">
        <div class="left">
          {{ $t('nav.home_youSell') }}
          <span> {{ orderState.sellVolume }} {{ orderState.cryptoCurrency }} </span>
          {{ $t('nav.home_sellFee_title2') }}
          <span>{{ orderState.feeUnit }}{{ orderState_getAmount }}</span>
        </div>
        <div class="right">
          <img src="@/assets/images/blackDownIcon.png">
        </div>
      </div>
      <div class="fee-content-details" v-if="feeState">
        <div class="fee-content-details-line">
          <div class="title">{{ $t('nav.fee_listTitle_price') }}</div>
          <div class="value">{{orderState.feeUnit}}{{ orderState_price }}</div>
        </div>
        <div class="fee-content-details-line">
          <div class="title">
            {{ $t('nav.home_sellFee_rampFee') }}
            <el-popover
                placement="top"
                :trigger="triggerType"
                :offset="-18"
                :content="$t('nav.fee_tips')">
              <div slot="reference"><img class="tipsIcon" src="../assets/images/exclamatoryMarkIcon.png"></div>
            </el-popover>
          </div>
          <div class="value">
            <span class="minText">{{ $t('nav.home_feeRampFeeTips') }}</span>
            - {{ orderState.feeUnit }}{{ orderState.fee }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * timeDownState 是否需要定时刷新
 * isHome 是否是首页使用
 * orderState 是否显示记时
 */
import common from "../utils/common";

export default {
  name: "includedDetails",
  props: {
    timeDownState: {
      type: Boolean,
      default: null
    },
    orderState:{
      type:Object,
      default:null
    },
    isHome: {
      type: Boolean,
      default: null
    }
  },
  data(){
    return{
      triggerType: "hover",

      timeDownState_child: true,

      timeDown: 60,
      timeOut: null,
      feeState: false,
      feeParams: {},
      feeInfo: {},
      routerParams: {},
      currencyData: {},
      positionData: {},
      timeDownNumber: 15,
    }
  },
  watch: {
    'timeDownState': {
      deep: true,
      immediate: true,
      handler(val){
        this.timeDownState_child = (val !== null && val === false) ? false : true;
        if(val === false){
          window.clearInterval(this.timeOut);
          this.timeOut = null;
        }
      }
    },
    //输入金额改变后刷新数据
    '$store.state.sellRouterParams.amount': {
      deep: true,
      handler(){
        this.timingSetting();
      }
    },
    //选择国家后刷新数据
    '$store.state.sellRouterParams.payCommission.fiatCode': {
      deep: true,
      handler(val){
        this.timingSetting();
      }
    },
    //选择数字货币后刷新数据
    '$store.state.sellRouterParams.currencyData.name': {
      deep: true,
      handler(){
        this.timingSetting();
      }
    }
  },
  mounted(){
    //判断是pc还是移动端，用于展示的提示信息是click还是hover触发
    this.triggerType = common.equipmentEnd === 'pc' ? "hover" : "click";
    this.timingSetting();
  },
  activated(){
    //判断是pc还是移动端，用于展示的提示信息是click还是hover触发
    this.triggerType = common.equipmentEnd === 'pc' ? "hover" : "click";
    if(this.isHome && this.isHome === true){
      this.timingSetting();
    }
  },
  destroyed(){
    window.clearInterval(this.timeOut);
    this.timeOut = null;
  },
  deactivated(){
    window.clearInterval(this.timeOut);
    this.timeOut = null;
  },
  computed: {
    price(){
      let decimalDigits = 0;
      let resultValue = this.feeInfo.price * this.feeInfo.rate;
      resultValue >= 1 ? decimalDigits = 2 : decimalDigits = 6;
      let price = resultValue.toFixed(decimalDigits);
      isNaN(resultValue) || price <= 0 ? price = 0 : '';
      return price;
    },
    rampFee(){
      let decimalDigits = 0;
      let resultValue = this.feeInfo.rampFee;
      resultValue >= 1 ? decimalDigits = 2 : decimalDigits = 6;
      let rampFee = resultValue.toFixed(decimalDigits);
      isNaN(resultValue) || rampFee <= 0 ? rampFee = 0 : '';
      return rampFee;
    },
    orderState_price(){
      let decimalDigits = 0;
      let resultValue = this.orderState.cryptoCurrencyRate * this.orderState.fiatRate;
      resultValue >= 1 ? decimalDigits = 2 : decimalDigits = 6;
      let price = resultValue.toFixed(decimalDigits);
      isNaN(resultValue) || price <= 0 ? price = 0 : '';
      return price;
    },
    orderState_getAmount(){
      let decimalDigits = 0;
      let resultValue = this.orderState.fiatAmount - this.orderState.fee;
      resultValue >= 1 ? decimalDigits = 2 : decimalDigits = 6;
      let getAmount = resultValue.toFixed(decimalDigits);
      isNaN(resultValue) || getAmount <= 0 ? getAmount = 0 : '';
      return getAmount;
    }
  },
  methods:{
    //Countdown 15 refresh data
    timingSetting(){
      this.currencyData = this.$store.state.sellRouterParams.currencyData;
      this.positionData = this.$store.state.sellRouterParams.positionData;
      this.routerParams = this.$store.state.sellRouterParams;
      window.clearInterval(this.timeOut);
      this.timeOut = null;
      this.queryFee();
      this.timeOut = setInterval(()=> {
        if (this.timeDownNumber === 1) {
          this.timeDownNumber = 15;
          this.queryFee();
        }else{
          this.timeDownNumber -= 1;
        }
      },1000)
    },
    queryFee(){
      let patams = JSON.parse(JSON.stringify(this.$store.state.feeParams))
      this.$axios.get(this.$api.get_inquiryFeeSell,patams).then(res=>{
        if(res && res.returnCode === "0000"){
          this.$store.state.sellRouterParams.currencyData.price = res.data.price;
          console.log(this.$store.state.sellRouterParams.currencyData.price)
          this.feeInfo = res.data;
          this.feeInfo.rampFee = (this.routerParams.amount * this.feeInfo.price * this.feeInfo.percentageFee + this.feeInfo.fixedFee) * this.feeInfo.rate;
          //修改首页费用数据
          if(this.isHome && this.isHome === true){
            this.$parent.feeInfo = this.feeInfo;
            this.$parent.calculationAmount();
          }
        }
      })
    },

    expandFee(){
      this.feeState = this.feeState === true ? false : true;
      if(this.feeState === true){
        setTimeout(()=>{
          this.$parent.$refs.includedDetails_ref.$el.scrollIntoView({behavior: "smooth", block: "end", inline: 'end'});
        })
        return
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.paymentInformation {
  .feeTitle {
    font-size: .13rem;
    font-weight: normal;
    color: #949EA4;
    line-height: 15px;
    display: flex;
    align-items: center;
    padding: 0 .2rem 0;
    .feeTitle-name {
      font-family: SFProDisplayRegular;
    }

    .feeTitle-value {
      font-family: SFProDisplayRegular;
      display: flex;
      align-items: center;
      margin-left: auto;

      .loading-svg {
        margin-right: 0.04rem;
        font-size: 0.13rem;
        margin-top: 0.02rem;
        img {
          height: 0.12rem;
        }
      }
      .feeTitle-value-text{
        span{
          display: inline-block;
          width: 0.15rem;
          text-align: center;
        }
      }
    }
  }

  .fee-content {
    
    background: #F7F8FA;
    border-radius: 0.12rem;
    margin-top: 0.6rem;
    padding: .2rem;

    .fee-content-title {
      // padding: 0.2rem 0  .2rem;
      display: flex;
      align-items: center;
      font-size: 0.13rem;
      font-family:SFProDisplayRegular;
      font-weight: normal;
      color: #949EA4;
      cursor: pointer;

      span {
        font-weight: bold;
      }

      .left {
        word-break: break-all;
        font-size: 0.13rem;
        font-family: SFProDisplayRegular;
        font-weight: normal;
        color: #949EA4;

        span {
          color: #063376;
          font-family: SFProDisplayRegular;
        }
      }

      .right {
        margin-left: auto;
        img{
          width: 0.24rem;
        }
      }
    }

    .fee-content-details {
      // border-top: 1px solid #E6E6E6;
      // padding: 0rem 0 0.2rem 0;

      .fee-content-details-line {
        display: flex;
        align-items: center;
        margin-top: 0.16rem;

        .title {
          display: flex;
          align-items: center;
          font-size: 0.13rem;
          font-family: SFProDisplayRegular;
          font-weight: normal;
          color: #949EA4;

          .tipsIcon {
            width: 0.12rem;
            height: 0.12rem;
            margin:.02rem 0 0 0.08rem;
            display: flex;

            img {
              width: 100%;
              height: 100%;
            }
          }
        }

        .value {
          margin-left: auto;
          display: flex;
          align-items: center;
          font-size: 0.13rem;
          font-family: SFProDisplayRegular;
          color: #063376;
          font-weight: normal;

          .minText {
            font-family: SFProDisplayRegular;
            font-weight: normal;
            color: #848484;
            margin-right: 0.04rem;
            margin-top: -0.02rem;
          }
        }
      }
    }
  }
}
</style>
