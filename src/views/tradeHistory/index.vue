<script src="../../../../../../Desktop/总结/工具类js/Tools.js"></script>
<template>
  <div id="tradeHistory">

    <div class="tabView">
      <div class="tab" :class="{'tabView-left': tabViewName === 'buy'}" @click="changeTab('buy')">Buy Crypto</div>
      <div class="tab" :class="{'tabView-right': tabViewName === 'sell'}" @click="changeTab('sell')">Sell Crypto</div>
    </div>

    <!-- 买币历史 -->
    <div class="historyList-box" v-show="tabViewName === 'buy'">
      <div class="noData" v-if="buy_historyList.length===0">
        <div class="noDataImg"><img src="../../assets/images/noData.png"></div>
        <div class="noDataText">{{ $t('nav.history_noListText') }}</div>
        <p>{{ $t('nav.history_noListText2') }}</p>
        <button class="continue" @click="goHome">
          {{ $t('nav.history_noListButton') }}
          <img class="rightIcon" src="../../assets/images/rightIconSell.png" alt="">
        </button>
      </div>
      <div class="historyList" v-else>
        <van-list v-model="buyLoading" :finished="buyFinished" :finished-text="$t('nav.history_noMore')" @load="buyOnLoad" loading-text="Loading" error-text="Loading failed">
          <div class="van-clearfix">
            <div class="float-item" v-for="(item,index) in buy_historyList" :key="index">
              <div class="historyLi_header">
                <div class="historyLi_header_left">
                  <div class="cryptoCurrencyIcon"><img :src="item.cryptoCurrencyIcon"></div>
                  <div class="cryptoCurrencyName">{{ item.cryptoCurrency }}</div>
                </div>
                <div class="historyLi_header_right">
                  <p class="time">{{ item.createdTime }}</p>
                  <p class="righticon"><img src="../../assets/images/slices/right_icon.svg" alt=""></p>
                </div>
              </div>
              <div class="details_line">
                <div class="details_line_title">{{ $t('nav.history_listTitle1') }}</div>
                <div class="details_line_value">{{ item.orderNo }}</div>
              </div>
              <div class="details_line">
                <div class="details_line_title">{{ $t('nav.payResult_feeAmount') }} ({{ item.fiatCurrency }})</div>
                <div class="details_line_value">
                  <span class="value" :class="{'noValue': noData(item.amount) === '--'}">{{ noData(item.amount) }}</span>
                </div>
              </div>
              <div class="details_line">
                <div class="details_line_title">{{ item.cryptoCurrency }} {{ $t('nav.fee_listTitle_price') }} ({{ item.fiatCurrency }})</div>
                <div class="details_line_value">
                  <span class="value" :class="{'noValue': noData(item.cryptoCurrencyPrice) === '--'}">{{ noData(item.cryptoCurrencyPrice) }}</span>
                </div>
              </div>
              <div class="details_line">
                <div class="details_line_title">{{ $t('nav.history_listTitle2') }} ({{ item.cryptoCurrency }})</div>
                <div class="details_line_value">
                  <span class="value" :class="{'noValue': noData(item.cryptoCurrencyVolume) === '--'}">{{ noData(item.cryptoCurrencyVolume) }}</span>
                </div>
              </div>
              <div class="details_line" >
                <div class="details_line_title">
                  <span v-if="item.depositType===1">ACH {{ $t('nav.payResult_feeWallet') }}</span>
                  <span v-if="item.depositType===2">{{ $t('nav.payResult_feeAddress') }}</span>
                </div>
                <div class="details_line_value address_value">
                  <span class="value" :class="{'noValue': noData(item.address) === '--'}">{{ noData(item.address) }}</span>
                </div>
              </div>
              <div class="details_line" v-if="item.hashId">
                <div class="details_line_title">{{ $t('nav.history_listTitle3') }}</div>
                <div class="details_line_value">
                  <span class="value" :class="{'noValue': noData(item.hashId) === '--'}">{{ noData(item.hashId) }}</span>
                </div>
              </div>

              <!-- 订单状态 -->
              <div class="orderState">
                <div v-if="item.orderState === 1 || item.orderState === 2" class="state_loading">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">{{ $t('nav.history_state_Processing') }}</div>
                  </div>
                </div>
                <div v-if="item.orderState === 3 || item.orderState === 4" class="state_loading">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">{{ $t('nav.history_state_Transfer') }}</div>
                  </div>
                </div>
                <div v-if="item.orderState === 5" class="state_success">
                  <div class="state_failed">
                    <div class="state_circular"></div>
                    <div class="state_name">{{ $t('nav.history_state_Complete') }}</div>
                  </div>
                </div>
                <!--                <span v-if="item.orderState === 0" class="state_error">fail</span>-->
                <!--                <span v-if="item.orderState === 2 || item.orderState === 3" class="state_loading">Transferring</span>-->
              </div>
            </div>
          </div>
        </van-list>
      </div>
    </div>

    <!-- 卖币历史 -->
    <div class="historyList-box" v-show="tabViewName === 'sell'">
      <div class="noData" v-if="sell_historyList.length===0">
        <div class="noDataImg"><img src="../../assets/images/noData.png"></div>
        <div class="noDataText">{{ $t('nav.history_noListText') }}</div>
        <p>{{ $t('nav.history_noListText2') }}</p>
        <button class="continue" @click="goHome">
          {{ $t('nav.history_noListButton') }}
          <img class="rightIcon" src="../../assets/images/rightIconSell.png" alt="">
        </button>
      </div>
      <div class="historyList" v-else>
        <van-list v-model="sellLoading" :finished="sellFinished" :finished-text="$t('nav.history_noMore')" @load="sellOnLoad" loading-text="Loading" error-text="Loading failed">
          <div class="van-clearfix">
            <div class="float-item curror" v-for="(item,index) in sell_historyList" :key="index" @click="goOrderDetails(item)">
              <div class="historyLi_header">
                <div class="historyLi_header_left">
                  <div class="cryptoCurrencyIcon"><img :src="item.cryptocurrencyCoin"></div>
                  <div class="cryptoCurrencyName">{{ item.cryptocurrency }}</div>
                </div>
                <div class="historyLi_header_right">
                  <p class="time">{{ item.orderDate }}</p>
                  <p class="righticon"><img src="../../assets/images/slices/right_icon.svg" alt=""></p>
                </div>
              </div>
              <div class="details_line">
                <div class="details_line_title">Order Amount ({{ item.cryptocurrency }})</div>
                <div class="details_line_value">
                  <span class="value" :class="{'noValue': noData(item.orderAmount) === '--'}">{{ noData(item.orderAmount) }}</span>
                </div>
              </div>
              <div class="details_line">
                <div class="details_line_title">Actual Amount ({{ item.cryptocurrency }})</div>
                <div class="details_line_value">
                  <span class="value" :class="{'noValue': noData(item.actualAmount) === '--'}">{{ noData(item.actualAmount) }}</span>
                </div>
              </div>
              <div class="details_line">
                <div class="details_line_title">Final Total ({{ item.fiatName }})</div>
                <div class="details_line_value">
                  <span class="value" :class="{'noValue': noData(item.finalTotal) === '--'}">{{ noData(item.finalTotal) }}</span>
                </div>
              </div>

              <!-- 订单状态 -->
              <div class="orderState">
                <div v-if="item.orderStatus === 2 || item.orderStatus === 1" class="state_loading">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Block Confirmed ({{ item.confirmBlock }}/{{ item.totalBlock }}) </div>
                  </div>
                  <div class="options" v-if="item.confirmBlock === 0">
                    <div class="optionsView state_loading_payNow curror" @click.stop="optionsPath(item,'payNow')">Pay Now</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 3" class="state_loading">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Confirm Order</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 4" class="state_loading">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">In Transfer</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 5" class="state_success">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Completed</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 6" class="state_failed">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Failed</div>
                  </div>
                  <p class="state_failed_tips">Fiat transfer rejected by bank. Please update bank info.</p>
                  <div class="options">
                    <div class="optionsView state_failed_refund curror" @click.stop="optionsPath(item,'refund')">Request Refund in USDT</div>
                    <div class="optionsView state_failed_Update curror" @click.stop="optionsPath(item,'bankInfo')">Update Bank Info</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 7" class="state_timeOut">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Closed</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 8" class="state_error"> <!--  && item.failureNumber >= 2 -->
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Failed</div>
                  </div>
                  <div class="options">
                    <div class="optionsView state_error_refund curror" @click.stop="optionsPath(item,'refund')">Request Refund in USDT</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 9" class="state_timeOut"> <!--  && item.failureNumber >= 2 -->
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Refunding</div>
                  </div>
                </div>
                <div v-else-if="item.orderStatus === 10" class="state_refunded">
                  <div class="orderState-line1">
                    <div class="state_circular"></div>
                    <div class="state_name">Refunded</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "TradeHistory",
  data(){
    return{
      //买币
      buyQuery: {
        orderState: 1,
        orderType: 1,
        pageIndex: 1,
        pageSize: 5
      },
      buy_historyList: [],

      buyLoading: false,
      buyFinished: false,

      //卖币
      sellQuery: {
        pageIndex: 1,
        pageSize: 5
      },
      sell_historyList: [],

      sellLoading: false,
      sellFinished: false,
    }
  },
  activated(){
    if(this.$store.state.historyTab === "buy"){
      this.buyQuery = {
        orderState: 1,
        orderType: 1,
        pageIndex: 1,
        pageSize: 5
      };
      this.buy_historyList = [];
      this.buyTransactionHistory();
    }else{
      this.sellQuery = {
        pageIndex: 1,
        pageSize: 5
      };
      this.sell_historyList = [];
      this.sellTransactionHistory();
    }
  },
  computed: {
    tabViewName(){
      return this.$store.state.historyTab;
    },
  },
  methods:{
    goHome(){
      this.$router.push('/')
    },

    changeTab(val){
      this.$store.state.historyTab = val;
      if(this.tabViewName === "buy"){
        this.buyQuery = {
          orderState: 1,
          orderType: 1,
          pageIndex: 1,
          pageSize: 5
        };
        this.buy_historyList = [];
        this.buyTransactionHistory();
      }else{
        this.sellQuery = {
          pageIndex: 1,
          pageSize: 5
        };
        this.sell_historyList = [];
        this.sellTransactionHistory();
      }
    },

    buyTransactionHistory(){
      let _this = this;
      this.$axios.get(this.$api.get_transactionHistory,this.buyQuery).then(res=>{
        if(res.data){
          let newArray = res.data.result.filter(item=>{return item.orderState !== 0 && item.orderState !== 6 && item.orderState !== 1});
          _this.buy_historyList = _this.buy_historyList.concat(newArray);
          _this.buyLoading = false;
          if ((_this.buyQuery.pageIndex * _this.buyQuery.pageSize) > res.data.total || _this.buy_historyList.length === res.data.total){
            _this.buyFinished = true;
          }
        }
      })
    },
    buyOnLoad(){
      setTimeout(() => {
        this.buyQuery.pageIndex += 1;
        this.buyTransactionHistory();
      }, 1000);
    },

    //卖币
    sellTransactionHistory(){
      let _this = this;
      this.$axios.get(this.$api.get_sellHistory,this.sellQuery).then(res=>{
        if(res.data){
          let newArray = res.data.result.filter(item=>{return item.orderState !== 0 && item.orderState !== 6});
          _this.sell_historyList = _this.sell_historyList.concat(newArray);
          _this.sellLoading = false;
          if ((_this.sellQuery.pageIndex * _this.sellQuery.pageSize) > res.data.total || _this.sell_historyList.length === res.data.total){
            _this.sellFinished = true;
          }
        }
      })
    },
    sellOnLoad(){
      setTimeout(() => {
        this.sellQuery.pageIndex += 1;
        this.sellTransactionHistory();
      }, 1000);
    },

    //跳转详情
    goOrderDetails(val){
      this.$router.push(`/tradeHistory-details?orderId=${val.orderId}`);
    },

    //退款、修改银行卡信息
    optionsPath(val,state) {
      let _this = this;
      //修改银行卡信息
      if (state === 'bankInfo') {
        this.$store.state.cardInfoFromPath = 'sellOrder';
        this.$router.push(`/sell-formUserInfo?sellOrderId=${val.orderId}`);
        return
      }
      //状态为2 - 区块链确认中、确认数量为0
      if (state === 'payNow') {
        let params = {
          orderId: val.orderId
        }
        this.$axios.get(this.$api.get_PlayCurrencyStatus,params).then(res=>{
          if(res && res.returnCode === '0000'){
            _this.$store.state.sellOrderId = val.orderId;
            _this.$store.state.nextOrderState = 1;
            //费用接口所需参数
            this.$store.state.sellRouterParams.amount = val.orderAmount;
            this.$store.state.feeParams_order = {
              symbol: val.cryptocurrency + "USDT",
              fiatCode: val.fiatName,
              alpha2: res.data.alpha2,
            };
            //获取网络接口所需加密货币
            this.$store.state.sellRouterParams.cryptoCurrency = val.cryptocurrency;
            _this.$router.push(`/sellOrder`);
          }
        })
        return;
      }
      //退款
      this.$router.push(`/Refund?orderId=${val.orderId}&cryptocurrency=${val.cryptocurrency}&fiatName=${val.fiatName}`);
    },

    //数据判空 - null、""、不存在这个字段
    noData(val){
      if(val !== null && val !== '' && val !== undefined){
        return val
      }
      return "--"
    },

  }
}
</script>

