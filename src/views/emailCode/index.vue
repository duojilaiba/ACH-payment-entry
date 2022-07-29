<template>
  <!-- <div id="emailCode"> -->
    <!-- <div class="form-title">Enter your emai address</div>
    <div class="form-input"><input type="text" placeholder="Email Address" v-model="email">
      <span class="formOptions" :class="{'getCodeClass': email===''}" @click="getCode" v-if="timeDown===60">Get code</span>
      <span class="formOptions" v-else>{{ timeDown }}S</span>
    </div> -->
    <!-- error message -->
    <!-- <div class="errorMessage" v-if="emailErrorState" v-html="emailError"></div>
    <div class="form-title">Enter the verification code you received</div>
    <div class="form-input emailCode"><input type="text" v-model="code" placeholder="Login Code" maxlength="6"></div> -->
    <!-- error message -->
    <!-- <div class="errorMessage" v-if="codeErrorState" v-html="codeError">Verification code not match.</div> -->
    <!-- Permission agreement -->
    <!-- <div class="agreement-content">
      <div class="agreement-radio"><input type="checkbox" v-model="agreement"></div>
      <div class="agreement-text">I have read and agree to Alchemy Pay’s <span @click="goProtocol('termsUse')">{{ '<' }}Terms of Use{{ '>' }}</span> and <span @click="goProtocol('privacyPolicy')">{{ '<' }}Privacy Policy{{ '>' }}</span>.</div>
    </div>
    <includedDetails v-if="includedDetails_state"/>
    <div class="continue" :class="{'buttonTrue': email!==''&&code.length===6&&agreement===true}" @click="toLogin">Continue</div> -->

  <!-- </div> -->
  <div class="emailCode-container" ref="emailCode">
    <div>

      <div class="emailCode-container_top">
        <img src="@/assets/images/slices/pay.png" alt="">
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
// import includedDetails from "../../components/IncludedDetails";
import axios from 'axios';
import { debounce } from '../../utils/index';
import { AES_Encrypt,AES_Decrypt } from '@/utils/encryp.js';
import moment from 'moment-timezone';

export default {
  name: "emailCode",
  // components: { includedDetails },
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
      agreement: false,
      codeErrorState: false,
      codeError: '',
      includedDetails_state: false,

      getCode_state: true,
      login_state: true,
      login_loading:true,
      loggedIn:false
    }
  },
  activated(){
    this.$parent.routerViewState = true
    this.login_loading= true
    this.code = "";
    this.timeDown = 60;
    this.includedDetails_state = this.$route.query.fromName ? this.$route.query.fromName === 'tradeList' ? false : true : '';
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
      if(this.loggedIn===true){
        let _this = this
         let sign = localStorage.getItem("userId");
          let userId = sign.substring(sign.lastIndexOf("H")+1,sign.length);
          let userNo = localStorage.getItem("userNo").substring(localStorage.getItem("userNo").length-5);
           timestamp = new Date().getTime();
          let newSign = AES_Encrypt(userId + "-" + userNo + "-" + timestamp);
          localStorage.setItem("sign",newSign);
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
            timezone: moment.tz.guess(),
          },

        };
        axios.interceptors.response.use(function (config) {
          return config;
        }, function (error) {
          // Do something with response error
          return Promise.reject(error);
        })
        axios(config).then(function (response) {
          if(response.data.status && response.returnCode === '0000'){
            _this.login_loading = false
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
                  // _this.$router.push('/')
                  _this.$router.replace('/sell-formUserInfo')

              }else if(_this.$store.state.emailFromPath === '/Refund'){
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
      if(name==='Privacy'){
        window.location = 'https://alchemypay.org/privacy-policy/'
        return
      }
      if(name === 'Terms'){
         window.location = 'https://alchemypay.org/terms-of-use/';
        return;
      }
    },
    //输入框选择状态样式
    emailFocus(){
      let Input = document.querySelector('.emailCode_content')
      Input.style = `border: 1px solid #D0ECFC;
      box-shadow: 0px 0px 35px rgba(89, 153, 248, 0.1);`
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
      color: #063376;
    }
    p{
      width: 2.5rem;
      font-size: .13rem;
      font-family: "SFProDisplayRegular";
      font-weight: normal;
      color: #949EA4;
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
      color: #0059DA;
      cursor: pointer;
    }
  }
  .emailCode_content{
    width: 100%;
    height: .56rem;
    border: 1px solid #EEEEEE;
    border-radius: .12rem;
    position: relative;
    input{
      width: calc(100% - .42rem);
      height: 100%;
      border: none;
      font-size: .16rem;
      position: absolute;
      left: .42rem;
      color: #949EA4;
      background: transparent;
      font-family: "SFProDisplayRegular";
      outline: none;
    }
    input::placeholder{
      color: #C2C2C2;
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
      height: .15rem;
      margin-left: .12rem;
      span{
        position: absolute;
        left: 0;
        top: .0rem;
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
    color: #D92D20;
    line-height: 17px;
    font-size: 15px;
    font-family:SFProDisplayRegular;
    margin-top: .08rem;
  }
}
.emailCode_checke{
  width: 100%;
  display: flex;
  color: #949EA4;
  font-size: .13rem;
  line-height: .16rem;
  margin-bottom: .16rem;
   font-family: "SFProDisplayRegular";
  span{
    color: #0059DA;
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
