<template>
  <div id="allPaymentMethod">
    <div class="content">
      <!-- 最近一次国际卡记录 -->
      <div class="paymentMethod savedCard-box" v-if="paymethod_savedCard.length > 0">
        <div class="allPaymentMethod-title">Recently Used</div>
        <div class="paymentMethod-view savedCard-view" :class="{'select-true': selectVal === 'saveCard'}" @click="selectMethods('saveCard',paymethod_savedCard[0])">
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
      <div class="allPaymentMethod-title">Payment Method</div>
      <div class="paymentMethod" v-for="(item,index) in paymethod_Original" :key="index">
        <div class="paymentMethod-view binancePay"
             v-if="item.payWayCode === '20001' || item.payWayCode === '10008'"
             :class="{'select-true': selectVal === 'binancePay'}"
             @click="selectMethods('binancePay',item)"
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
        <div class="paymentMethod-view" v-else  @click="selectMethods('goDetails',item)">
          <p class="paymentMethod-name">{{ item.name }}</p>
          <div class="iconList">
            <p class="iconList-oneOf" v-for="(icon,iconIndex) in item.icons" :key="iconIndex"><img :src="icon" alt=""></p>
            <p class="rightIcon"><img src="@/assets/images/homeRight-icon.png" alt=""></p>
          </div>
          <div class="feeView">Ramp Fee: {{ item.rampFee }} USD</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
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
      EWallet_icon: [],
      VA_icon: [],
      card_icon: [],
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
      selectVal: '',
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
    }
  },
  methods: {
    selectMethods(type,val){
      //历史卡信息
      if(type === 'saveCard'){
        this.selectVal = 'saveCard';
        return
      }
      //BINANCE PAY
      if(type === 'binancePay' && val.payWayCode === '20001'){
        this.selectVal = 'binancePay';
        return;
      }
      //印尼、国际卡
      if(type === 'goDetails' && val.payWayCode === ''){
        
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#allPaymentMethod{
  margin-top: 0.18rem;
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
}
</style>