<style lang="scss" scoped>
html,body,#tradeHistory,.historyList,.van-list{
  height: 100%;
}

.tabView{
  width: 100%;
  height: 0.5rem;
  background: #FFFFFF;
  border: 1px solid #EEEEEE;
  border-radius: 0.25rem;
  display: flex;
  margin-bottom: 0.24rem;
  .tab{
    flex: 1;
    font-family: 'SFProDisplayMedium',SFProDisplayMedium;
    font-weight: 500;
    font-size: 0.16rem;
    line-height: 0.5rem;
    color: #6E7687;
    text-align: center;
    cursor: pointer;
  }
}
.tabView-left{
  color: #FFFFFF !important;
  background: #0059DA;
  border: 1px solid #0059DA !important;
  border-radius: 0.25rem 0 0 0.25rem;
}
.tabView-right{
  color: #FFFFFF !important;
  background: #0059DA;
  border: 1px solid #0059DA !important;
  border-radius: 0 0.25rem 0.25rem 0;
}

.curror{
  cursor: pointer;
}

#tradeHistory{
  padding-top: 0.24rem;
  .float-item{
    background: #FFFFFF;
    border-radius: 0.06rem;
    border: 1px solid #EEEEEE;
    margin-top: 0.12rem;
    padding-bottom: 0.2rem;
    &:first-child{
      margin-top: 0;
    }
    .historyLi_header{
      display: flex;
      align-items: center;
      font-family: SFProDisplayMedium;
      font-weight: 500;
      font-size: 0.13rem;
      color: #031633;
      min-height: 0.52rem;
      padding: 0 0.16rem;
      background: #F7F8FA;
      border-radius: 0.06rem 0.06rem 0 0;
      .historyLi_header_left{
        display: flex;
        align-items: center;
        .cryptoCurrencyIcon{
          display: flex;
          align-content: center;
          width: 0.2rem;
          img{
            width: 0.2rem;
            height: 0.2rem;
            border-radius: 50%;
          }
        }
        .cryptoCurrencyName{
          line-height: 0.16rem;
          font-size: 0.13rem;
          font-family: SFProDisplayMedium;
          color: #031633;
          margin-left: 0.08rem;
        }
      }
      .historyLi_header_right{
        font-family: SFProDisplayRegular;
        font-weight: 400;
        font-size: 0.13rem;
        line-height: 0.14rem;
        color: #6E7687;
        margin-left: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        .time{
          margin-right: 0.08rem;
        }
        .righticon{
          display: flex;
          align-items: center;
          width: 0.14rem;
          img{
            width: 100%;
          }
        }
      }
    }

    .details_line{
      font-family: SFProDisplayRegular;
      font-weight: 400;
      font-size: 0.13rem;
      line-height: 0.14rem;
      color: #6E7687;
      display: flex;
      align-items: flex-start;
      margin-top: 0.16rem;
      padding: 0 0.16rem;
      &:last-child{
        padding-bottom: 0.16rem;
      }
      .details_line_value{
        max-width: 60%;
        word-wrap: break-word;
        font-weight: 500;
        margin-left: auto;
        .value{
          font-family: SFProDisplayMedium;
          font-weight: 500;
          font-size: 0.13rem;
          line-height: 0.14rem;
          color: #031633;
        }
        .noValue{
          font-family: SFProDisplayRegular;
          font-weight: 400;
          font-size: 0.13rem;
          line-height: 0.14rem;
          color: #6E7687;
        }
      }
      .address_value{
        margin-right: -0.06rem;
        font-size: 0.15rem;
        font-family: "GeoDemibold", GeoDemibold;
        font-weight: normal;
        color: #031633;
      }
    }

    .orderState{
      margin-left: auto;
      font-family: SFProDisplayRegular;
      font-weight: 400;
      font-size: 0.13rem;
      margin-top: 0.24rem;
      padding: 0 0.12rem;
      .orderState-line1{
        display: flex;
        align-items: center;
        justify-content: right;
        padding: 0 0.04rem;
        .state_circular{
          width: 0.05rem;
          height: 0.05rem;
          border-radius: 100%;
          margin-right: 0.04rem;
        }
      }
      .state_success{
        color: #0AB24D;
        .state_circular{
          background: #0AB24D;
        }
      }
      .state_loading{
        color: #0047AD;
        .state_circular{
          background: #0047AD;
        }
      }
      .state_failed{
        color: #FF8D24;
        .state_circular{
          background: #FF8D24;
        }
      }
      .state_timeOut{
        color: #6E7687;
        .state_circular{
          background: #6E7687;
        }
      }
      .state_failed_tips{
        font-weight: 400;
        font-size: 0.1rem;
        margin-top: 0.04rem;
        padding: 0 0.04rem;
        text-align: right;
      }
      .options{
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        .optionsView{
          width: 48%;
          height: 0.28rem;
          border-radius: 0.14rem;
          font-family: SFProDisplayRegular;
          font-weight: 400;
          font-size: 0.1rem;
          line-height: 0.28rem;
          text-align: center;
          margin-top: 0.16rem;
        }
        .state_failed_refund{
          background: #F4F5F7;
          border: 1px solid #D9D9D9;
          color: #031633;
        }
        .state_failed_Update{
          background: #FFEEDE;
          border: 1px solid #FFDAB8;
          color: #FF8D24;
          margin-left: 0.1rem;
        }
        .state_error_refund{
          background: #FFE8E8;
          border: 1px solid #FFBBBB;
          color: #FF2F2F;
        }
        .state_loading_payNow{
          background: #E8F1FF;
          border: 1px solid #9FC6FF;
          color: #0047AD;
        }
      }
      .state_error{
        color: #FF2F2F;
        .state_circular{
          background: #FF2F2F;
        }
      }
      .state_refunded{
        color: #1EC109;
        .state_circular{
          background: #1EC109;
        }
      }
    }
  }

  .noData{
    text-align: center;
    margin: 0 auto;
    .noDataImg{
      display: flex;
      justify-content: center;
      margin-top: 1rem;
      img{
        width: 1rem;
      }
    }
    p{
      font-size: 0.13rem;
      font-family: SFProDisplayRegular;
      font-weight: normal;
      color: #6E7687;
      margin: 0.08rem 0 0 0;
    }
    .noDataText{
      text-align: center;
      margin-top: 0.08rem;
      font-size: 0.2rem;
      font-family: SFProDisplaybold;
      font-weight: normal;
      color: #031633;
    }
    .continue{
      width: 100%;
      height: 0.58rem;
      background: #0059DA;
      border-radius: 0.29rem;
      font-size: 0.17rem;
      font-family: SFProDisplayRegular;
      font-weight: normal;
      color: #FFFFFF;
      margin-top: 0.16rem;
      cursor: pointer;
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      .rightIcon{
        width: 0.2rem;
        margin-left: .1rem;
        margin-top: .01rem;
      }
    }
    .continue:disabled{
      background: rgba(0, 89, 218, 0.5);
      cursor: no-drop;
    }
  }
}
</style>
