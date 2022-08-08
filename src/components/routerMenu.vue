<template>
  <div id="routerMenu">
    <div class="router_nav" v-if="$route.path==='/sellOrder'">
      <div class="navigationBar_view_left" style="color:#031633">{{ $t('nav.menu') }}</div>
      <div class="navigationBar_view_right" style="padding:.1rem">
        <img class="closeIcon" style="width:.22rem;" src="../assets/images/ShutDown.png" @click="$parent.routerViewState=true">
      </div>
    </div>
    <div class="routerMenu_isLogo" v-if="token===false">
        <div class="routerMenu_logoView"><img :src="logoPath" alt=""></div>
        <h2>{{ $t('nav.RouterMenu_Welcome') }}</h2>
        <p>{{ $t('nav.RouterMenu_experience') }}</p>
        <div class="loginBtn" @click="goLogin" :style="{background:loading?'#0059DA80':''}">{{ $t('nav.login') }} <img class="icon" src="../assets/images/rightIconSell.png" alt="" v-if="!loading">
        <van-loading  class="icon" type="spinner" color="#fff" v-else/></div>
    </div>
    <div class="routerMenu_history goHomeView" @click="goView('/',$store.state.homeTabstate)" v-if="token!==false && (this.$route.query.merchant_orderNo===undefined || this.$route.query.merchant_orderNo=='undefined')">
      <div class="lineIcon"><img src="../assets/images/slices/goHome-icon.svg"></div>
      <div class="lineName">
        <p class="alone">Home</p>
      </div>
      <!-- <div class="lineRight">
        <div><img src="../assets/images/slices/right_icon.png"></div>
      </div> -->
    </div>
    <div class="routerMenu_history" @click="goView('/tradeHistory')" v-if="token!==false">
      <div class="lineIcon"><img src="../assets/images/slices/histry.png"></div>
      <div class="lineName">
        <p class="alone">{{ $t('nav.menu_transactions') }}</p>
<!--        <p><span v-if="finished">{{ $t('nav.RouterMenu_history') }}</span></p>-->
      </div>
      <div class="lineRight">
        <div><img src="../assets/images/slices/right_icon.png"></div>
      </div>
    </div>
    <div class="routerMenu_line" style="margin-top:.28rem" @click="LanguageIsShow">
      <div class="lineIcon"><img src="../assets/images/slices/iconLang.png"></div>
      <div class="lineName">{{ $t('nav.menu_language') }}</div>

      <div class="lineRight">
        <p>{{ languageName() }}</p>
        <div><img src="../assets/images/slices/right_icon.png"></div>
      </div>
    </div>
    <div class="routerMenu_line" @click="goProtocol('termsUse')">
      <div class="lineIcon"><img src="../assets/images/slices/terms.png"></div>
      <div class="lineName">{{ $t('nav.code_name') }}</div>
      <div class="lineRight">
        <div><img src="../assets/images/slices/right_icon.png"></div>
      </div>
    </div>
    <div class="routerMenu_line" @click="goProtocol('privacyPolicy')">
      <div class="lineIcon"><img src="../assets/images/slices/privacy.png"></div>
      <div class="lineName">{{ $t('nav.menu_privacy') }}</div>
      <div class="lineRight">
        <div><img src="../assets/images/slices/right_icon.png"></div>
      </div>
    </div>
    <div class="routerMenu_line" @click="loginOutIsShow" v-if="email !== ''" style="display:flex;justify-content: space-between;">
      <div style="display:flex;align-items: center;">
        <div class="lineIcon"><img src="../assets/images/slices/logOut.png"></div>
        <div class="lineName">{{ $t('nav.menu_logOut') }}</div>
      </div>
      <div class="lineRight" style="margin:0">

        <div class="email" style="width:1.3rem; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;line-height:.2rem;display:flex;justify-content: space-between;  align-items: center;color:#6E7687"><img style="margin-right:.02rem" :src="disAbled===true?kycError:disAbled===false?kycSess:''"   alt="">{{ emailSlice   }} </div>
        <div><img src="../assets/images/slices/right_icon.png"></div>
      </div>
    </div>
    <div class="routerMenu_loginOut" v-show="show" @click="show=false">
      <div class="content" ref="loginOutView" @click.stop="show=true">
        <h2>{{ $t('nav.loginOut_title') }}</h2>
       <div>
          <button @click.stop="outLogin" :disabled="loginOutLoading">{{ $t('nav.menu_logOut') }} <van-loading v-if="loginOutLoading" class="icon" type="spinner" color="#fff" /></button>
          <p @click.stop="show=false">{{ $t('nav.loginOut_Dismiss') }}</p>
       </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 菜单组件
 */
