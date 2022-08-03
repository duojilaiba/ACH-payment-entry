<template>
  <div id="tradeHistory-details">
    <div class="content">
      <div class="line-height1">
        <div class="left">Sell {{ detailsData.cryptocurrency }}</div>
        <div class="right">
          <div class="statusView" v-if="detailsData.orderStatus === 2 || detailsData.orderStatus === 1">
            <div></div>
            <div>Block Confirmed ({{ detailsData.confirmBlock }}/{{ detailsData.totalBlock }}) </div>
          </div>
          <div class="statusView" v-if="detailsData.orderStatus === 3">
            <div></div>
            <div>Confirm Order</div>
          </div>
          <div class="statusView" v-if="detailsData.orderStatus === 4">
            <div></div>
            <div>In Transfer</div>
          </div>
          <div class="statusView completed" v-else-if="detailsData.orderStatus === 5">
            <div></div>
            <div>Completed</div>
          </div>
          <div class="statusView failed1" v-else-if="detailsData.orderStatus === 6">
            <div></div>
            <div>Failed</div>
          </div>
          <div class="statusView timeout" v-else-if="detailsData.orderStatus === 7">
            <div></div>
            <div>Closed</div>
          </div>
          <div class="statusView failed3" v-else-if="detailsData.orderStatus === 8">
            <div></div>
            <div>Failed</div>
          </div>
          <div class="statusView timeout" v-else-if="detailsData.orderStatus === 9">
            <div></div>
            <div>Refunding</div>
          </div>
          <div class="statusView failed2" v-else-if="detailsData.orderStatus === 10">
            <div></div>
            <div>Refunded</div>
          </div>
        </div>
      </div>
      <div class="amountInfo">
        <div class="amountInfo-line">
          <div class="left">Order Amount ({{ detailsData.cryptocurrency }})</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.orderAmount) === '--'}">{{ noData(detailsData.orderAmount) }}</span>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">Actual Amount ({{ detailsData.cryptocurrency }})</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.actualAmount) === '--'}">{{ noData(detailsData.actualAmount) }}</span>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">Price ({{ detailsData.fiatName }})</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.price) === '--'}">{{ noData(detailsData.price) }}</span>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">Total ({{ detailsData.fiatName }})</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.total) === '--'}">{{ noData(detailsData.total) }}</span>
          </div>
        </div>
        <div class="amountInfo-line" v-if="detailsData.failureNumber < 2">
          <div class="left">Ramp Fee ({{ detailsData.fiatName }})</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.rampFee) === '--'}">{{ noData(detailsData.rampFee) }}</span>
          </div>
        </div>
        <div class="amountInfo-line" v-if="detailsData.orderStatus === 6 || detailsData.orderStatus === 11 || detailsData.orderStatus === 8 || detailsData.orderStatus === 10">
          <div class="left">Return fee ({{ detailsData.fiatName }})</div>
          <div class="right">
            <span class="value" v-if="detailsData.returnFee !== '' && detailsData.returnFee !== null">{{ detailsData.returnFee }}<span class="fee" v-if="detailsData.fiatName !== 'USD'">({{ 25 * detailsData.failureNumber }} USD)</span></span>
            <span class="empty" v-else>-- </span>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">Final Total ({{ detailsData.fiatName }})</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.finalTotal) === '--'}">{{ noData(detailsData.finalTotal) }}</span>
          </div>
        </div>
      </div>

      <div class="orderStatus">
        <div class="title">
          <div class="left">Status</div>
          <div class="right">
            <span v-if="detailsData.orderStatus === 2 || detailsData.orderStatus === 1">Block Confirmed</span>
            <span v-if="detailsData.orderStatus === 3">Confirm Order</span>
            <span v-if="detailsData.orderStatus === 4">In Transfer</span>
            <span class="completed" v-else-if="detailsData.orderStatus === 5">Completed</span>
            <span class="failed1" v-else-if="detailsData.orderStatus === 6 || detailsData.orderStatus === 11">Failed</span>
            <span class="timeout" v-else-if="detailsData.orderStatus === 7">Closed</span>
            <span class="failed3" v-else-if="detailsData.orderStatus === 8">Failed</span>
            <span class="failed2" v-else-if="detailsData.orderStatus === 10">Failed</span>
            <span class="timeout" v-else-if="detailsData.orderStatus === 9">Refunding</span>
          </div>
        </div>
        <div class="speed-progress">
          <div class="percentage" :style="{width: percentage + '%'}"
               :class="{
                'completed': (detailsData.orderStatus === 2 && detailsData.confirmBlock !== 0) || (detailsData.orderStatus >= 3 && detailsData.orderStatus <= 5),
                'failed': detailsData.orderStatus === 6 || detailsData.orderStatus === 11,
                'timeOut': detailsData.orderStatus === 7 || detailsData.orderStatus === 9,
                'refunded': detailsData.orderStatus === 8 || detailsData.orderStatus === 10 }"></div>
          <div class="all"></div>
        </div>
      </div>

      <div class="orderInfo">
        <div class="amountInfo-line">
          <div class="left">Order ID:</div>
          <div class="right">
            <div class="copyView" :data-clipboard-text="detailsData.orderId" @click="copy">
              <div class="copyValue">{{ detailsData.orderId }}</div>
              <div class="icon"><img src="@/assets/images/copy_history.svg" alt=""></div>
            </div>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">Order Time:</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.orderTime) === '--'}">{{ noData(detailsData.orderTime) }}</span>
          </div>
        </div>
        <div class="amountInfo-line" v-if="(detailsData.orderStatus >= 3 && detailsData.orderStatus <= 9 && detailsData.orderStatus !== 7) || (detailsData.orderStatus === 2 && detailsData.confirmBlock !== 0)">
          <div class="left">Confirmed Time:</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.confirmedTime) === '--'}">{{ noData(detailsData.confirmedTime) }}</span>
          </div>
        </div>
        <!-- Completed -->
        <div class="amountInfo-line" v-if="(detailsData.orderStatus >= 5 && detailsData.orderStatus <= 9 && detailsData.orderStatus !== 7)">
          <div class="left">Transfer Time:</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.transferTime) === '--'}">{{ noData(detailsData.transferTime) }}</span>
          </div>
        </div>
        <!-- Failed - 2 -->
        <div class="amountInfo-line" v-if="detailsData.orderStatus === 8 || detailsData.orderStatus === 10">
          <div class="left">Refund Time:</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.refundTime) === '--'}">{{ noData(detailsData.refundTime) }}</span>
          </div>
        </div>
      </div>

      <div class="orderInfo" v-if="(detailsData.orderStatus >= 3 && detailsData.orderStatus <= 9 && detailsData.orderStatus !== 7) || (detailsData.orderStatus === 2 && detailsData.confirmBlock !== 0)">
        <div class="amountInfo-line">
          <div class="left">Network:</div>
          <div class="right">
            <span class="value" :class="{'empty': noData(detailsData.network) === '--'}">{{ noData(detailsData.network) }}</span>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">Address:</div>
          <div class="right">
            <div class="copyView" :data-clipboard-text="detailsData.orderId" @click="copy">
              <div class="copyValue">{{ detailsData.address }}</div>
              <div class="icon"><img src="@/assets/images/copy_history.svg" alt=""></div>
            </div>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">TxID:</div>
          <div class="right">
            <div class="copyView" :data-clipboard-text="detailsData.orderId" @click="copy">
              <div class="copyValue">{{ detailsData.txID }}</div>
              <div class="icon"><img src="@/assets/images/copy_history.svg" alt=""></div>
            </div>
          </div>
        </div>
        <div class="amountInfo-line">
          <div class="left">Recipient Account:</div>
          <div class="right">
            <span class="value">**** {{ detailsData.account ? detailsData.account.substring(detailsData.account.length-4,detailsData.account.length) : '' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- failed - 1 -->
    <footer v-if="detailsData.orderStatus === 6 || detailsData.orderStatus === 8 || (detailsData.orderStatus === 1 && detailsData.confirmBlock === 0)">
      <!-- 重新购买 -->
      <div v-if="detailsData.orderStatus === 6">
        <button class="update-card-info" @click="updateCardInfo">
          Update Information
<!--          <span class="witchBank">Mastercard</span>-->
          <span class="bankCard" v-if="detailsData.account">****{{ detailsData.account.substring(detailsData.account.length-4,detailsData.account.length) }}</span>
          <img src="@/assets/images/right_icon_orange.svg" alt="">
        </button>
        <!-- 退款 -->
        <p @click="refund">Request Refund of USDT</p>
      </div>
      <button class="update-card-info refund-8" @click="updateCardInfo" v-else-if="detailsData.orderStatus === 8">
        Request Refund of USDT
        <img src="@/assets/images/refund-right-icon.png" alt="">
      </button>
      <!-- 去付款 -->
      <button class="pay-now" @click="payNow" v-else-if="detailsData.orderStatus === 1 && detailsData.confirmBlock === 0">Pay Now</button>
    </footer>
  </div>
</template>

<script>
import Clipboard from "clipboard";

export default {
  name: "tradeHistory-details",
  data(){
    return{
      detailsData: {},
      timeOut: null
    }
  },
  activated(){
    this.orderId = this.$route.query.orderId;
    this.detailsInfo();
    this.timeOut = setInterval(()=>{
      this.detailsInfo();
    },1000)
  },
  computed: {
    percentage(){
      if(this.detailsData.orderStatus === 2){
        return 25
      }else if(this.detailsData.orderStatus === 3){
        return 50
      }else if(this.detailsData.orderStatus === 4){
        return 75
      }else{
        return 100
      }
    }
  },
  methods: {
    detailsInfo(){
      let params = {
        orderId: this.orderId
      }
      this.$axios.get(this.$api.get_sellOrderDetails,params).then(res=>{
        if(res && res.returnCode === '0000'){
          if([5,6,7,10,11].includes(res.data.orderStatus)){
            window.clearInterval(this.timeOut);
            this.timeOut = null;
          }
          this.detailsData = res.data;
        }
      })
    },

    updateCardInfo(){
      this.$store.state.cardInfoFromPath = 'sellOrder';
      this.$router.push(`/sell-formUserInfo?sellOrderId=${this.orderId}`);
    },
    refund(){
      this.$router.push(`/Refund?orderId=${this.orderId}&cryptocurrency=${this.detailsData.cryptocurrency}&fiatName=${this.detailsData.fiatName}`);
    },
    payNow(){
      let _this = this;
      let params = {
        orderId: this.detailsData.orderId
      }
      this.$axios.get(this.$api.get_PlayCurrencyStatus,params).then(res=>{
        if(res && res.returnCode === '0000'){
          _this.$store.state.sellOrderId = this.detailsData.orderId;
          _this.$store.state.nextOrderState = 1;
          //费用接口所需参数
          this.$store.state.sellRouterParams.amount = this.detailsData.orderAmount;
          this.$store.state.feeParams_order = {
            symbol: this.detailsData.cryptocurrency + "USDT",
            fiatCode: this.detailsData.fiatName,
            alpha2: res.data.alpha2,
          };
          //获取网络接口所需加密货币
          this.$store.state.sellRouterParams.cryptoCurrency = this.detailsData.cryptocurrency;
          _this.$router.push(`/sellOrder`);
        }
      })
    },

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

    //数据判空 - null、""、不存在这个字段
    noData(val){
      if(val !== null && val !== '' && val !== undefined){
        return val
      }
      return "--"
    },
  },
  deactivated(){
    window.clearInterval(this.timeOut);
    this.timeOut = null;
  },
}
</script>

<style lang="scss" scoped>
#tradeHistory-details{
  display: flex;
  flex-direction: column;
  .content{
    flex: 1;
    overflow: auto;
    .line-height1{
      min-height: 0.18rem;
      display: flex;
      align-items: center;
      margin-top: 0.32rem;
      padding-bottom: 0.16rem;
      border-bottom: 1px solid #D9D9D9;
      .left{
        font-family: SFProDisplayMedium;
        font-weight: 500;
        font-size: 0.16rem;
        color: #031633;
      }
      .right{
        margin-left: auto;
        .statusView{
          margin-left: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: SFProDisplayRegular;
          font-weight: 400;
          font-size: 0.13rem;
          color: #0047AD;
          div:first-child{
            width: 0.05rem;
            height: 0.05rem;
            border-radius: 50%;
            background: #0047AD;
            margin-right: 0.04rem;
          }
        }
        .completed{
          color: #0AB24D;
          div:first-child{
            background: #0AB24D;
          }
        }
        .failed1{
          color: #FF8D24;
          div:first-child{
            background: #FF8D24;
          }
        }
        .timeout{
          color: #6E7687;
          div:first-child{
            background: #6E7687;
          }
        }
        .failed2{
          color: #1EC109;
          div:first-child{
            background: #1EC109;
          }
        }
        .failed3{
          color: #FF2F2F;
          div:first-child{
            background: #FF2F2F;
          }
        }
      }
    }

    .amountInfo-line{
      min-height: 0.14rem;
      display: flex;
      align-items: center;
      font-family: SFProDisplayRegular;
      font-weight: 400;
      font-size: 0.13rem;
      color: #6E7687;
      margin-top: 0.16rem;
      .left{
        margin-right: 0.2rem;
      }
      .right{
        margin-left: auto;
        .empty{
          font-family: SFProDisplayRegular !important;
          font-weight: 400 !important;
          font-size: 0.13rem;
          line-height: 0.14rem;
          color: #6E7687 !important;
        }
        .value{
          font-family: SFProDisplayMedium;
          font-weight: 500;
          font-size: 0.13rem;
          color: #031633;
        }
        .fee{
          color: #6E7687;
        }
        .copyView{
          display: flex;
          align-items: center;
          cursor: pointer;
          .copyValue{
            max-width: 1.8rem;
            font-family: SFProDisplayMedium;
            font-style: normal;
            font-weight: 500;
            font-size: 0.13rem;
            color: #6E7687;
            overflow: hidden;/*超出部分隐藏*/
            white-space: nowrap;/*不换行*/
            text-overflow:ellipsis;/*超出部分文字以...显示*/
            text-align: right;
          }
          .icon{
            display: flex;
            align-items: center;
            margin-left: 0.04rem;
            width: 0.2rem;
            img{
              width: 0.2rem;
            }
          }
        }
      }
    }

    .orderStatus{
      min-height: 0.25rem;
      margin-top: 0.16rem;
      .title{
        display: flex;
        align-items: center;
        font-family: SFProDisplayRegular;
        font-weight: 400;
        font-size: 0.13rem;
        color: #6E7687;
        .right{
          margin-left: auto;
          font-family: SFProDisplayRegular;
          font-style: normal;
          font-weight: 400;
          font-size: 0.13rem;
          color: #0047AD;
          .completed{
            font-family: SFProDisplayRegular;
            font-weight: 400;
            font-size: 0.13rem;
            color: #0AB24D;
          }
          .failed1{
            color: #FF8D24;
          }
          .timeout{
            color: #6E7687;
          }
          .failed2{
            color: #FF2F2F;
          }
          .failed3{
            color: #FF2F2F;
          }
        }
      }
      .speed-progress{
        width: 100%;
        margin-top: 0.08rem;
        position: relative;
        .all{
          width: 100%;
          height: 0.04rem;
          background: #F7F8FA;
          border-radius: 0.04rem;
        }
        .percentage{
          width: 100%;
          height: 0.04rem;
          border-radius: 0.04rem;
          position: absolute;
          left: 0;
          top: 0;
        }
        .completed{
          background: #0AB24D;
        }
        .failed{
          background: #FF8D24;
        }
        .timeOut{
          background: #6E7687;
        }
        .refunded{
          background: #FF2F2F;
        }
      }
    }
    .orderInfo{
      width: 100%;
      min-height: 0.9rem;
      background: #F7F8FA;
      border-radius: 0.06rem;
      padding: 0.2rem 0.16rem;
      margin-top: 0.16rem;
      .amountInfo-line:first-child{
        margin-top: 0;
      }
      &:last-child{
        margin-top: 0.12rem;
      }
    }
  }
  footer{
    padding-top: 0.16rem;
    box-shadow: 0 0 0.35rem rgba(89, 153, 248, 0.1);
    .update-card-info{
      width: 100%;
      height: 0.56rem;
      background: #FFEEDE;
      border: 1px solid #FFDAB8;
      border-radius: 0.28rem;
      font-family: SFProDisplayMedium;
      font-weight: 500;
      font-size: 0.16rem;
      color: #FF8D24;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      .witchBank{
        margin-left: 0.12rem;
        font-family: SFProDisplayRegular;
        font-weight: 400;
        font-size: 0.1rem;
        color: #FF8D24;
      }
      .bankCard{
        margin-left: 0.04rem;
        font-family: SFProDisplayRegular;
        font-weight: 400;
        font-size: 0.1rem;
        color: #FF8D24;
      }
      img{
        width: 0.16rem;
        margin-left: 0.08rem;
      }
    }
    .refund-8{
      color: #FF2F2F;
      background: #FFE8E8;
      border: 1px solid #FFBBBB;
      position: relative;
      img{
        position: absolute;
        right: 0.12rem;
      }
    }
    .pay-now{
      cursor: pointer;
      width: 100%;
      height: 0.56rem;
      line-height: 0.56rem;
      text-align: center;
      background: #E8F1FF;
      border: 1px solid #9FC6FF;
      border-radius: 0.28rem;
      font-family: SFProDisplayMedium;
      font-weight: 500;
      font-size: 0.16rem;
      color: #0047AD;
    }
    p{
      min-height: 0.14rem;
      font-family: SFProDisplayRegular;
      font-weight: 400;
      font-size: 0.13rem;
      color: #0047AD;
      margin-top: 0.16rem;
      text-align: center;
      cursor: pointer;
    }
  }
}
</style>
