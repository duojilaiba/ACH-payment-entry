/**
 * 项目工程多语言配置
 */
import Vue from "vue";
import VueI18n from 'vue-i18n'
import common from "../common";

Vue.use(VueI18n)
const i18n = new VueI18n({
    locale: sessionStorage.getItem("language") || 'EN-US',
    messages: {
        'en-US': common.merchant_name === 'Lapay' ? require('./language/Lapay/en-US') : require('./language/AlchemyPay/en-US'),
        'zh-HK': common.merchant_name === 'Lapay' ? require('./language/Lapay/zh-HK') : require('./language/AlchemyPay/zh-HK'),
    },
    silentTranslationWarn: true,
})
export default i18n;