import {AES_Decrypt} from "../utils/encryp";
import common from '@/utils/common'

export default {
  name: "routerMenu",
  data(){
    return{
      email: '',
      token:false,
      show:false,
      loading:false,
      query: {
        orderState: 1,
        orderType: 1,
        pageIndex: 1,
        pageSize: 5,
        historyList:[],

      },

      finished:false,
      newVal:'',
      disAbled:'',
      kycError:require('@/assets/images/AccountRisk.png'),
      kycSess:require('@/assets/images/kycScuss.png'),
      loginOutLoading:false,

      common: {},
      logoPath: '',
    }
  },
  activated(){
    localStorage.getItem("token") ? this.token = true : this.token =false;
    localStorage.getItem("email") ? this.email = AES_Decrypt(localStorage.getItem("email")) :this.email = '';


    // this.transationsList()
  },
  deactivated(){
     localStorage.getItem("token") ? this.token = true :this.token = false;
    localStorage.getItem("email") ? this.email = AES_Decrypt(localStorage.getItem("email")) :this.email = '';
  },
  // mounted(){
  //   localStorage.getItem("token") ? this.token = true : false;
  //   localStorage.getItem("email") ? this.email = AES_Decrypt(localStorage.getItem("email")) : '';
  // },
  methods: {
    //Select menu
    goView(name,homeTab){
      //首页打开菜单 跳转交易历史 交易历史返回到菜单
      if(this.$route.path === '/' && name === '/tradeHistory'){
        this.$router.push(name);
        return;
      }

      this.$parent.routerViewState = true;
      this.$parent.menuState = false;
      if(name === '/'){
        this.$store.state.homeTabstate = homeTab;
        this.$router.push(name);
        return;
      }
      if(name === 'Language'){
        this.$router.push(name);
        return;
      }

      if(!localStorage.getItem("token")|| localStorage.getItem('token')===''){
        this.$store.state.emailFromPath = this.$parent.tabstate;
        this.$router.push('/emailCode?fromName=tradeList').catch(()=>{});
      }else{
        this.$router.push(name);
      }
    },
    onClose(){
      this.show = false
    },
    //语言栏显示切换语言
     languageName(){
      let language = sessionStorage.getItem('language')?sessionStorage.getItem('language'):'en-US'
      let LanguageName = ''
      for(let item of Object.keys(this.$i18n.messages)){
            if(item === language){
              LanguageName = this.$i18n.messages[item].language
            }
          }
          return LanguageName
    },
    //Exit the login hidden menu and clear the login information
    outLogin(){

      if(this.email && !this.loginOutLoading ){
         this.loginOutLoading = true
        this.$axios.post(this.$api.post_outLogin,'','').then(res=>{
          if(res && res.returnCode === "0000"){
            localStorage.removeItem("sign");
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            localStorage.setItem('loginOut','1')
            this.loginOutLoading = false
            localStorage.removeItem("kycStatus");
            // sessionStorage.removeItem('accessMerchantInfo')
            sessionStorage.removeItem('store')
            this.show = false
            if(this.$route.path !== '/'){
              this.$parent.routerViewState = true
              setTimeout(()=>{
                this.$parent.routerViewState = false

              },200)
              this.$router.replace('/')
            return
            }else{
                this.token = false
                this.email = ''
            }

          }
          this.loginOutLoading = false
        })
      }
    },
    goProtocol(name){
      let privacyPolicy_path = "";
      let termsUse = "";
      if(name === 'privacyPolicy'){
        if(common.merchant_name === 'Lapay'){
          privacyPolicy_path = common.lapay_serviceAgreement;
        }else{
          privacyPolicy_path = common.ach_serviceAgreement;
        }
        window.location = privacyPolicy_path;
        return;
      }
      if(name === 'termsUse'){
        if(common.merchant_name === 'Lapay'){
          termsUse = common.lapay_privacyAgreement;
        }else{
          termsUse = common.ach_privacyAgreement;
        }
        window.location = termsUse;
      }
    },
    goLogin(){
      this.loading = true
        setTimeout(() => {
          this.loading = false
          this.$store.state.routerQueryPath = true
          this.$parent.routerViewState = true;
          //是否是从菜单进入
          this.$router.push('/emailCode')
        }, 200);
    },
    //显示退出登陆判断是否是pc 还是 移动
    loginOutIsShow(){
      let winWidth = document.body.clientWidth || document.documentElement.clientWidth
      if(winWidth < 791){
        this.$refs.loginOutView.style = 'top:20%;tannsfrom:translate(-50%,-20%)'
      }else{
        this.$refs.loginOutView.style = 'left:50%;top:30%;tannsfrom:translate(-50%,-30%)'
      }
      this.show = true

    },
    //是否有历史记录
    transationsList(){
      let _this = this;
      this.$axios.get(this.$api.get_transactionHistory,this.query).then(res=>{
        if(res && res.data){
          let newArray = res.data.result;
          if (newArray.length <= 0 ) {
            _this.finished = true;
          }
        }
      })
    },
    //语言切换的显示隐藏
    LanguageIsShow(){
      this.$store.state.LanguageIsShow = true
    },
    //查看用户是否为风险用户
    is_kycDisabled(){
      let _this = this
      this.$axios.post(this.$api.post_kycDisabled,'','').then(res=>{
        if(res && res.returnCode === '0000'){
          if(res.data){
            this.disAbled = res.data
            return
          }else{
             _this.$axios.post(_this.$api.post_menuKYC,'','').then(_res=>{
              if(_res && _res.returnCode === '0000'){
                if(_res.data===false){
                  _this.disAbled = false
                  return
                }else{
                  _this.disAbled = ''
                }
              }
            })
          }
        }
      })
    },

  },
  computed:{
    emailSlice(){
      let email = this.email
      let email1 = email.slice(0,3)+' *** '+ email.slice(email.indexOf('@'),email.indexOf('@')+6)  + '...'
      return email1
    },
  },
  watch:{
    //打开菜单栏并且已经登陆以后才会获取有没有历史记录
    '$store.state.menuState':{
      immediate:true,
      deep:true,
      handler(newVal){
        if(newVal  === true){
          localStorage.getItem("token") ? this.token = true :this.token = false;
          localStorage.getItem("email") ? this.email = AES_Decrypt(localStorage.getItem("email")) :this.email = '';

        }
        if(newVal === true && localStorage.getItem("token")){

          this.token===true?this.transationsList():''
          //用户是否为风险用户
          this.is_kycDisabled()
        }
        //商户配置信息
        this.common = common;
        if(this.common.lapay_logo){
          if(common.merchant_name === 'Lapay'){
            this.logoPath = require(`@/assets/images/${this.common.lapay_logo}`);
          }else{
            this.logoPath = require(`@/assets/images/${this.common.ach_logo}`);
          }
        }
      }
    },

  }
}
</script>

