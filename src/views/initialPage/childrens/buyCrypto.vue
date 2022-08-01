<template>
  <div id="buyCrypto">
    <!-- 买币功能模块 -->
    <div class="buyCrypto_content">
      <div class="methods_select cursor" :class="{'inputFocus': inputFocus}">
        <div class="methods_select-left">
          <div class="form_title pay_title">{{ $t('nav.home_youPay') }}</div>
          <van-field class="pay_input" :type="youPaytype" @input="inputChange"
                     v-model.number="payAmount" pattern="[0-9]*" inputmode="decimal" @blur="youPayBlur"
                     @focus="inputFocus=true" :disabled="payAmountState" placeholder="0.00"/>
        </div>
        <div class="get_company" @click="openSearch('payCurrency')">
          <div class="getImg">
            <img :src="positionData.positionImg">
          </div>
          <div class="getText">{{ payCommission.code }}</div>
          <div class="rightIcon"><img src="@/assets/images/blackDownIcon.png"></div>
        </div>
        <div class="warning_text" v-if="warningTextState" v-html="payAmount_tips"></div>
      </div>

      <div class="methods_select cursor">
        <div class="methods_select-left">
          <div class="form_title">{{ $t('nav.home_buyFee_title1') }}</div>
          <div class="get_input">
            <span v-if="getAmount!==''">{{ getAmount }}</span>
            <span class="no_getAmount" v-else>0.00</span>
          </div>
        </div>
        <div class="get_company" @click="openSearch('currency')">
          <div class="getImg networkImg">
            <img :src="currencyData.icon">
<!--            <div class="networkIcon" v-if="currencyData.buyNetwork && currencyData.buyNetwork.logo"><img :src="currencyData.buyNetwork.logo"></div>-->
          </div>
          <div class="getText">{{ currencyData.name }}</div>
          <div class="rightIcon"><img src="@/assets/images/blackDownIcon.png"></div>
        </div>
      </div>

      <!-- 费用模块 -->
      <div class="calculationProcess" v-if="detailedInfo_state">
        <IncludedDetails ref="includedDetails_ref" :isHome="true" :useFee="true"/>
      </div>
    </div>

    <footer>
      <button class="continue" @click="nextStep" :disabled="!continueState" :class="{'continue_true': continueState}">
        Proceed · Buy {{ currencyData.name }}
        <img class="rightIcon" src="../../../assets/images/button-right-icon.svg" alt="">
      </button>
      <div class="footer_logoView">
        <p class="logoText">Powered By</p>
        <div class="logo">
          <img src="../../../assets/images/homePageLogo.jpg" alt="">
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
/**
 * 页面小数同意处理
 * 数值>0，小数点后保留2位
 * 数值<0，小数点后最多保留6位
 */
import common from "../../../utils/common";
import IncludedDetails from "../../../components/IncludedDetails";

