<template>
  <div id="refund">
    <p class="title">Enter your Tron ({{ $store.state.sellRouterParams.currencyData.name }}) address </p>
    <div class="walletAddress">
      <input type="text" v-model="walletAddress" placeholder="Enter your wallet address" @input="addressChange">
      <img src="@/assets/images/scanCode_icon.svg" alt="" @click="scanCode_state=true">
      <p class="errorMessage" v-if="errorState">Invalid address</p>
    </div>
    <p class="exchangeRate">1 USD ≈ {{ refundInfo.price }} {{ $store.state.sellRouterParams.currencyData.name }}</p>
    <!-- 扫码 -->
    <div class="scanCode" v-if="scanCode_state">
      <qrcode-stream @decode="onDecode" @init="onInit" />
    </div>
    <footer>
      <p class="tips"><span>Pay attention:</span> Please make sure the address you enter is correct and belong to the network that you choose. If you enter incompatible address, you will lose your funds.</p>
      <button :disabled="disabled" @click="confirmRefund">Confirm <img src="@/assets/images/button-right-icon.svg" alt=""></button>
    </footer>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader';

export default {
  name: "Refund",
  components: {
    QrcodeStream
  },
  data(){
    return{
      walletAddress: "",
      scanCode_state: false,
      error: '',
      errorState: false,
      refundInfo: {
        price: '',
        addressRegex: '',
      }
    }
  },
  computed: {
    disabled(){
      if(this.walletAddress === '' || this.errorState){
        return true
      }else{
        return false
      }
    }
  },

  activated(){
    this.orderId = this.$route.query.orderId;
    this.queryRefundInfo();
  },
  methods: {
    addressChange(){
      if(!new RegExp(this.refundInfo.addressRegex).test(this.walletAddress)){
        this.errorState = true
      }else{
        this.errorState = false
      }
    },

    //扫码获取到的数据
    onDecode(result) {
      if(result){
        this.walletAddress = result;
        this.scanCode_state = false;
      }
    },
    //错误信息统计
    async onInit(promise) {
      try {
        await promise
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = "ERROR: you need to grant camera access permission"
        } else if (error.name === 'NotFoundError') {
          this.error = "ERROR: no camera on this device"
        } else if (error.name === 'NotSupportedError') {
          this.error = "ERROR: secure context required (HTTPS, localhost)"
        } else if (error.name === 'NotReadableError') {
          this.error = "ERROR: is the camera already in use?"
        } else if (error.name === 'OverconstrainedError') {
          this.error = "ERROR: installed cameras are not suitable"
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.error = "ERROR: Stream API is not supported in this browser"
        } else if (error.name === 'InsecureContextError') {
          this.error = 'ERROR: Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.';
        } else {
          this.error = `ERROR: Camera error (${error.name})`;
        }
      }
    },

    queryRefundInfo(){
      let params = {
        cryptocurrency: this.$route.query.cryptocurrency
      }
      this.$axios.get(this.$api.get_sellRefundInfo, params).then(res=>{
        if(res && res.returnCode === "0000"){
          this.refundInfo.price = res.data.price;
          this.refundInfo.addressRegex = res.data.addressRegex;
        }
      })
    },

    confirmRefund(){
      let params = {
        orderId: this.orderId,
        address: this.walletAddress
      }
      this.$axios.get(this.$api.get_sellRefund,params).then(res=>{
        if(res && res.returnCode === '0000'){
          this.$router.go(-1);
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#refund{
  padding-top: 0.32rem;
  position: relative;
  .title{
    height: 0.14rem;
    font-family: 'SF Pro Display';
    font-style: normal;
    font-weight: 400;
    font-size: 0.13rem;
    color: #949EA4;
  }
  .walletAddress{
    width: 100%;
    height: 0.56rem;
    background: #FFFFFF;
    border: 1px solid #EEEEEE;
    border-radius: 0.06rem;
    position: relative;
    margin-top: 0.08rem;
    input{
      width: 100%;
      height: 100%;
      padding: 0 0.52rem 0 0.16rem;
      border: none;
      border-radius: 0.06rem;
      &::placeholder{
        color: #C2C2C2;
        font-weight: 400;
      }
    }
    img{
      width: 0.2rem;
      position: absolute;
      right: 0.16rem;
      top: 0.18rem;
      cursor: pointer;
    }
    .errorMessage{
      font-size: 0.1rem;
      font-family: "GeoLight", GeoLight;
      font-weight: 400;
      color: #E55643;
      margin: 0.04rem 0.2rem 0 0.16rem;
    }
  }
  .exchangeRate{
    height: 0.14rem;
    font-family: 'SF Pro Display';
    font-style: normal;
    font-weight: 400;
    font-size: 0.13rem;
    color: #949EA4;
    margin-top: 0.18rem;
    text-align: center;
  }

  .scanCode {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9;
  }

  footer{
    position: absolute;
    bottom: 0;
    .tips{
      font-family: 'SF Pro Display';
      font-style: normal;
      font-size: 0.13rem;
      letter-spacing: 0.3px;
      color: #C2C2C2;
      margin-bottom: 0.16rem;
      span{
        color: #949EA4;
        font-weight: 700;
      }
    }
    button{
      width: 100%;
      height: 0.58rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0059DA;
      border-radius: 0.3rem;
      font-family: 'SF Pro Display';
      font-style: normal;
      font-weight: 500;
      font-size: 0.16rem;
      text-align: center;
      color: #FFFFFF;
      border: none;
      cursor: pointer;
      img{
        width: 0.16rem;
        margin-left: 0.12rem;
      }
      &:disabled{
        opacity: 0.25;
        cursor: no-drop;
      }
    }
  }
}
</style>