<style lang="scss" scoped>
#routerMenu{
  position: relative;
.router_nav{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .05rem 0 .15rem;
  font-size: 0.18rem;
    font-family: SFProDisplaybold;
    font-weight: normal;
    color: #031633;
    font-weight: 500;

  img{
    width: .2rem;
    cursor: pointer;
  }
}
  .routerMenu_line{
    display: flex;
    align-items: center;
    margin-top: 0.24rem;
    cursor: pointer;
    .lineIcon{
      display: flex;
      img{
        width: 0.3rem;
      }
    }
    .lineName{
      font-size: 0.16rem;
      font-family: "SFProDisplayRegular";
      font-weight: 400;
      color: #6E7687;
      margin-left: 0.12rem;
    }
    .lineRight{
      margin-left: auto;
      display: flex;
      align-items: center;
      p{
        font-size: .15rem;
        font-family: SFProDisplayRegular;
        font-weight: normal;
        color: #6E7687;
        margin-right: .12rem;
        font-weight: 400;
      }
      .email{
        margin-right: 0.12rem;
        font-size: 0.15rem;
        font-family: "GeoLight", GeoLight;
        font-weight: 400;
        color: #C2C2C2;
      }
      div{
        display: flex;
      }
      img{
        // width: 0.6rem;
        // height: ;
        height: .2rem;
      }
    }
    &:nth-of-type(1){
      margin-top: 0.2rem;
    }
  }
  .routerMenu_isLogo{
    width: 100%;
    height: 2.26rem;
    // text-align: center;
    border-radius: .12rem;
    border: 1px solid #D9D9D9;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .routerMenu_logoView{
      width: 0.58rem;
      height: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      img{
        width: 0.58rem;
        margin-top: .18rem;
      }
    }
    .loginBtn{
      width: 90%;
      background: #0059DA;
      border-radius: .3rem;
      height: .58rem;
      font-size: .17rem;
      margin-top: .17rem;
      text-align: center;
      line-height: .58rem;
      color: #fff;
      font-family: "SFProDisplayRegular";
      position: relative;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon{
        width: .2rem;
        // height: .14rem;
        margin-left: .1rem;
        span{
          height: .16rem;
          margin-top: .02rem;
        }
      }
    }
    h2{
      font-size: .2rem;
      font-family: "SFProDisplaybold";
      font-weight: normal;
      color: #031633;
      line-height: .25rem;
      font-weight: 500;
      margin: .2rem 0 .06rem 0;
    }
    p{
      font-size: .13rem;
      font-family: "SFProDisplayRegular";
      font-weight: normal;
      color: #6E7687;
    }
  }
  .goHomeView{
    margin-top: 0.2rem !important;
  }
  .routerMenu_history{
    width: 100%;
    height: .8rem;
    background: #FFFFFF;
    border-radius: 12px;
    border: 1px solid #E2E1E5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 .31rem 0 .24rem;
    cursor: pointer;
    margin-top: .12rem;
    .alone{
      font-family: SFProDisplaybold !important;
      font-weight: 600 !important;
      font-size: 0.16rem !important;
      color: #031633 !important;
    }
    .lineName{
      margin-left: .16rem;
      flex: 1;
      p:first-child{
        font-family: SFProDisplaybold;
        font-size: .17rem;
        font-weight: normal;
        color: #063376;
        line-height: .17rem;
      }
      p:last-child{
        font-family: SFProDisplayRegular;
        font-weight: normal;
        color: #C0C0C2;
        line-height: 17px;
        font-size: .15rem;
        // margin-top: .04rem;
      }
    }
    .lineIcon{
      img{
        width: .36rem;
      }
    }
    .lineRight{
      img{
        // width: .1rem;
        height: .2rem;
      }
    }

  }
  .routerMenu_loginOut{
    width: 100%;
    height: 100%;
    background: #00000080;
    position: fixed;
    left: 0;
    top: 0;
    .content{

      max-width: 3.5rem;
      background: #FFFFFF;
      border-radius: 16px;
      position: absolute;
      left:50%;
      top: 30%;
      transform: translate(-50%,30%);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: .32rem .16rem .32rem;
      box-sizing: border-box;

      h2{
        text-align: center;
        font-style: normal;
        font-weight: 400;
        color: #6E7687;;
        line-height: .31rem;
        font-size: .16rem;
        font-family: SFProDisplayRegular;
      }
      >div{
        width: 3.3rem;
        height: .6rem;
        display: flex;
        margin-top: .2rem;
        justify-content: center;
        align-items: center;
        button{
          width: 1.5rem;
          height: .5rem;
          background: #E55643;
          border-radius: .29rem;
          text-align: center;
          line-height: .49rem;
          font-size: .16rem;
          font-weight: normal;
          color: #FFFFFF;
          border: none;
          font-family: SFProDisplayRegular;
          margin-top: .05rem;
          margin-right: .13rem;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          .icon{
            span{
              height: .2rem;
            }
          }
        }
        p{
           width: 1.5rem;
          height: .5rem;
          text-align: center;
          font-weight: normal;
          color: #031633;
          font-family: SFProDisplayRegular;
          font-size: .16rem;
          line-height: .49rem;
          border: 1px solid #EEEEEE;
          border-radius: .25rem;
          cursor: pointer;
        }
      }
    }

  }
}
</style>