export default {
  name: "buyCrypto",
  components: {IncludedDetails},
  props: ['allBasicData'],
  data(){
    return{
      //you pay Prompt information
      warningTextState: false,

      //All data
      basicData: {},

      //Location data
      positionData: {
        positionValue: '',
        positionImg: '',
        alpha2: ''
      },

      payAmount: '',
      youPaytype: 'number', // Number | digit
      getAmount: '',
      payAmount_Default: true,
      payAmount_index: 0,

      //Expense information
      feeInfo: {},
      detailedInfo_state: false,

      //you get Currency information
      currencyData: {
        icon: '',
        name: '',
        networkFee: '',
        serviceFee: '',
        price: '',
      },
      cryptoSate: false,

      //Payment methods
      allPayMethods: [],
      //Payment method information
      payCommission: {},
      allPayCommission: [],
      //Exchange rate in payment currency
      exchangeRate: 0,

      triggerType: "hover",

      inputFocus: false,
    }
  },
  computed: {
    //you pay input status - 数据加载后放开状态
    payAmountState(){
      if(this.payCommission.payMax > 0 && this.payCommission.payMin > 0){
        return false
      }else{
        return true
      }
    },
    //continue button status - 限制确认按钮状态
    continueState(){
      if(this.positionData.positionValue !== ''&&
          this.payAmount !== '' && Number(this.payAmount) >= this.payCommission.payMin &&
          Number(this.payAmount) <= this.payCommission.payMax && this.getAmount !== '' &&
          Number(this.payAmount) > 0){
        return true
      }else{
        return false
      }
    },
    //法币最大最小值提示
    payAmount_tips(){
      var minError = `${this.$t('nav.home_minAmountTips')} ${this.payCommission.symbol}${this.payCommission.payMin}.`;
      var maxError = `${this.$t('nav.home_maxAmountTips')} ${this.payCommission.symbol}${this.payCommission.payMax}.`;
      if(Number(this.payAmount) < this.payCommission.payMin){
        return minError;
      }else if(Number(this.payAmount) > this.payCommission.payMax){
        return maxError;
      }
    }
  },
  watch: {
    //获取首页基本数据
    allBasicData: {
      immediate: true,
      deep: true,
      handler() {
        this.$store.state.buyRouterParams.network = '';
        this.payAmount = '';
        this.getAmount = '';
        this.detailedInfo_state = false;
        this.allBasicData.worldList !== undefined ? this.currentLocation() : '';
      },
    },
    //监听you pay input完成页面基本数据加载
    payAmount: {
      deep: true,
      handler() {
        this.amountControl();
      }
    },
  },
  methods: {
    //选择法币或加密货币
    openSearch(view){
      //地址栏携带商户加密货币种禁止选择加密货币
      if(view === 'currency' && this.cryptoSate === false){
        return;
      }
      this.$parent.openSearch(view,this.allPayCommission);
    },
    //法币币种为USD如果少于两位小数，将自动添加0
    youPayBlur(){
      this.inputFocus = false;
      if(this.payAmount > 0 && this.payCommission.code === 'USD'){
        this.payAmount = (Math.round(this.payAmount*100)/100).toFixed(2);
      }
    },
    //法币币种为USD限制只能输入两位小数
    inputChange(val){
      this.payAmount_index += 1;
      this.payAmount_index >= 1 ? this.payAmount_Default = false : '';
      if(val.indexOf('.') > 0 && this.payCommission.code === 'USD'){
        this.payAmount = val.substr(0,val.indexOf('.')+3);
      }
    },

    //处理收到的法币的数量和显示状态
    amountControl(){
      if(this.payAmount === ''){
        this.warningTextState = false;
        return;
      }

      //法币币种为USD限制只能输入两位小数 其他都为整数
      if(this.payAmount > 0){
        if(this.payCommission.code === 'USD'){
          this.youPaytype = 'number';
        }else{
          this.youPaytype = 'digit';
          this.payAmount = parseInt(this.payAmount);
        }
      }

      //限制法币的最小值、最大值
      if (Number(this.payAmount) >= this.payCommission.payMin && Number(this.payAmount) <= this.payCommission.payMax){
        this.warningTextState = false;
        //计算加密货币数量
        this.payinfo();
      }else{
        this.warningTextState = true;
        this.getAmount = "";
        this.detailedInfo_state = false;
      }
    },

    //Purchase information details - Scheduled refresh
    payinfo(){
      if (Number(this.payAmount) >= this.payCommission.payMin && Number(this.payAmount) <= this.payCommission.payMax){
        this.detailedInfo_state = true;
        this.$store.state.buyRouterParams.amount = this.payAmount;
        this.$nextTick(()=>{
          document.getElementById("buyCrypto").scrollIntoView({behavior: "smooth", block: "end"});
        })
      }else{
        this.detailedInfo_state = false;
      }
    },

    //Real time calculation getAmount
    calculationAmount(){
      if(Number(this.payAmount) >= this.payCommission.payMin && Number(this.payAmount) <= this.payCommission.payMax){
        //取出费用最小的值rampFee
        let rampFeeList = [];
        this.payCommission.payCommission.forEach(item=>{
          let decimalDigits = 0;
          let resultValue = Number(item.feeRate) * Number(this.payAmount) + item.fixedFee;
          resultValue >= 1 ? decimalDigits = 2 : decimalDigits = 6;
          let rampFee = resultValue.toFixed(decimalDigits);
          isNaN(resultValue) || rampFee <= 0 ? rampFee = 0 : '';
          rampFeeList.push(rampFee);
        })
        this.payCommission.rampFee = Math.min(...rampFeeList);
        //Filter exchange rate - Calculate cost and accepted quantity
        this.exchangeRate = this.basicData.usdToEXR[this.payCommission.code];
        this.feeInfo.networkFee = this.exchangeRate * this.feeInfo.networkFee;
        //计算数字货币数量
        let newGetAmount = (Number(this.payAmount) - this.feeInfo.networkFee - this.payCommission.rampFee) / (this.feeInfo.price * this.exchangeRate);
        let decimalDigits = 0;
        newGetAmount >= 1 ? decimalDigits = 2 : decimalDigits = 6;
        newGetAmount = newGetAmount.toFixed(decimalDigits);
        isNaN(newGetAmount) || newGetAmount <= 0 ? newGetAmount = 0 : '';
        this.getAmount = newGetAmount;
        this.$store.state.buyRouterParams.getAmount = this.getAmount;
        this.$store.state.buyRouterParams.payCommission = this.payCommission;
        this.$store.state.buyRouterParams.exchangeRate = this.exchangeRate;
      }
    },

    //position country
    currentLocation(){
      this.basicData = this.allBasicData;

      //将you pay的币种和国家数据合并在一起
      this.basicData.worldList.forEach((item,index)=>{
        if(item.buyFiatList){
          item.buyFiatList.forEach((item2,index2)=>{
            this.basicData.fiatCurrencyList.forEach(item3=>{
              if(item3.code === item2){
                this.basicData.worldList[index].buyFiatList[index2] = item3;
              }
            })
          })
        }
      })

      //获取定位的国家信息
      var worldData = {};
      worldData = this.basicData.worldList.filter((item)=> {
        if(item.alpha2 === this.basicData.param.areaCode){
          return item;
        }
      })
      //商家配置的法币没有默认国家的法币，默认商家配置币种第一个
      if(worldData[0].buyEnable === 0){
        worldData = this.basicData.worldList.filter(item=>{return item.buyEnable === 1});
      }

      this.handlePayWayList(worldData[0],1);

      //接入商户信息处理
      this.merchantOrderVerification();

      //提示效果判断
      this.triggerType = common.equipmentEnd === 'pc' ? "hover" : "click";
    },

    handlePayWayList(data,state){
      this.positionData.positionValue = data.enCommonName;
      this.positionData.positionImg = data.flag;
      this.positionData.alpha2 = data.alpha2;
      this.$store.state.buyRouterParams.positionData = this.positionData;

      let payCommission = {};

      //根据国家对应的币种处理数据
      //state - 1页面初始化数据处理 state - 2选择国家后数据处理
      if(state === 1){
        payCommission = data.buyFiatList[0];
      }else{
        data.buyFiatList.forEach(item=>{
          if(item.code === data.code){
            payCommission = item;
          }
        })
      }

      //页面初始化 - 买币预设初始法币金额是300刀等值法币
      if(this.payAmount_Default === true){
        let exchangeRate = this.basicData.usdToEXR[payCommission.code];
        this.payAmount = 300 * exchangeRate;
      }

      this.payCommission = payCommission;

      // this.allPayCommission = data.buyFiatList;
      //根据you pay币种类过滤费用
      this.exchangeRate = this.basicData.usdToEXR[this.payCommission.code];
      //you pay输入的最大值最小值：最小值里面取最大, 最大值里面取最小
      let maxNumList = [];
      let minNumList = [];
      this.payCommission.payCommission.forEach(item=>{maxNumList.push(item.payMax);minNumList.push(item.payMin)});
      this.payCommission.payMax = Math.min(...maxNumList);
      this.payCommission.payMin = Math.max(...minNumList);

      //

      this.$store.state.buyRouterParams.exchangeRate = this.exchangeRate;
      this.$store.state.buyRouterParams.payCommission = this.payCommission;
      this.amountControl();
    },

    //接入商户信息接收、验证
    merchantOrderVerification(){
      //There is no merchant information in the address column - Copy local cache
      //Obtain merchant order information in the address bar
      let merchantParams = {};
      JSON.stringify(this.$route.query) !== "{}" ? merchantParams = this.$route.query : merchantParams = JSON.parse(sessionStorage.getItem("accessMerchantInfo"));
      merchantParams === null ? merchantParams = {} : '';
      merchantParams.networkDefault = false;
      merchantParams.addressDefault = false;

      sessionStorage.setItem("accessMerchantInfo",JSON.stringify(merchantParams));
      let cryptoValue = (merchantParams.crypto!== ''&& merchantParams.crypto!==undefined) ? merchantParams.crypto : "ACH";
      //如果匹配到ACH币并且可以买(purchaseSupported===1)赋值,没有则赋值可以买(purchaseSupported===1)列表第一个币种
      let cryptoDate = this.basicData.cryptoCurrencyResponse.cryptoCurrencyList.filter(res=>{ return res.name === cryptoValue && res.purchaseSupported === 1 })[0];
      cryptoDate === undefined ? cryptoDate = this.basicData.cryptoCurrencyResponse.cryptoCurrencyList.filter(item=>{return item.purchaseSupported === 1})[0] : '';
      this.currencyData = {
        icon: cryptoDate.logoUrl,
        name: cryptoDate.name,
        networkFee: cryptoDate.networkFee,
        price: cryptoDate.price,
        serviceFee: cryptoDate.serviceFee,
        buyNetwork: cryptoDate.buyNetworkList[0]
      }
      this.$store.state.buyRouterParams.cryptoCurrency = cryptoDate.name;
      let params = merchantParams;
      delete params.networkDefault;
      delete params.addressDefault;
      delete params.merchantParam_state;
      this.$axios.get(this.$api.get_orderVerification, params).then(res=>{
        //商户信息接口success创建订单添加merchantParam参数
        if(res && res.returnCode === "0000"){
          this.cryptoSate = merchantParams.crypto ? false : true;
          merchantParams.merchantParam = JSON.stringify(this.$route.query) !== "{}" ? this.$route.fullPath.substring(2,this.$route.fullPath.length) : JSON.parse(sessionStorage.getItem("accessMerchantInfo")).merchantParam;
          merchantParams.merchantParam_state = true;
          sessionStorage.setItem("accessMerchantInfo",JSON.stringify(merchantParams));
          //network address All passed the verification
          if(res.success === true && res.data === null){
            merchantParams.addressDefault = false;
            merchantParams.networkDefault = false;
            sessionStorage.setItem("accessMerchantInfo",JSON.stringify(merchantParams));
            return;
          }

          //Judge whether a network｜address has passed
          if(res.success === true && res.data !== null){
            //you pay currency - address: false - Address is not brought out by default
            if(res.data.address === false || res.data.address === undefined){ //No parameter defaults
              merchantParams.addressDefault = false;
            }else{
              merchantParams.addressDefault = true;
            }

            //network: false - The network is not brought out by default
            if(res.data.network === false || res.data.network === undefined) {
              merchantParams.networkDefault = false;
            }else{
              merchantParams.networkDefault = true;
            }
            sessionStorage.setItem("accessMerchantInfo",JSON.stringify(merchantParams));
            return;
          }
        }else{
          //Verification failed. Release all permissions
          this.cryptoSate = true;
          merchantParams.merchantParam_state = false;
          merchantParams.addressDefault = false;
          merchantParams.networkDefault = false;
          sessionStorage.setItem("accessMerchantInfo",JSON.stringify(merchantParams));
        }
      }).catch(()=>{
        this.cryptoSate = true;
        merchantParams.addressDefault = false;
        merchantParams.networkDefault = false;
        sessionStorage.setItem("accessMerchantInfo",JSON.stringify(merchantParams));
      })
    },

    nextStep(){
      /**
       * - No token jump /emailCode
       * post_coinSupportedWallet - How to get acceptable currency - ACh Wallet OR Chain address
       * - User selected verification
       * choice Indonesian payment /creditCardForm-cardInfo
       * Other payment jump /receivingMode
       * */
      //是否是从菜单进入
      this.$store.state.routerQueryPath = false

      let routerParams = {
        cryptoCurrency: this.currencyData.name,
        amount: this.payAmount,
        getAmount: this.getAmount,
        payCommission: this.payCommission,
        exchangeRate: this.exchangeRate,
        positionData: this.positionData
      }
      this.$store.state.buyRouterParams = routerParams;

      // Login information
      if(!localStorage.getItem('token') || localStorage.getItem('token')===''){
        this.$store.state.emailFromPath = 'buyCrypto';
        this.$store.state.homeTabstate = 'buyCrypto';

        this.$router.push(`/emailCode`);

        return;
      }
      this.$axios.post(this.$api.post_kycDisabled).then(res=>{
        if(res && res.returnCode === '0000'){
          if(res.data){
            this.$parent.$parent.AccountisShow = true
          }else{
            this.$store.state.homeTabstate = 'buyCrypto';
            this.$router.push(`/receivingMode`)
          }
        }
      })

    },
  }
}
</script>

