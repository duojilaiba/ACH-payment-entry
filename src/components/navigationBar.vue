<!-- all page navigation bar -->
<template>
  <div class="navigationBar_view" v-if="navigationBarIsShow">
    <!-- open menu view -->
    <div class="navigationBar_view_left" v-if="this.$parent.routerViewState">
      <!-- merchant_orderNo 地址栏存在商户订单隐藏返回按钮 -->
      <div class="icon" v-if="$store.state.goHomeState" @click="goBack"><img src="../assets/images/goBack.png"></div>
      <div class="linkName">
        {{ $t(routerName) }}
        <!-- 卖币表单页展示修改卖币信息入口 -->
        <div class="sellChangeForm" v-if="this.$store.state.cardInfoFromPath === 'configSell' && $route.path === '/sell-formUserInfo'" @click="sellFormBack">
          <p>· {{ this.$store.state.sellRouterParams.formPositionData.positionValue }}</p>
          <p><img src="../assets/images/changeIcon.svg" alt=""></p>
        </div>
        <!-- 退款页面标题添加币种 -->
        <span class="currency" v-if="$route.path === '/Refund'">{{ $route.query.currency }}</span>
      </div>
    </div>
    <!-- close menu view -->
    <div class="navigationBar_view_left" v-else>{{ $t('nav.menu') }}</div>
    <div class="navigationBar_view_right">
      <!-- 买币修改表单页面 - 删除表单icon -->
      <div class="buy_deleteCardInfo" v-if="$route.path === '/modifyCardInfo'" @click="deleteForm"><img src="../assets/images/delete-icon.png" alt=""></div>
      <img class="closeIcon" style="width:.11rem" src="../assets/images/ShutDown.png" v-if="!this.$parent.routerViewState" @click="openMenu">
    </div>
  </div>
</template>

<script>
/**
 * tabState - Used to hide the menu bar of other routing pages except the home page  eg:'/receivingMode' Using search components
 */
export default {
  name: "navigationBar",
  data() {
    return {
      routerName: "",
      tabState: false,
      routerPath: '',
      routerCrypto:'',

      changeCountry_state: false,
    };
  },
  watch: {
    $route:{
      immediate: true,
      handler: function(val,oldVal){
        if(val.meta.title){
          if((val.meta.title === 'Home')  && !this.$parent.routerViewState) {
            this.tabState = false;
          } else {
            this.tabState = true;
            this.routerName = val.meta.title;

          }
          oldVal ? this.routerPath = oldVal.path : "";
        }
      },
    }
  },
  methods: {
    goBack(){
      // if(this.$route.path === '/emailCode'){
      //   this.$router.push('/')
      //   return;
      // }
      //add sellOrder page back home
      if(this.$route.path === '/emailCode' ){
        this.$router.push('/')
        return;
      }
      if(this.$route.path === '/paymentResult'|| this.$route.path === '/sellOrder' ){
        this.$store.state.nextOrderState=1
        this.$router.push('/');
        return;
      }
      if(this.routerPath === '/verifyCode' &&  this.$route.path === '/sell-formUserInfo'){
        this.$router.push('/');
        return;
      }
      if(this.routerPath === '/verifyCode' &&  this.$route.path === '/receivingMode'){
        this.$router.push('/');
        return;
      }
      // console.log(this.routerPath);
      if(this.routerPath === '/paymentMethod' &&  this.$route.path === '/receivingMode'){
        this.$router.push('/');
        return;
      }
      if(this.routerPath === '/verifyCode' && this.$route.path === '/receivingMode'){
        this.$router.push('/');
        return;
      }
      if(this.routerPath === '/verifyCode' && this.$route.path === '/configSell'){
        this.$router.push('/');
        return;
      }

      if( this.routerPath === '/emailCode' && this.$route.path === '/verifyCode'){
        this.$router.go(-1)
        return;
      }

      if(this.$route.path === '/creditCardForm-cardInfo' && this.routerPath === '/basisIdAuth'){
        this.$router.go(-6);
        return;
      }
      if(this.$route.path === '/creditCardConfig' && this.routerPath === '/creditCardForm-cardInfo'){
        this.$router.go(-2);
        return;
      }
      // if(this.$route.path === '/creditCardConfig' && this.routerPath === '/basisIdAuth'){
      //   this.$router.go(-2);
      //   return;
      // }

      //卖币
      if(this.$route.path === '/configSell' && this.routerPath === '/sell-formUserInfo'){
        // console.log("111")
        this.$router.push('/');
        return;
      }

      if(this.$route.path === '/sellOrder' && this.routerPath === '/sell-formUserInfo'){
        this.$router.go(-4);
        return;
      }
      if(this.$route.path === '/configSell' && this.routerPath === '/'){
        this.$router.push('/');
        return;
      }

      this.$router.go(-1);
    },
    openMenu(){
      this.$parent.routerViewState === true ? this.$parent.routerViewState = false : this.$parent.routerViewState = true;
    },
    sellFormBack(){
      this.$parent.$refs.routerView.goDown_state = false;
      this.changeCountry_state = true;
      this.$parent.$refs.routerView.changeCountry_state = true;
    },

    //删除买币表单
    deleteForm(){
      this.$parent.$refs.routerView.deleteForm()
    },
  },
  computed:{
    //导航的显示隐藏
    navigationBarIsShow(){
      // if((this.tabState  &&  this.$route.name !== 'sellOrder' && !this.$parent.routerViewState && this.$route.name !== 'KycVerification') || this.tabState&& this.$route.path !== '/'&&  this.$route.name !== 'sellOrder'&& this.$route.name !== 'KycVerification' ){
      if((this.tabState && this.$route.path === '/sell-formUserInfo' && !this.changeCountry_state) ||
          (this.tabState  &&  this.$route.path !== '/sellOrder' && !this.$parent.routerViewState && this.$route.path !== '/kycVerification') ||
          (this.tabState && this.$route.path !== '/' && this.$route.path !== '/sell-formUserInfo' &&  this.$route.path !== '/sellOrder'&& this.$route.path !== '/kycVerification')
      ){
        return true
      }
      return false
    }
  }
};
</script>

<style lang="scss" scoped>
.navigationBar_view {
  display: flex;
  align-items: center;
  padding-bottom: 0.08rem;
  .navigationBar_view_left {
    display: flex;
    align-items: center;
    font-size: 0.18rem;
    font-family: SFProDisplaybold;
    color: #063376;
    font-weight: 500;
    .icon {
      cursor: pointer;
      display: flex;
      img {
        height: 0.22rem;
      }
    }
    .linkName {
      margin: .01rem 0 0 0.08rem;
      display: flex;
      .currency{
        margin-left: 0.06rem;
      }
      .sellChangeForm{
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: SFProDisplayRegular;
        font-weight: 400;
        font-size: 0.13rem;
        color: #0059DA;
        margin-left: 0.08rem;
        cursor: pointer;
        p:last-child{
          display: flex;
          justify-content: center;
          align-items: center;
          width: 0.14rem;
          margin-left: 0.04rem;
          img{
            width: 100%;
          }
        }
      }
    }
  }
  .navigationBar_view_right {
    display: flex;
    margin-left: auto;
    .menu{
      width: 0.18rem;
    }
    .closeIcon{
      width: 0.24rem;
    }
    .buy_deleteCardInfo{
      margin-left: auto;
      cursor: pointer;
      img{
        width: 0.24rem;
      }
    }
    img {
      cursor: pointer;
    }
  }
}
</style>
