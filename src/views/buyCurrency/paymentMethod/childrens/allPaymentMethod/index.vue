<template>
  <div id="allPaymentMethod">
    <div class="content">
      <!-- 最近一次国际卡记录 -->
      <div class="paymentMethod savedCard-box" v-if="paymethod_savedCard.length > 0 && $store.state.customized_orderMerchant">
        <div class="allPaymentMethod-title">Recently Used</div>
        <div class="paymentMethod-view savedCard-view" :class="{'select-true': selectKey === 'saveCard'}" @click="selectMethods('saveCard',paymethod_savedCard[0])">
          <div class="icon" v-if="paymethod_savedCard[0].cardNumber.slice(0,1) === '4'">
            <img src="@/assets/images/paymentMethod/visa-saved-icon.png">
          </div>
          <div class="icon" v-else>
            <img src="@/assets/images/paymentMethod/master-saved-icon.png">
          </div>
          <div class="info">
            <div class="card-type">
              <span>{{ paymethod_savedCard[0].cardNumber.slice(0,1) === '5' ? 'Master' : 'Visa' }} Card</span>
            </div>
            <div class="card-num">(<span>****</span>{{ paymethod_savedCard[0].cardNumber.substring(paymethod_savedCard[0].cardNumber.length-4) }})</div>
          </div>
          <div class="binancePay-right"></div>
        </div>
      </div>
      <!-- 新添加 -->
      <div class="allPaymentMethod-title" v-if="paymethod_Original.length > 0">Payment Method</div>
      <div class="paymentMethod" v-for="(item,index) in paymethod_Original" :key="index">
        <div class="paymentMethod-view binancePay"
             v-if="item.payWayCode === '20001' || item.payWayCode === '10008'"
             :class="{'select-true': selectKey === item.payWayCode}"
             @click="selectMethods(item.payWayCode,item)"
        >
          <div class="binancePay-left">
            <div class="icon"><img :src="item.icon"></div>
            <div class="info">
              <p class="name" :class="{'OPMname': item.payWayCode === '10008'}">{{ item.name }}</p>
              <p>Ramp Fee: {{ item.rampFee }}</p>
            </div>
          </div>
          <div class="binancePay-right"></div>
        </div>
        <div class="paymentMethod-view" v-else  @click="selectMethods(item.payWayCode,item)">
          <p class="paymentMethod-name">{{ item.name }}</p>
          <div class="iconList">
            <p class="iconList-oneOf" v-for="(icon,iconIndex) in item.icons" :key="iconIndex"><img :src="icon" alt=""></p>
            <p class="rightIcon"><img src="@/assets/images/homeRight-icon.png" alt=""></p>
          </div>
          <div class="feeView">Ramp Fee: {{ item.rampFee }} USD</div>
        </div>
      </div>
    </div>
    <button class="continue" :disabled="disabled" @click="confirm">
      Proceed
      <img class="rightIcon" src="@/assets/images/button-right-icon.svg" alt="" v-if="!request_loading">
      <i class="el-icon-loading rightIcon loadingIcon" v-else></i>
    </button>
  </div>
</template>

<script>
import {AES_Decrypt, AES_Encrypt} from "../../../../../utils/encryp";
import {querySubmitToken} from "../../../../../utils/publicRequest";