<style lang="scss" scoped>
html,body,#buyCrypto{
  width: 100%;
  height: 100%;
}
#buyCrypto{
  display: flex;
  flex-direction: column;
  .buyCrypto_content{
    flex: 1;
    overflow: auto;
  }
}

.form_title{
  font-family: 'SFProDisplayRegular',SFProDisplayRegular;
  font-style: normal;
  font-weight: 400;
  font-size: 0.13rem;
  color: #949EA4;
}

.methods_title{
  margin-top: 0.2rem;
}
.methods_select{
  min-height: 1.05rem;
  background: #FFFFFF;
  border: 1px solid #EEEEEE;
  border-radius: 0.06rem;
  padding: 0 0.16rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  &:nth-of-type(2){
    margin-top: 0.12rem;
  }
}
.inputFocus{
  border: 1px solid #D0ECFC;
  box-shadow: 0 0 0.35rem rgba(89, 153, 248, 0.1);
}

.pay_input{
  width: 1.4rem;
  border: none;
  outline: none;
  font-family: 'SFProDisplayMedium',SFProDisplayMedium;
  font-weight: 500;
  font-size: 0.2rem;
  color: #0059DA;
  padding: 0;
  margin-top: 0.06rem;
  &::placeholder{
    color: #C2C2C2 !important;
  }
}
.pay_company{
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  min-width: 1.44rem;
  border-radius: 0 0.12rem 0.12rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "GeoRegular", GeoRegular;
  font-size: 0.16rem;
  color: #232323;
  background: #EDEDEF;
  .countryIcon{
    display: flex;
    margin-right: 0.1rem;
    height: 0.288rem;
    img{
      width: 0.3rem;
      border-radius: 50%;
      background: #E0E0E0;
    }
  }
  .rightIcon{
    width: 0.24rem;
    margin-left: 0.18rem;
  }
}

