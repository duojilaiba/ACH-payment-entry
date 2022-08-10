<template>
  <div id="receiveCoins">
    <!-- select network -->
    <search v-if="searchViewState" :viewName="viewName" :allBasicData="networkList"/>
    <!-- Select acceptance method -->
    <div class="receiveCoins-view" v-show="!searchViewState">
      <div class="receiveCoins-content">
        <div>
          <div class="methods_myAddress">
            <div class="methods_title">
              <div>Enter your<span class="network-name"> {{ networkInfo.networkName }} </span>address</div>
              <div class="icon" v-if="networkDefault" @click="openSelect"><img src="@/assets/images/Frametransformation-icon.png"></div>
            </div>
            <div class="methods_input">
              <input type="text" v-model="buyParams.address" placeholder="Enter your wallet address" @input="networkAddressChange" :disabled="addressDefault">
              <div class="rightIcon" :class="{'noDrop': addressDefault}"><img src="@/assets/images/scanCode_icon.svg"></div>
            </div>
            <div class="methods_errorText" v-if="walletAddress_state">{{ $t('nav.buy_receivingMode_addressTips1') }} {{ buyParams.cryptoCurrency }} {{ $t('nav.buy_receivingMode_addressTips2') }}</div>
          </div>
          <div class="methods_myAddress">
            <div class="methods_title">Memo</div>
            <div class="methods_input">
              <input type="text" v-model="buyParams.memo">
            </div>
          </div>
        </div>
      </div>
      <div class="continueBox" v-show="!searchViewState">
        <button class="continue" @click="transaction" :disabled="disabled" >
          {{ $t('nav.Continue') }}
          <img class="rightIcon" src="../../../assets/images/button-right-icon.svg" alt="">
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { AES_Decrypt } from '@/utils/encryp.js';
import search from "../../../components/search"; //:network="buyParams.network"

/**
 * searchViewState - Control search selection network components (viewName: The component needs to determine which entrance to enter,allBasicData: Network Data).
 * receiveCoins_ref - Used to search and modify parent component network information.
 */
export default {
  name: "",
  components: { search },
  data(){
    return{
      routerParams: {},
      email: "",

      //页面所需参数
      buyParams: {
        cryptoCurrency: "",
        address: "",
        network: "",
        fiatCurrency: "",
        amount: 0,
        depositType: 1,
        memo: '',
        payWayCode: '' //支付方式
      },

      //网络列表
      networkList: [],
      //商户状态下 - 网络、地址禁选状态
      networkDefault: false,
      addressDefault: false,

      //网络信息
      networkInfo: {
        networkName: '',
        addressRegex: '',
      },
      //网络错误信息状态
      walletAddress_state: false,

      //网络组件信息
      searchViewState: false,
      viewName: '',
    }
  },
  computed: {
    disabled(){
      if(this.buyParams.network!=='' && this.buyParams.address!=='' && new RegExp(this.networkInfo.addressRegex).test(this.buyParams.address)){
        return false
      }else{
        return true
      }
    }
  },
  beforeRouteEnter(to,from,next) {
    next(vm => {
      if (from.path === '/' && to.path === '/receivingMode') {
        vm.buyParams = {
          cryptoCurrency: "",
          address: "",
          network: "",
          fiatCurrency: "",
          amount: 0,
          depositType: 1,
          payWayCode: '' //支付方式
        };
        vm.networkInfo.networkName = "";
        vm.networkInfo.addressRegex = '';
        vm.walletAddress_state = false;
      }
    })
  },
  activated() {
    this.routingInformation();
  },
  methods: {
    networkAddressChange(){
      if(!new RegExp(this.networkInfo.addressRegex).test(this.buyParams.address)){
        this.walletAddress_state = true;
      }else{
        this.walletAddress_state = false;
      }
    },
    //Get address bar information
    routingInformation(){
      localStorage.getItem("email") ? this.email = AES_Decrypt(localStorage.getItem("email")) : this.email = '';
      this.routerParams = this.$store.state.buyRouterParams;
      this.networkInfo = this.$store.state.buyRouterParams.buyNetwork;
      this.buyParams.network = this.networkInfo.network;
      let merchantInfo = JSON.parse(sessionStorage.getItem("accessMerchantInfo"));
      if(merchantInfo !== "{}" && (merchantInfo.networkDefault === true || merchantInfo.networkDefault === undefined)){
        this.networkInfo.networkName = this.networkList.filter(item=>{return merchantInfo.network === item.network})[0].networkName;
      }
      //essential information
      this.buyParams.fiatCurrency = this.$store.state.buyRouterParams.payCommission.code;
      this.buyParams.cryptoCurrency = this.$store.state.buyRouterParams.cryptoCurrency;
      this.buyParams.amount = this.$store.state.buyRouterParams.amount;
      this.verifyMerchantInfo();
    },

    verifyMerchantInfo(){
      let merchantInfo = JSON.parse(sessionStorage.getItem("accessMerchantInfo"));
      //network
      if(merchantInfo !== "{}" && merchantInfo.networkDefault === true){
        this.networkDefault = false;
      }else if(merchantInfo !== "{}" && merchantInfo.networkDefault === false || merchantInfo.networkDefault === undefined){
        this.networkDefault = true;
      }

      //address
      if(merchantInfo !== "{}" && merchantInfo.addressDefault === false || merchantInfo.addressDefault === undefined){
        this.addressDefault = false;
      }else if(merchantInfo !== "{}" && merchantInfo.addressDefault === true){
        this.addressDefault = true;
        this.buyParams.address = merchantInfo.address;
      }

      this.queryNetwork();
    },

    //Get network list
    queryNetwork(){
      let params = {
        coin: this.buyParams.cryptoCurrency
      }
      this.$axios.get(this.$api.get_network,params).then(res=>{
        if(res && res.returnCode === "0000") {
          this.networkList = res.data.networkList;
        }
      })
    },

    //Displays the selected network view
    openSelect(){
      if(this.networkDefault === true){
        this.$parent.$refs.viewTab.tabState = false;
        this.searchViewState = true;
        this.viewName = 'network';
      }
    },
    selectNetwork(item){
      this.buyParams.network = item.network;
      this.networkInfo.networkName = item.networkName;
      this.$store.state.buyRouterParams.buyNetwork = item
      this.networkInfo.addressRegex = item.addressRegex;
      this.networkAddressChange();
    },

    //跳转选择支付方式页 整理下单接口和routerParams路由信息
    transaction(){
      this.$store.state.placeOrderQuery = {};
      let buyParams = JSON.parse(JSON.stringify(this.buyParams));
      buyParams.alpha2 = this.$store.state.buyRouterParams.positionData.alpha2;
      //下单接口参数
      if(buyParams.address === '' || buyParams.network === ''){
        return;
      }
      if(!new RegExp(this.networkInfo.addressRegex).test(buyParams.address)){
        this.walletAddress_state = true;
        return;
      }
      this.walletAddress_state = false;

      //商户接入字段 下单接口参数
      let merchantInfo = JSON.parse(sessionStorage.getItem("accessMerchantInfo"));
      if(merchantInfo.merchantParam_state === true){
        buyParams.merchantParam = merchantInfo.merchantParam;
      }

      //跳转选择支付方式 支付方式页调取下单接口
      this.$store.state.buyRouterParams.networkDefault = buyParams.network;
      this.$store.state.buyRouterParams.addressDefault = buyParams.address;
      this.$store.state.placeOrderQuery = buyParams;

      this.$router.push('/paymentMethod');
    },
  }
}
</script>

