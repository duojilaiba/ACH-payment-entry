import store from "../store";
import axios from "axios";
import { AES_Encrypt } from '@/utils/encryp.js';
import moment from 'moment-timezone';
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import common from "@/utils/common";

//Request service address
const baseUrl = process.env.VUE_APP_BASE_API;
let apiKey = process.env.VUE_APP_Fingerprint_ApiKey;
//商户id区分环境
let appId;
let accessMerchantInfo = sessionStorage.getItem("accessMerchantInfo") ? JSON.parse(sessionStorage.getItem("accessMerchantInfo")) : {};
if(common.merchant_name === 'Lapay'){
    if(process.env.NODE_ENV === 'production'){
        appId = common.appId_lapay_prod;
    }else{
        appId = common.appId_lapay_test;
    }
}else{
    appId = accessMerchantInfo.merchantParam_state ? accessMerchantInfo.appId : '';
}

/**
 * 提交订单、确认订单前获取submit-token公共接口
 * @returns 获取成功返回true，失败则是fasle
 */
export function querySubmitToken(){
    let params = {
        "coin": store.state.buyRouterParams.cryptoCurrency,
        "email": localStorage.getItem("email")
    }
    //请求接口请求头信息
    let timestamp = '';
    if(localStorage.getItem("token")){
        let sign = localStorage.getItem("userId");
        let userId = sign.substring(sign.lastIndexOf("H")+1,sign.length);
        let userNo = localStorage.getItem("userNo").substring(localStorage.getItem("userNo").length-5);
        timestamp = new Date().getTime();
        let newSign = AES_Encrypt(userId + "-" + userNo + "-" + timestamp);
        localStorage.setItem("sign",newSign);
    }
    return axios({
        method: 'post',
        url: baseUrl + '/crypto/wallet/check',
        data: params,
        headers: {
            'token': localStorage.getItem('token') ? localStorage.getItem('token') : '',
            'sign': localStorage.getItem('sign') ? localStorage.getItem('sign') : '',
            'fingerprint-id': localStorage.getItem('fingerprint_id')?localStorage.getItem('fingerprint_id'):'',
            'timestamp': timestamp,
            'Content-Type': 'application/json',
            'timezone': moment.tz.guess(),
            'appid': appId
        }
    }).then(res=>{
        if(res.data !== null && res.returnCode === '0000') {
            return true;
        }else{
            return false
        }
    }).catch(()=>{
        return false
    })
}

/**
 * fingerprint - 设备指纹 ｜ 设备唯一id
 * @url https://dashboard.fingerprint.com
 */
export function fingerprintId(){
    const fpPromise = FingerprintJS.load({
        apiKey: apiKey
    })
    fpPromise.then(fp => fp.get()).then(result => {
        //加密设备ID
        // console.log('获取设备唯一标识：',result.visitorId);
        window.localStorage.setItem("fingerprint_id",AES_Encrypt(result.visitorId));
    });
}