export default {
  name: "allPaymentMethod",
  props: {
    paymethodList: {
      default: null,
      type: Array
    },
    savedCard: {
      default: null,
      type: Array
    },
  },
  data(){
    return{
      allpaymentMethod: [
        {
          name: 'Card',
          payWayCode: '10001',
          icons: [
            require('@/assets/images/master-icon.png'),
            require('@/assets/images/visa-icon.png'),
          ],
          rampFee: '',
        },
        {
          name: 'Virtual Account',
          payWayCode: '10003',
          icons: [
            require('@/assets/images/bankCard/bankCard1.png'),
            require('@/assets/images/bankCard/bankCard2.png'),
            require('@/assets/images/bankCard/bankCard3.png'),
            require('@/assets/images/bankCard/bankCard4.png'),
            require('@/assets/images/bankCard/bankCard5.png'),
          ],
          rampFee: '',
        },
        {
          name: 'E-Wallet',
          payWayCode: '10004,10005,10006',
          icons: [
            require('@/assets/images/10004-icon.png'),
            require('@/assets/images/10005-icon.png'),
            require('@/assets/images/10006-icon.png'),
          ],
          rampFee: '',
        },
        {
          name: 'BINANCE PAY',
          key: 'binancePay',
          payWayCode: "20001",
          icon: require('@/assets/images/paymentMethod/binancePay-icon.png'),
          rampFee: '',
        },
        {
          name: 'Bank Transfer',
          payWayCode: "10008",
          icon: require('@/assets/images/10008-icon.png'),
          rampFee: '',
        },
      ],
      selectKey: '',
      selectVal: '',
      payMethodInfo: {},

      request_loading: false,
    }
  },
  computed: {
    paymethod_Original(){
      let paymentMethod_filter = [];
      if(this.paymethodList.length > 0){
        this.allpaymentMethod.forEach(item=>{
          let data = this.paymethodList.filter(res=>{
            return item.payWayCode.includes(res.payWayCode)
          })[0];
          if(data !==undefined) {
            let newData = {...item,...data}
            paymentMethod_filter.push(newData)
          }
        })
      }
      return paymentMethod_filter
    },
    paymethod_savedCard(){
      return this.savedCard;
    },
    disabled(){
      return this.selectKey !== '' ? false : true;
    }
  },
  methods: {
    //选择支付方式
    selectMethods(type,val){
      this.selectKey = type;
      this.selectVal = val;
      this.payMethodInfo = val;
      //kyc验证需要
      // let fullName = AES_Decrypt(val.firstname) + ' '+ AES_Decrypt(val.lastname);
      // this.$store.state.sellRouterParams.fullName = AES_Encrypt(fullName);
      //印尼 - DANA、QRIS、OVO
      if(type === '10004,10005,10006'){
        this.selectKey = "";
        this.$router.push(`/otherWayPay?payMethod=${JSON.stringify(this.payMethodInfo)}`)
        return
      }
      //印尼 - Virtual Account
      if(type === '10003'){
        this.selectKey = "";
        this.$router.push(`/otherWays-VA`);
        return
      }
      //国际卡
      if(type === '10001'){
        this.selectKey = "";
        // this.$router.push(`/creditCardForm-cardInfo?merchant_orderNo=${this.$route.query.merchant_orderNo}`)
      }
    },
    async confirm(){
      if(this.selectKey === 'saveCard' || this.selectKey === '20001' || this.selectKey === '10008'){
        await this.placeOrder(this.selectKey,this.selectVal);
      }
    },
    //创建订单
    async placeOrder(type,val){
      this.request_loading = true;
      let submitToken = await querySubmitToken();
      if(submitToken === true){
        //确认下单 获取订单id
        this.buyParams = this.$store.state.placeOrderQuery;
        this.buyParams.payWayCode = this.payMethodInfo.payWayCode;
        this.buyParams.cryptoCurrencyVolume = this.$store.state.buyRouterParams.getAmount;
        this.buyParams.alpha2 = this.$store.state.buyRouterParams.positionData.alpha2;
        //存在商户信息将信息带入请求地址
        let urlQuery = '';
        if(JSON.parse(sessionStorage.getItem("accessMerchantInfo")).merchantParam){
          urlQuery = `?${JSON.parse(sessionStorage.getItem("accessMerchantInfo")).merchantParam}`;
        }
        this.$axios.post(this.$api.post_buy + urlQuery,this.buyParams,'submitToken').then(res=>{
          if(res && res.returnCode === '0000'){
            this.$store.state.buyRouterParams.orderNo = res.data.orderNo;
            this.$store.state.buyRouterParams.kyc = res.data.kyc;
            this.$store.state.buyRouterParams.submitForm = res.data;
            this.$store.state.buyRouterParams.payWayCode = this.payMethodInfo.payWayCode;
            this.$store.state.buyRouterParams.payWayName = this.payMethodInfo.payWayName;
            //Bank Transfer
            if(val.payWayCode === '10008'){
              this.request_loading = false;
              this.$router.push(`/otherWays-VA`)
              return
            }
            //历史卡信息、BINANCE PAY
            if(type === 'saveCard' || val.payWayCode === '20001'){
              this.$store.state.buyRouterParams.submitForm = val;
              this.payMethodInfo.cardNumber = AES_Encrypt(this.payMethodInfo.cardNumber);
              this.$store.state.buyRouterParams.userCardId = this.payMethodInfo.userCardId;
              this.request_loading = false;
              this.$router.push(`/creditCardConfig?submitForm=${JSON.stringify(this.payMethodInfo)}&configPaymentFrom=userPayment`)
            }
          }else{
            this.request_loading = false;
          }
        }).catch(()=>{
          this.request_loading = false;
        })
      }else{
        this.request_loading = false;
      }
    }

  }
}
</script>