.warning_text{
  position: absolute;
  bottom: 0.08rem;
  left: 0.18rem;
  font-family: 'SFProDisplayRegular',SFProDisplayRegular;
  font-weight: 400;
  font-size: 0.1rem;
  color: #FF3333;
  line-height: 0.12rem;
}

.methods_select-left{
  margin-top: -0.1rem;
}
.get_input{
  width: 1.4rem;
  height: 0.26rem;
  overflow: auto;
  font-family: SFProDisplayMedium;
  font-weight: 500;
  font-size: 0.2rem;
  line-height: 0.24rem;
  color: #063376;
  margin-top: 0.06rem;
  .no_getAmount{
    color: #C2C2C2;
  }
}
.get_company{
  margin-left: auto;
  margin-top: -0.1rem;
  padding: 0 0.12rem;
  min-width: 1.2rem;
  height: 0.46rem;
  background: #F7F8FA;
  border: 1px solid #EEEEEE;
  border-radius: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "SFProDisplayRegular", SFProDisplayRegular;
  cursor: pointer;
  .networkImg{
    margin-right: 0.12rem!important;
  }
  .getImg{
    display: flex;
    margin-right: 0.06rem;
    width: 0.24rem;
    min-height: 0.24rem;
    background: #94ACBA;
    border-radius: 50%;
    position: relative;
    img{
      width: 0.24rem;
      border-radius: 50%;
    }
    .networkIcon{
      background: #FFFFFF;
      width: 0.16rem;
      height: 0.16rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      bottom: 0;
      right: -0.06rem;
      img{
        width: 0.12rem;
        height: 0.12rem;
        border-radius: 50%;
      }
    }
  }
  .getText{
    display: flex;
    font-family: 'SFProDisplayRegular',SFProDisplayRegular;
    font-style: normal;
    font-weight: 400;
    font-size: 0.13rem;
    color: #063376;
    min-width: 0.28rem;
  }
  .rightIcon{
    display: flex;
    align-items: center;
    width: 0.24rem;
    margin-left: auto;
    img{
      width: 0.24rem;
    }
  }
}

