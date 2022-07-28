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
import { AES_Encrypt } from "./utils/encryp";

localStorage.setItem("token","/5SQXRwnCGu63P1Hq4/plJxyUrckPlT2S7ayAaUHG2dueTyLd/7HjFjDZiYzXvcGAT6LurAqoABcwJ13ka5GOQ==");
localStorage.setItem("userNo","52846");
localStorage.setItem("userId","352");
localStorage.setItem("email",AES_Encrypt("wil07007@jeoce.com"));

//阿里云接口埋点
// new Promise(()=>{
//   if(process.env.NODE_ENV !== 'development'){
//     const BrowserLogger = require('alife-logger');
//     const __bl = BrowserLogger.singleton({
//       pid: process.env.VUE_APP_Aliyun_pid,
//       imgUrl: 'https://arms-retcode.aliyuncs.com/r.png?',
//       enableLinkTrace:true,
//       behavior:true
//     });
//   }
// });

Vue.prototype.$api = api;
Vue.prototype.$axios = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