<style lang="scss" scoped>
#receiveCoins{
  .receiveCoins-view{
    height: 100%;
    display: flex;
    flex-direction: column;
    .receiveCoins-content{
      flex: 1;
      overflow: auto;
    }
  }
  .receiveCoins-content{
    margin-top: 0.27rem;
    .methods_myAddress{
      position: relative;
      margin-top: 0.24rem;
      &:first-child{
        margin-top: 0;
      }
      div{
        display: flex;
        align-items: center;
      }
      .methods_input{
        position: relative;
        height: 0.56rem;
        background: #FFFFFF;
        border-radius: 0.06rem;
        margin-top: 0.08rem;
        input{
          width: 100%;
          height: 100%;
          border-radius: 0.06rem;
          border: 1px solid #D9D9D9;
          outline: none;
          padding: 0 0.56rem 0 0.16rem;
          color: #6E7687;
          font-size: 0.13rem;
          font-weight: 400;
          font-family: SFProDisplayRegular;
          &::placeholder{
            color: #BFBFBF;
            font-weight: 400;
          }
          &:disabled{
            cursor: no-drop;
          }
          &:focus{
            border: 1px solid #41B8FD !important;
            box-shadow: 0 0 0.35rem rgba(89, 153, 248, 0.2);
          }
        }
        .rightIcon{
          position: absolute;
          right: 0.21rem;
          display: flex;
          cursor: pointer;
          img{
            width: 0.2rem;
          }
        }
      }
      .selectNetwork{
        width: 100%;
        height: 0.56rem;
        border-radius: 0.12rem;
        font-size: 0.16rem;
        font-family: "GeoRegular", GeoRegular;
        background: #F3F4F5;
        padding: 0 0.16rem;
        .networkPlaceholder{
          color: #999999;
        }
      }
      .disabled{
        cursor: no-drop;
      }
      .methods_errorText{
        position: absolute;
        font-size: 0.13rem;
        font-family: "GeoLight", GeoLight;
        font-weight: 400;
        color: #E55643;
        margin: 0.08rem 0.2rem 0 0.16rem;
      }
      .methods_title{
        font-family: SFProDisplayRegular;
        font-weight: 400;
        font-size: 0.13rem;
        line-height: 0.14rem;
        color: #6E7687;
        white-space:pre;
        display: flex;
        align-items: center;
        .network-name{
          font-family: SFProDisplayMedium;
          color: #031633;
        }
        .icon{
          margin-left: auto;
          cursor: pointer;
          margin-right: 0.2rem;
          img{
            width: 0.2rem;
            height: 0.2rem;
          }
        }
      }
    }
  }

  .continueBox{
    width: 100%;
    background: white;
    border-radius: 25px;
    z-index: 2020;
    display: flex;
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
      right: 0.32rem;
    }
  }
  .continue:disabled{
    background: rgba(0, 89, 218, 0.5);
    cursor: no-drop;
  }
}

.noDrop{
  cursor: no-drop;
}
</style>
