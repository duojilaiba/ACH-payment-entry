import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

//axios请求
import axios from "./axios/axios";
import api from "./axios/api";

//rem适配
import remSize from './utils/remSize.js';
remSize();

//国际化
import i18n from './utils/i18n/index'

//ui类库、公共组件
import "./utils/UI-ClassLibrary.js";

// import Vconsole from 'vconsole'
// let vConsole = new Vconsole()
// Vue.use(vConsole);

//fingerprint - 设备指纹 ｜ 设备唯一id
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
// Initialize an agent at application startup.
const fpPromise = FingerprintJS.load({
  apiKey: 'TmQIZTEjFuNxiJxuyg4m'
})
//加密设备ID
import {AES_Decrypt, AES_Encrypt} from './utils/encryp'
// Get the visitor identifier when you need it.
fpPromise.then(fp => fp.get()).then(result => {
  console.log(result.visitorId,"----指纹id")
  console.log(AES_Decrypt("uaMrsp8XE+vlVQItrhTHbTk5ujiHDJ/1MPekZVymwyk="))
  console.log(AES_Decrypt("wpJlljRP4T6KoHBvejdTFngoqDRVCgR0Kvs/3vGwbb0="))
  window.localStorage.setItem("fingerprint_id",AES_Encrypt(result.visitorId));
});

//阿里云接口埋点
new Promise(()=>{
  if(process.env.NODE_ENV !== 'development'){
    const BrowserLogger = require('alife-logger');
    const __bl = BrowserLogger.singleton({
      pid: process.env.VUE_APP_Aliyun_pid,
      imgUrl: 'https://arms-retcode.aliyuncs.com/r.png?',
      enableLinkTrace:true,
      behavior:true
    });
  }
});

Vue.prototype.$api = api;
Vue.prototype.$axios = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
