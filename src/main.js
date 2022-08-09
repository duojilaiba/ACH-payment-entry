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

//fingerprint - 设备指纹 ｜ 设备唯一id
import { fingerprintId } from '@/utils/publicRequest.js';
import common from "./utils/common";
fingerprintId();

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

//商户配置网站内容
let iconUrl = `./ico.webp`
if(common.merchant_name === "Lapay"){
  //动态修改html标题
  document.title = "Lapay Ramp"
  iconUrl = `./ico-lapay.webp`
}
//修改Favicon的方法
let $favicon = document.querySelector('link[rel="icon"]');
if ($favicon !== null) {
  $favicon.href = iconUrl;
} else {
  $favicon = document.createElement("link");
  $favicon.rel = "icon";
  $favicon.href = iconUrl;
}


Vue.prototype.$api = api;
Vue.prototype.$axios = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
