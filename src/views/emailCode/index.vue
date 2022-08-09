<template>
  <div class="emailCode-container" ref="emailCode">
    <div>

      <div class="emailCode-container_top">
        <img :src="logoPath" alt=""> <!-- logoPath -->
        <h2>{{ $t('nav.loginTitle1') }}</h2>
        <p>{{ $t('nav.loginTitle2') }}</p>
      </div>
      <div class="emailCode_content" ref="emailInput">
        <p v-if="!loggedIn">{{ $t('nav.enterEmail') }}</p>
        <p v-else>{{ $t('nav.enterEmail1') }}</p>
        <img src="@/assets/images/slices/emailIcon.png" alt="">

        <input type="text"  v-model="email" @focus="emailFocus" @blur="emailBlur" :style="{cursor: loggedIn?'not-allowed':''}" :disabled="loggedIn" placeholder="john.doe@example.com">
      </div>
      <div class="errorMessage" v-if="emailErrorState" v-html="emailError"></div>
      <div class="emailCode_content_title" v-if="loggedIn">Not you? <span @click="signAddress">{{ $t('nav.emailanother') }}</span></div>
    </div>

    <div>
      <div class="emailCode_checke" v-if="!loggedIn">
        <el-checkbox class="checkbox" size="medium"  v-model="checked"></el-checkbox>
        <div> {{ $t('nav.code_text') }} <span @click="openView('Terms')" style="cursor: pointer;">{{ $t('nav.code_name') }}</span> {{ $t('nav.code_and') }} <span style="cursor: pointer" @click="openView('Privacy')">{{ $t('nav.code_name2') }}.</span></div>
      </div>
      <div class="emailCode_button" :style="{opacity: (emailRep && login_loading=== true  )?'1':''}" @click="getCode">
        {{ $t('nav.Proceed') }}
        <img class="icon" src="@/assets/images/rightIconSell.png" alt="" v-if="login_loading">
        <van-loading class="icon" type="spinner" color="#fff" v-if="login_loading===false"/>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { debounce } from '../../utils/index';
import { AES_Encrypt,AES_Decrypt } from '@/utils/encryp.js';
import moment from 'moment-timezone';
import { fingerprintId } from '@/utils/publicRequest.js';
import common from '@/utils/common'


