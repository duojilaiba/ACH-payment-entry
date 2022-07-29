<template>
  <div id="scanCode">
    <qrcode-stream @decode="onDecode" @init="onInit"/>
    <div class="backView" @click="back"><img src="../assets/images/goBack.png"></div>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader';

export default {
  name: "ScanCode",
  components: {
    QrcodeStream
  },
  data(){
    return{
      error: '',
    }
  },
  methods: {
    back(){
      this.$parent.scanCode_state = false;
    },
    //扫码获取到的数据
    onDecode(result) {
      if(result){
        this.$parent.$refs.routerView.walletAddress = result;
        this.$parent.scanCode_state = false;
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
  }
}
</script>

<style lang="scss" scoped>
#scanCode{
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  z-index: 9;
  .backView{
    position: absolute;
    top: 0.5rem;
    left: 0.3rem;
    background: rgba(255, 255, 255, 0.6);
    width: 0.36rem;
    height: 0.36rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    img{
      width: 0.2rem;
    }
  }
}
</style>