footer{
  .footer_logoView{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0.08rem;
    font-family: SFProDisplayRegular;
    font-weight: 400;
    font-size: 0.13rem;
    color: #C2C2C2;
    .logoText{
      margin-right: 0.12rem;
      margin-top: 0.02rem;
    }
    .logo{
      display: flex;
      align-items: center;
      justify-content: center;
      width: 0.8rem;
      img{
        width: 0.8rem;
      }
    }
  }
}
.continue{
  width: 100%;
  height: 0.58rem;
  background: rgba(0, 89, 218, 0.5);
  border-radius: 0.29rem;
  font-size: 0.17rem;
  font-family: "GeoRegular", GeoRegular;
  font-weight: normal;
  color: #FFFFFF;
  margin-top: 0.16rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: no-drop;
  border: none;
  margin-bottom: 0.12rem;
  .rightIcon{
    width: 0.2rem;
    margin-left: 0.08rem;
  }
}
.continue_true{
  background: #0059DA;
  cursor: pointer;
}
.cursor{
  cursor: auto;
}

.calculationProcess{
  margin-top: 0.08rem;
  margin-bottom: 0.1rem;
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

.pay_input ::v-deep .van-cell__value--alone{
  min-height: 0.26rem;
}
.pay_input ::v-deep .van-field__control{
  min-height: 0.26rem;
  border: none;
  outline: none;
  background: #FFFFFF;
  font-size: 0.2rem !important;
  font-family: 'SFProDisplayMedium',SFProDisplayMedium;
  font-weight: 500;
  color: #0059DA !important;
  &::placeholder{
    color: #C2C2C2 !important;
  }
}</style>