export default {
  name: "emailCode",
  data(){
    return{
      timeDown: 60,
      timeVal: null,
      emailErrorState: false,
      checked:false,
      emailError: '',
      detailsState: true,
      email: '',
      code: '',

      getCode_state: true,
      login_loading:true,
      loggedIn:false,

      common: {},
    }
  },
  activated(){
    this.common = common;

    this.$parent.routerViewState = true
    this.login_loading= true
    this.code = "";
    this.timeDown = 60;
    setTimeout(()=>{
      if(localStorage.getItem('login_email')){
        this.email = AES_Decrypt(localStorage.getItem('login_email'))
        this.loggedIn = true
        this.checked = true
      }else{
        this.loggedIn = false
        this.checked = false
        this.email = ''
      }
    },300)
    if(sessionStorage.getItem("accessMerchantInfo") !== "{}" && sessionStorage.getItem("accessMerchantInfo") !== null){
      this.email = JSON.parse(sessionStorage.getItem("accessMerchantInfo")).mail;
      return
    }



  },


  deactivated(){
    window.clearInterval(this.timeVal);
    this.timeVal = null;
    this.emailError = ''
    this.emailErrorState = false
  },
  mounted(){
    this.$parent.routerViewState = true
    setTimeout(()=>{
      if(localStorage.getItem('login_email')){
        this.email = AES_Decrypt(localStorage.getItem('login_email'))
        this.loggedIn = true
        this.checked = true
      }else{
        this.loggedIn = false
        this.checked = false
        this.email = ''
      }
    },300)


  },

  methods: {
    getCode:debounce(function () {
      fingerprintId();
      this.getCode_state = false;
      // this.emailErrorState = false;
      if(this.email === ''){
        return
      }
      var reg = new RegExp(".+@.+\\..+");
      if(!reg.test(this.email)){
        this.emailErrorState = true
        // this.emailError = "Not a valid email address.";
        this.emailError = this.$t('nav.login_required');
        // this.login_loading = false
        this.$refs.emailInput.style = 'border:1px solid #D92D20'
        return;
      }else if(!this.checked){
        this.$toast({
          duration: 3000,
          message: this.$t('nav.login_Agreement')
        });
        return
      }
      let timestamp = ''
      let isLoginOut = localStorage.getItem('loginOut')

      if(this.loggedIn===true && isLoginOut !== '1'){
        let _this = this
        let sign = localStorage.getItem("userId");
        let userId = sign.substring(sign.lastIndexOf("H")+1,sign.length);
        let userNo = localStorage.getItem("userNo").substring(localStorage.getItem("userNo").length-5);
        timestamp = new Date().getTime();
        let newSign = AES_Encrypt(userId + "-" + userNo + "-" + timestamp);
        localStorage.setItem("sign",newSign);
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
        var config = {
          method: 'get',
          url: process.env.VUE_APP_BASE_API + this.$api.getUserLogin,
          headers: {
            'token': localStorage.getItem('fin_token'),
            'fingerprint-id':localStorage.getItem('fingerprint_id'),
            'Accept-Language':sessionStorage.getItem('language')?sessionStorage.getItem('language'):'en-US',
            'sign': newSign,
            'timestamp': timestamp,
            'Content-Type': 'application/json',
            'timezone': moment.tz.guess(),
            'appid': appId
          },

        };
        axios.interceptors.response.use(function (config) {
          return config;
        }, function (error) {
          // Do something with response error
          return Promise.reject(error);
        })
        axios(config).then(function (response) {
          if( response.returnCode === '0000'){
            setTimeout(()=>{
              _this.login_loading = false
            })
            localStorage.setItem('token',localStorage.getItem('fin_token'))
            localStorage.setItem('email',localStorage.getItem('login_email'))
            if(_this.$store.state.routerQueryPath === true){
              _this.$router.push('/');
              return
            }
            if(_this.$route.query.fromName === 'tradeList'){
              _this.$router.replace('/tradeHistory');
            }else{
              //登陆跳转路径根据router.from的路由跳转不同页面
              if(_this.$store.state.emailFromPath === 'buyCrypto'){
                _this.$router.replace(`/receivingMode`);
              }else if(_this.$store.state.emailFromPath === 'sellCrypto'){
                _this.$router.replace('/sell-formUserInfo')
              }else if(_this.$store.state.emailFromPath === 'Refund'){
                _this.$router.replace('/Refund')
              }else{
                _this.$router.push('/');
              }
            }
          }
        })

        return
      }
      this.emailErrorState = false;
      this.login_loading = false
      //Get code
      let params = {
        email: AES_Encrypt(this.email)
      }
      this.$axios.post(this.$api.post_sendEmail,params,'').then(res=>{
        this.login_loading = true
        this.getCode_state = true;
        if(res.returnCode === '0000'){
          this.login_loading = false

          this.$store.state.userEmail = AES_Encrypt(this.email)
          this.$router.push({
            path:'/verifyCode',
          })
        }
      })

    },500,false),
    expandCollapse(){
      this.detailsState = this.detailsState === true ? false : true;
    },
    signAddress(){
      this.loggedIn = false
      this.checked = false
      this.email = ''
      localStorage.removeItem('login_email')
    },


    openView(name){
      let privacyPolicy_path = "";
      let termsUse = "";
      if(name === 'Privacy'){
        if(common.merchant_name === 'Lapay'){
          privacyPolicy_path = common.lapay_serviceAgreement;
        }else{
          privacyPolicy_path = common.ach_serviceAgreement;
        }
        window.location = privacyPolicy_path;
        return;
      }
      if(name === 'Terms'){
        if(common.merchant_name === 'Lapay'){
          termsUse = common.lapay_privacyAgreement;
        }else{
          termsUse = common.ach_privacyAgreement;
        }
        window.location = termsUse;
      }
    },
    //输入框选择状态样式
    emailFocus(){
      let Input = document.querySelector('.emailCode_content')
      Input.style = `border: 1px solid #41B8FD;
box-shadow: 0px 0px 35px rgba(89, 153, 248, 0.2);`
    },
    //输入框失去焦点时样式
    emailBlur(){
      let Input = document.querySelector('.emailCode_content')
      Input.style = ``
      if(this.email === ''){
        this.emailError = 'necessary'
        this.emailErrorState = true
      }else{
        this.emailError = ''
        this.emailErrorState = false
      }
    }
  },
  computed:{
    //计算邮箱输入并且勾选协议时按钮高亮
    emailRep(){
      let status = false
      let  reg = new RegExp(".+@.+\\..+");
      if(this.checked && reg.test(this.email)){
        status =  true
      }
      return status
    },
    logoPath(){
      if(this.common.lapay_logo){
        if(common.merchant_name === 'Lapay'){
          return require(`@/assets/images/${this.common.lapay_logo}`);
        }else{
          return require('@/assets/images/slices/pay.png');
        }
      }
    }
  }

}
</script>

