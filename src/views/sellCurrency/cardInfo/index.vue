<template>
  <div id="box">
    <div id="sell-form" ref="box_ref" @scroll="handleScroll" v-if="!changeCountry_state">
      <div class="sellForm-content" ref="form_ref">
        <!-- 历史表单信息 -->
        <div class="cardInfo-history" v-if="oldCardInfo.length > 0">
          <div class="line1">
            <div class="line1-1"><el-checkbox class="checkbox" size="medium" v-model="isOldCardInfo" @change="assignmentOldCardInfo"></el-checkbox></div>
            <div class="line1-2">Use this Information</div>
            <div class="more" @click="openCardInfo" v-if="oldCardInfo.length > 1">More</div>
          </div>
          <div class="info">
            <span></span>  Account number: {{ oldCardInfo[0].accountNumber }}
          </div>
        </div>

        <div class="formLine" v-for="(item,index) in formJson" :key="index">
          <!-- 提示信息 - JPY NPR BRL -->
          <div class="tipsMessage" v-if="(currency === 'JPY' && item.paramsName === 'bankCode') ||
        (currency === 'NPR' && item.paramsName === 'routingCodeValue1') ||
        (currency === 'BRL' && item.paramsName === 'bankCode') ||
        (currency === 'BDT' && item.paramsName === 'routingCodeValue1')">
            {{ $t('nav.sell_form_tips') }}：{{ $t(item.multinomialTips) }}</div>
          <div class="formTitle"><span v-if="item.required">*</span>{{ $t(item.name) }}</div>
          <!-- bank account type -->
          <div class="formContent cursor" v-if="item.type === 'radio' && item.paramsName === 'bankAccountType'" @click="openSelect(item,index)">
            <div class="radioInput" :class="{'radios-true': selected.index === index}">
              <div class="value">{{ $t(item.model) }}</div>
              <div class="rightIcon"><img src="../../../assets/images/rightBlackIcon.png" alt=""></div>
            </div>
          </div>
          <div class="formContent cursor" v-else-if="item.type === 'radio'" @click="openSelect(item,index)">
            <div class="radioInput" :class="{'radios-true': selected.index === index}">
              <div class="value">{{ item.model }}</div>
              <div class="rightIcon"><img src="../../../assets/images/rightBlackIcon.png" alt=""></div>
            </div>
          </div>
          <div class="formContent" v-else>
            <input type="text" v-model="item.model" :maxlength="item.maxLength" @input="inputChange(item,index)"  @focus="inputFocus" @blur="inputBlur">
          </div>
          <p class="errorMessage" v-if="item.tipsState">{{ $t(item.tips) }}</p>
          <p class="errorMessage" v-else-if="item.multinomialTipsState && currency !== 'JPY' && currency !== 'NPR' && currency !== 'BRL'">{{ $t(item.multinomialTips) }}</p>
        </div>
      </div>

      <!-- 购买提示信息 -->
      <div class="attention"><span>Attention:</span> Please ensure the bank account belongs to you and the information is accurate. Returned transactions are subjected to $25 fee charged by our banking partners.</div>

      <button class="continue" :disabled="disabled" @click="submit" v-show="buttonIsShow" ref="button_ref">
        {{ $t('nav.Confirm') }}
        <img class="rightIcon" src="../../../assets/images/button-right-icon.svg" v-if="!request_loading">
        <van-loading class="icon rightIcon" type="spinner" color="#fff" v-else/>
      </button>
    </div>

    <!-- 修改国家 -->
    <search viewName="payCurrency-sell-cardForm" :allBasicData="allBasicData" v-else/>

    <!-- tips icon -->
    <transition>
      <div class="downTips-icon" v-show="goDown_state" @click="goDown"><img src="@/assets/images/downIcon.svg" ref="downTips_ref" alt=""></div>
    </transition>

    <!-- 单选框 -->
    <!-- bank account type -->
    <div class="selectView" v-if="selectState && selected.paramsName === 'bankAccountType'" @click="closeRadio">
      <ul class="selectDate">
        <li v-for="(item,index) in this.selected.item" :key="index" @click="specialChiseCheck(item)">{{ $t(item.value) }}</li>
      </ul>
    </div>
    <div class="selectView" v-else-if="selectState" @click="closeRadio">
      <ul class="selectDate">
        <li v-for="(item,index) in this.selected.item" :key="index" @click="chiseCheck(item)">{{ $t(item) }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import allFormJson from "@/assets/json/currencyPurchaseFormRules.json";
import { AES_Decrypt, AES_Encrypt } from "../../../utils/encryp";
import Search from "../../../components/search"

export default {
  name: "sellCardInfo",
  components: {Search},
  data(){
    return{
      formJson: [],
      formJsonCopy: [],
      currency: "",
      buttonIsShow:true,
      selectState: false,
      selected: {
        item: {},
        index: 0,
      },
      request_loading: false,

      goDown_state: false,
      oldOffsetTop: 0,
      timeDown: null,

      //历史卡信息
      isOldCardInfo: false,
      oldCardInfo: [],
      changeCountry_state: false,

      allBasicData: {},
    }
  },
  //首页进入卖币卡表单页面清空缓存
  beforeRouteEnter(to,from,next) {
    next(vm => {
      //初始化选中最近一次历史卡信息状态
      vm.isOldCardInfo = false;
      if ((to.path === '/sell-formUserInfo' && from.path === '/')&& vm.$store.state.cardInfoFromPath !== 'sellOrder') {
        vm.formJson = [];
      }
    })
  },
  beforeRouteLeave(to,from,next) {
    //离开页面保存表单信息
    let paramsFormData = this.paramsFormData();
    window.sessionStorage.setItem("sellForm",JSON.stringify(paramsFormData));
    next();
  },
  activated(){
    //选择国家和法币
    if(window.localStorage.getItem('allBasicData')){
      let basicData = JSON.parse(window.localStorage.getItem('allBasicData'));
      basicData.worldList.forEach((item,index)=>{
        if(item.sellFiatList){
          item.sellFiatList.forEach((item2,index2)=>{
            basicData.fiatCurrencyList.forEach(item3=>{
              if(item3.code === item2){
                basicData.worldList[index].sellFiatList[index2] = item3;
              }
            })
          })
        }
      })
      this.allBasicData = basicData;
    }

    //初始化根据可视高度控制向下提示按钮状态
    this.initializeGoDown();

    //email跳转接入
    if(this.$route.query.emailAccess){
      this.$store.state.sellRouterParams.formPositionData.alpha2 = this.$route.query.position_alpha2;
      this.$store.state.sellRouterParams.formPositionData.code = this.$route.query.position_code;
      this.$store.state.sellRouterParams.getAmount = this.$route.query.getAmount;
    }

    //初始化表单
    this.initializeForm();

    //加载卡信息列表
    this.queryCardInfoList();
  },
  computed: {
    //动态表单判空、正则校验
    disabled(){
      //表单非必填项数量
      let noRequiredNum = this.formJson.filter((value) => {
        return value.required === false
      }).length;
      //必填项数据
      let requiredArray = this.formJson.filter((value) => {
        return value.required === true && (value.model === '' || !new RegExp(value.regular).test(value.model) || value.tipsState === true || value.multinomialTipsState === true)
      })
      //非必填项数据
      let noRequiredArray = this.formJson.filter((value) => {
        return value.required === false && (value.model === '' || !new RegExp(value.regular).test(value.model) || value.tipsState === true || value.multinomialTipsState === true)
      })

      //JPY - bank code和swift code不能同时为空、非必填项校验
      //NPR - swift和location不能同时为空、非必填项校验
      //BRL - bank code和swift code不能同时为空、非必填项校验
      if(this.formJson.length !== 0 && (this.currency === 'JPY' || this.currency === 'NPR' || this.currency === 'BRL')){
        if(requiredArray.length === 0 && noRequiredArray.length === 1 && noRequiredArray[0].model === ""){
          this.formJson.filter(item=>{ return item.paramsName === noRequiredArray[0].paramsName })[0].tipsState = false;
          return this.request_loading === false ?  false : true;
        }
        if(requiredArray.length !== 0 || noRequiredArray.length === 2  || (noRequiredArray.length === 1 && noRequiredArray[0].tipsState === true)){
          return true;
        }
        return this.request_loading === false ?  false : true;
      }

      //针对PHP
      if(requiredArray.length === 0 && noRequiredArray.length > 0 && noRequiredArray[0].model !== '' && noRequiredArray.length === 1 && noRequiredNum === 1){
        return true
      }

      requiredArray.length === 0 ? this.formJson.forEach((item,index)=>{this.formJson[index].tipsState = false}) : '';
      return requiredArray.length === 0 && this.request_loading === false ? false : true;
    },
  },
  methods: {
    //初始化根据可视高度控制向下提示按钮状态
    initializeGoDown(){
      setTimeout(()=>{
        if(this.$refs.box_ref.offsetHeight + 4 < document.getElementById("sell-form").scrollHeight - 50){
          this.goDown_state = true;
        }else{
          this.goDown_state = false;
        }
      })
    },

    // 正则校验 展示提示信息
    inputChange(val,index){
      //BDT - Swift code不是以DBBLBDDH开头的时候branch name必输
      if(this.currency === 'BDT' && val.paramsName === 'routingCodeValue1' && val.model.substr(0,8) !== 'DBBLBDDH'){
        this.formJson.filter(item=>{ return item.paramsName === "routingCodeValue2" })[0].required = true;
      }else if(this.currency === 'BDT' && val.paramsName === 'routingCodeValue1' && val.model.substr(0,8) === 'DBBLBDDH'){
        this.formJson.filter(item=>{ return item.paramsName === "routingCodeValue2" })[0].required = false
      }
      //所有表单正则验证
      if(!new RegExp(val.regular).test(this.formJson[index].model)){
        this.formJson[index].tipsState = true;
      }else{
        this.formJson[index].tipsState = false;
      }
    },

    //表单 - 单选框
    openSelect(item,index){
      this.selectState = true;
      this.selected = {
        item: item.radioList,
        index: index,
        paramsName: item.paramsName
      };
    },
    closeRadio(){
      this.selectState = false;
      this.selected.index = '';
    },
    chiseCheck(item){
      this.selectState = false;
      this.formJson[this.selected.index].model = this.$t(item);
      this.formJson[this.selected.index].tipsState = false;
    },
    specialChiseCheck(item){
      this.selectState = false;
      this.bankAccountType(item,2);
      this.formJson[this.selected.index].tipsState = false;
    },
    bankAccountType(value,step){
      if(step === 1){
        this.formJson.forEach((item,index)=>{
          if(item.paramsName === 'bankAccountType'){
            switch (value.model){
              case "3":
                this.formJson[index].model = "nav.sell_form_bankAccountTypeLi_Saving";
                break;
              case "4":
                this.formJson[index].model = "nav.sell_form_bankAccountTypeLi_Checking";
                break;
              case "5":
                this.formJson[index].model = "nav.sell_form_bankAccountTypeLi_TimeDeposit";
                break;
              case "6":
                this.formJson[index].model = "nav.sell_form_bankAccountTypeLi_Others";
                break;
              case "7":
                this.formJson[index].model = "nav.sell_form_accountTypeLi_Maestra";
                break;
            }
          }
        })
        return;
      }
      if(step === 2){
        switch (value.key){
          case "3":
            this.formJson[this.selected.index].model = "nav.sell_form_bankAccountTypeLi_Saving";
            break;
          case "4":
            this.formJson[this.selected.index].model = "nav.sell_form_bankAccountTypeLi_Checking";
            break;
          case "5":
            this.formJson[this.selected.index].model = "nav.sell_form_bankAccountTypeLi_TimeDeposit";
            break;
          case "6":
            this.formJson[this.selected.index].model = "nav.sell_form_bankAccountTypeLi_Others";
            break;
          case "7":
            this.formJson[this.selected.index].model = "nav.sell_form_accountTypeLi_Maestra";
            break;
        }
        return;
      }
      if(step === 3){
        this.formJsonCopy.forEach((item,index)=> {
          if (item.paramsName === 'bankAccountType') {
            switch (value.model) {
              case 'nav.sell_form_bankAccountTypeLi_Saving':
                this.formJsonCopy[index].model = "3";
                break;
              case "nav.sell_form_bankAccountTypeLi_Checking":
                this.formJsonCopy[index].model = "4";
                break;
              case "nav.sell_form_bankAccountTypeLi_TimeDeposit":
                this.formJsonCopy[index].model = "5";
                break;
              case "nav.sell_form_bankAccountTypeLi_Others":
                this.formJsonCopy[index].model = "6";
                break;
              case "nav.sell_form_accountTypeLi_Maestra":
                this.formJsonCopy[index].model = "7";
                break;
            }
          }
        })
        return;
      }
    },

    //表单数据转换对象 处理表单加密数据 定义表单入参特殊字段
    paramsFormData(){
      let queryForm = {
        countryCode: this.$store.state.sellRouterParams.formPositionData.alpha2, // 国家Code
        fiatCode: this.$store.state.sellRouterParams.formPositionData.code, // 法币Code
      };
      this.formJsonCopy = JSON.parse(JSON.stringify(this.formJson));
      let bankAccountTypeDate = this.formJsonCopy.filter(res=>{return res.paramsName === 'bankAccountType'})[0];
      this.bankAccountType(bankAccountTypeDate,3);
      this.formJsonCopy.forEach(item=>{
        if(item.model !== ''){
          queryForm[item.paramsName] = item.model;
        }
      });
      let params = JSON.parse(JSON.stringify(queryForm));
      //加密字段
      params.contactNumber = this.encrypt(params.contactNumber);
      params.name = this.encrypt(params.name);
      params.email = this.encrypt(params.email);
      params.accountNumber = this.encrypt(params.accountNumber);
      params.idNumber = this.encrypt(params.idNumber);
      this.currency === "BRL" ? params.idType = "CPF" : '';
      this.currency === "CLP" ?  params.idType = "RUT" : '';
      return params;
    },
    //确认订单 - 处理请求参数
    submit(){
      let params = this.paramsFormData();
      this.isKyc(params)


    },
    //确认订单 - 请求服务
    processRequest(val){
      console.log("下单")
      let params = {
        sellCardDTO: val,
        orderId: this.$store.state.cardInfoFromPath === 'configSell' ? '' : this.$store.state.sellOrderId, // 不传为新增卡信息，传为修改卡信息
        cryptoCurrency: this.$store.state.sellRouterParams.currencyData.name,
        sellVolume: this.$store.state.sellRouterParams.amount,
        network: this.$store.state.sellRouterParams.currencyData.sellNetwork.network,
      }
      this.$axios.post(this.$api.post_sellForm,params,'').then(res=>{
        if(res && res.returnCode === '0000'){
          //存储数据 加密字段
          let sellForm = {};
          this.formJson.forEach(item => {
            sellForm[item.paramsName] = item.model;
          })
          sellForm.contactNumber = this.encrypt(sellForm.contactNumber);
          sellForm.name = this.encrypt(sellForm.name);
          sellForm.email = this.encrypt(sellForm.email);
          sellForm.accountNumbe = this.encrypt(sellForm.accountNumber);
          sellForm.idNumber = this.encrypt(sellForm.idNumber);
          this.$store.state.sellForm = sellForm;
          this.$store.state.sellOrderId = res.data.orderId;
          this.$store.state.nextOrderState = 1;
          //跳转状态
          this.request_loading = false;
          this.$router.push(`/sellOrder?sellOrderId=${this.$route.query.orderId}`)
        }else {
          this.request_loading = false;
        }
      }).catch(()=>{
        this.request_loading = false;
      })
    },

    isKyc(val){
      this.request_loading = true;
      let params = {
        amount: this.$store.state.sellRouterParams.amount * this.$store.state.sellRouterParams.currencyData.price
      }
      var FormData = require('form-data');
        var data = new FormData();
         data.append('amount', params.amount);
      this.$axios.post(this.$api.post_getKycStatus,data,'').then(res=>{
        if(res && res.returnCode === '0000'){
          if(res.data === true){
            this.$store.state.sellRouterParams.positionData = this.$store.state.sellRouterParams.formPositionData;

            this.$store.state.sellRouterParams.fullName = val.name
            this.$store.state.sellRouterParams.confirmParams = val;
              //存储数据 加密字段
              let sellForm = {};
              this.formJson.forEach(item => {
                sellForm[item.paramsName] = item.model;
              })
              sellForm.contactNumber = this.encrypt(sellForm.contactNumber);
              sellForm.name = this.encrypt(sellForm.name);
              sellForm.email = this.encrypt(sellForm.email);
              sellForm.accountNumbe = this.encrypt(sellForm.accountNumber);
              sellForm.idNumber = this.encrypt(sellForm.idNumber);
              this.$store.state.sellForm = sellForm;
              this.$store.state.sellOrderId = res.data.orderId;
              this.request_loading = false;

            this.$store.state.sellRouterParams.fullName = val.name;
            this.$store.state.sellRouterParams.historyBack = 'back';
            this.request_loading = false;

            this.$router.push('/kycVerification');

          }else{
            this.$store.state.sellRouterParams.positionData = this.$store.state.sellRouterParams.formPositionData;

            console.log("false")
            this.processRequest(val);
            //

            this.$store.state.sellRouterParams.historyBack = 'back';

          }
        }
      })
    },

    inputFocus(){
      if(this.$store.state.isPcAndPhone === 'phone'){
        this.buttonIsShow = false
        return
      }else{
        this.buttonIsShow = true
        return
      }
    },
    inputBlur(){
        this.buttonIsShow = true
    },

    //按钮进入可视区域，隐藏滚动到底部按钮
    handleScroll(val){
      window.clearTimeout(this.timeDown);
      this.timeDown = null;
      let offset = this.$refs.button_ref.getBoundingClientRect();

      //滚动的像素+容器的高度>可滚动的总高度-50像素
      if(this.oldOffsetTop !== offset.top && (val.srcElement.scrollTop+val.srcElement.offsetHeight<val.srcElement.scrollHeight - 50)){
        this.goDown_state = false;
        window.clearTimeout(this.timeDown);
        this.timeDown = null;
        this.timeDown = setTimeout(()=>{
          this.goDown_state = true;
        },1000)
      }

      if(val.srcElement.scrollTop+val.srcElement.offsetHeight>val.srcElement.scrollHeight - 50) {
        window.clearTimeout(this.timeDown);
        this.timeDown = null;
        this.goDown_state = false;
      }
      this.oldOffsetTop = offset.top;
    },
    goDown(){
      setTimeout(()=>{
        this.$refs.button_ref.scrollIntoView({behavior: "smooth", block: "end", inline: 'end'})
        this.goDown_state = false;
      })
    },

    //点击tab栏返回首页修改卖币信息再次进入赋值表单信息
    initializeForm(){
      //根据货币类型来过滤不同表单

      this.currency = this.$store.state.sellRouterParams.formPositionData.code;

      this.formJson = JSON.parse(JSON.stringify(allFormJson.filter(item=>{return item.currency.includes(this.currency)})[0].form));

      //PHP - 金额大于500000地址必输
      if(this.currency === 'PHP' && this.$store.state.sellRouterParams.getAmount > 500000){
        this.formJson.filter(item=>{ return item.paramsName === "address" })[0].required = true;
      }else if(this.currency === 'PHP' && this.$store.state.sellRouterParams.getAmount <= 500000){
        this.formJson.filter(item=>{ return item.paramsName === "address" })[0].required = false;
      }
    },

    //展示历史卡信息
    openCardInfo(){
      this.$parent.historicalCardInfoSell_state = true;
    },

    //加载历史卡信息列表
    queryCardInfoList(){
      let _this = this;
      let params = {
        country: this.$store.state.sellRouterParams.formPositionData.alpha2,
        fiatName: this.$store.state.sellRouterParams.formPositionData.code,
      }
      this.$axios.get(this.$api.get_cardList,params).then(res=>{
        if(res && res.returnCode === '0000'){
          _this.$store.state.sellRouterParams.cardInfoList = res.data;
          _this.$store.state.sellForm = res.data[0];
          //默认展示最近一条数据
          if(res.data.length > 0){
            let oldCardInfo = {};
            oldCardInfo = JSON.parse(JSON.stringify(res.data));
            oldCardInfo[0].accountNumber = AES_Decrypt(oldCardInfo[0].accountNumber);
            _this.oldCardInfo = oldCardInfo;
          }else{
            _this.oldCardInfo = [];
          }
          this.$forceUpdate()
        }
      })
    },

    //处理选择历史表单和赋值最近一次卡信息
    assignmentOldCardInfo(){
      if(this.isOldCardInfo === false){
        this.currency = this.$store.state.sellRouterParams.formPositionData.code;
        this.formJson = JSON.parse(JSON.stringify(allFormJson.filter(item=>{return item.currency.includes(this.currency)})[0].form));
      }else{
        this.decryptCardInfo(JSON.parse(JSON.stringify(this.$store.state.sellRouterParams.cardInfoList[0]))); //选择历史卡信息
      }
    },

    //解密历史表单信息
    decryptCardInfo(val){
      let sellForm = [];
      sellForm = val;
      this.formJson.forEach((item,index) => {
        for (let itemKey in sellForm) {
          if(item.paramsName === itemKey){
            if(itemKey === 'contactNumber'||itemKey === 'name'||itemKey === 'email'||itemKey === 'accountNumber'||itemKey === 'idNumber'){
              this.formJson[index].model = AES_Decrypt(sellForm[itemKey]);
            }else{
              this.formJson[index].model = sellForm[itemKey];
            }
          }
        }
      })
      let bankAccountTypeDate = this.formJson.filter(res=>{return res.paramsName === 'bankAccountType'})[0];
      this.bankAccountType(bankAccountTypeDate,1);
    },

    encrypt(val){
      if(val){
        return AES_Encrypt(val);
      }
    }
  },
}
</script>

<style lang="scss" src="./cardInfo.scss" scoped></style>