<style lang="scss" scoped>
html,body,#allPaymentMethod{
  width: 100%;
  height: 100%;
}
#allPaymentMethod{
  display: flex;
  flex-direction: column;
  .content{
    flex: 1;
    overflow: auto;
  }
  .savedCard-box{
    margin-bottom: 0.24rem;
  }
  .allPaymentMethod-title{
    font-family: SFProDisplayMedium;
    font-weight: 500;
    font-size: 0.16rem;
    line-height: 0.2rem;
    color: #031633;
  }
  .paymentMethod-view{
    margin-top: 0.12rem;
    min-height: 0.96rem;
    border: 1px solid #D9D9D9;
    border-radius: 0.06rem;
    padding: 0.12rem 0.16rem;
    cursor: pointer;
    .paymentMethod-name{
      font-family: SFProDisplayMedium;
      font-weight: 500;
      font-size: 0.16rem;
      line-height: 0.2rem;
      color: #6E7687;
    }
    .iconList{
      display: flex;
      align-items: center;
      margin-top: 0.1rem;
      .iconList-oneOf{
        margin-left: 0.12rem;
        &:first-child{
          margin-left: 0;
        }
        img{
          width: 0.24rem;
        }
      }
      .rightIcon{
        margin-left: auto;
        img{
          width: 0.2rem;
        }
      }
    }
    .feeView{
      margin-top: 0.08rem;
      font-family: SFProDisplayRegular;
      font-weight: 400;
      font-size: 0.1rem;
      line-height: 0.14rem;
      color: #949EB5;

    }
  }

  .binancePay{
    display: flex;
    align-items: center;
    min-height: 0.54rem;
    padding: 0.12rem 0.16rem 0.12rem 0.13rem;
    .binancePay-left{
      display: flex;
      align-items: center;
      .icon{
        width: 0.3rem;
        img{
          width: 0.3rem;
        }
      }
      .info{
        font-family: SFProDisplayRegular;
        font-weight: 400;
        font-size: 0.1rem;
        line-height: 0.14rem;
        color: #949EB5;
        margin-left: 0.12rem;
        .name{
          font-family: SFProDisplayMedium;
          font-weight: 500;
          font-size: 0.16rem;
          line-height: 0.2rem;
          letter-spacing: 1.5px;
          color: #F0B90B;
          margin-bottom: 0.04rem;
        }
        .OPMname{
          color: #6E7687;
        }
      }
    }
    .binancePay-right{
      margin-left: auto;
      width: 0.14rem;
      height: 0.14rem;
      background: #FFFFFF;
      border: 1px solid #949EA4;
      border-radius: 50%;
    }
  }

  .savedCard-view{
    min-height: 0.56rem;
    display: flex;
    align-items: center;
    .icon{
      width: 0.38rem;
      padding-top: 0.04rem;
      img{
        width: 0.38rem;
      }
    }
    .info{
      margin-left: 0.12rem;
      font-family: SFProDisplayRegular;
      font-weight: 400;
      font-size: 0.16rem;
      color: #6E7687;
      display: flex;
      align-items: center;
      .card-num{
        margin-left: 0.08rem;
        font-size: 0.13rem;
        span{
          color: #C2C2C2;
          margin-top: 0.2rem;
        }
      }
    }
    .binancePay-right{
      margin-left: auto;
      width: 0.14rem;
      height: 0.14rem;
      background: #FFFFFF;
      border: 1px solid #949EA4;
      border-radius: 50%;
    }
  }

  //选中样式
  .select-true{
    border: 1px solid #41B8FD;
    box-shadow: 0 0 0.35rem rgba(89, 153, 248, 0.2);
  }

  .continue{
    width: 100%;
    height: 0.58rem;
    background: linear-gradient(88.06deg, #0059DA 0%, #1BB2F2 100%);
    border-radius: 0.3rem;
    font-size: 0.17rem;
    font-family: "GeoRegular", GeoRegular;
    font-weight: normal;
    color: #FFFFFF;
    margin-top: 0.16rem;
    cursor: pointer;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    .rightIcon{
      width: 0.24rem;
      font-size: 0.12rem;
      margin-left: 0.08rem;
    }
    .loadingIcon{
      font-size: 0.24rem;
    }
  }
  .continue:disabled{
    opacity: 0.25;
    cursor: no-drop;
  }
}
</style>