<style lang="scss" scoped>

.emailCode-container{
  width: 100%;
  // height: 100%;
  overflow: hidden;
  // position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .emailCode-container_top{
    height: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: .4rem;
    h2{
      font-size: .21rem;
      font-family:"SFProDisplaybold";
      font-weight: normal;
      margin: .24rem 0 .16rem 0;
      color: #031633;
    }
    p{
      width: 2.5rem;
      font-size: .13rem;
      font-family: "SFProDisplayRegular";
      font-weight: normal;
      color: #6E7687;
      text-align: center;
    }
    img{
      width: .4rem;
      // height: .4rem;
    }
  }
  .emailCode_content_title{
    margin-top: .16rem;
    font-size: .13rem;
    text-align: center;
    font-family: "SFProDisplayRegular";
    color: #949EA4;
    span{
      color: rgba(0, 71, 173, 1);
      cursor: pointer;
    }
  }
  .emailCode_content{
    width: 100%;
    height: .56rem;
    border: 1px solid #D9D9D9;
    border-radius: .12rem;
    position: relative;
    input{
      width: calc(100% - .42rem);
      height: 100%;
      border: none;
      font-size: .16rem;
      position: absolute;
      left: .42rem;
      color: #6E7687;
      background: transparent;
      font-family: "SFProDisplayRegular";
      outline: none;
    }
    input::placeholder{
      color: #BFBFBF;
    }
    p{
      font-size: .13rem;
      color: #707070;
      position: absolute;
      font-family: "SFProDisplayRegular";
      top: -.23rem;
    }
    img{
      width: .16rem;
      height: .13rem;
      position: absolute;
      left: .16rem;
      top: .22rem;
    }
  }
  .emailCode_button{
    width: 100%;
    height: .58rem;
    background: #0059DA;
    border-radius: .29rem;
    font-size: .17rem;
    text-align: center;
    line-height: .58rem;
    position: relative;
    // position: absolute;
    // bottom: 0rem;
    opacity: 0.25;
    color: #FAFAFA;
    font-family: "SFProDisplayRegular";
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    .icon{
      // width: .12rem;
      height: .2rem;
      margin: -.02rem  0 0 .1rem;
      span{
        height: .15rem;
        position: absolute;
        left: .09rem;
        top: .03rem;
      }
    }
  }
  .emailCode_tab{
    width: 100%;
    height: .35rem;
    cursor: pointer;
    img{
      height: .24rem;
      // float: right;
    }
  }
  .errorMessage{
    font-weight: normal;
    color: #FF2F2F;
    line-height: 17px;
    font-size: 15px;
    font-family:SFProDisplayRegular;
    margin-top: .08rem;
  }
}
.emailCode_checke{
  width: 100%;
  display: flex;
  color: #6E7687;
  font-size: .13rem;
  line-height: .16rem;
  margin-bottom: .16rem;
  font-family: "SFProDisplayRegular";
  span{
    color: rgba(0, 71, 173, 1);
  }
  .checkbox{
    margin-right: .08rem;
    ::v-deep .el-checkbox__inner{
      border-radius: 100% !important;
    }
  }
  .checkbox ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner{
    background: #0059DA;
    border-color:#0059DA ;
  }
}
</style>
