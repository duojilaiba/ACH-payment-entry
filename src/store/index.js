import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

//
// // https://webpack.js.org/guides/dependency-management/#requirecontext
// const modulesFiles = require.context('./modules', true, /\.js$/)
//
// // you do not need `import app from './modules/app'`
// // it will auto require all vuex module from modules file
// const modules = modulesFiles.keys().reduce((modules, modulePath) => {
//   // set './app.js' => 'app'
//   const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
//   const value = modulesFiles(modulePath)
//   modules[moduleName] = value.default
//   return modules
// }, {})
//
const store = new Vuex.Store({
  // modules,
  // getters
    state: {
        emailFromPath: '', //登陆后前往页面地址
        cardInfoFromPath: '', //填写卡信息后返回页面地址
        //返回首页状态
        homeTabstate: 'buyCrypto', //sellCrypto buyCrypto
        tableState: false, //有参数 隐藏买币或者卖币

        //订单tab状态 sell | buy
        historyTab: 'buy',

        //语言
        language: '',

        //买币页面参数
        buyRouterParams: {
            amount: 0,
            getAmount: 0,
            cryptoCurrency: '',
            exchangeRate: 0,
            payCommission: {
                symbol: '',
                code: '',
            },
            network: '',
            network_fullName: '',
            networkDefault: '',
            addressDefault: '',
            feeRate: '',
            fixedFee: '',
        },
        //卖币页面参数
        sellRouterParams: {
            amount: '',
            payCommission: {
                fiatCode: '',
            },
            currencyData: {
                name: '',
                price: '', //kyc验证需要
            },
            cardInfoList: [],
            //国家币种 - 表单
            formPositionData: {
                enCommonName: '',
                alpha2: '',
                code: '',
            },

            confirmParams: {},


            //交易历史跳转订单订单状态返回
            historyBack: '',

        },

        sellForm: {},

        //卖币费用请求参数
        feeParams: {
            symbol: '',
            fiatCode: '',
            alpha2: '',
        },
        feeParams_order: {
            symbol: '',
            fiatCode: '',
            alpha2: '',
        },
        sellOrderId: '',

        cancelTokenArr: [], //ajax请求队列

        //多语言
        languageValue:'en-US', // EN-US ZH-TW
        LanguageIsShow:false,
        menuState:false,
        isLogin:false,
        kycStatus:0,
        //商户定制 - 订单商户
        customized_orderMerchant: true,
    },
    getters: {
        del_item({commit},id) {
            commit('DEL_ITEM',id)
        }
    },
    mutations: {
        //结束所有请求进程
        pushToken (state, payload) {
            state.cancelTokenArr.push(payload.cancelToken)
        },
        clearToken ({ cancelTokenArr }) {
            cancelTokenArr.forEach(item => {
                if(item){
                    item('路由跳转取消请求')
                }
            })
            cancelTokenArr = []
        },
        emptyToken (state) {
            state.cancelTokenArr = []
        },
        DEL_ITEM(state,id) {
            state.sellForm = id;
        }
    },

})

export default store
