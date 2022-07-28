export default {
  //------------------------- 公共接口 -------------------------
  "post_sendEmail": '/mail/sending',
  "post_login": '/user/login',
  "post_outLogin": '/login/to-logout',
  "get_transactionHistory": '/trade/list',
  "get_buyCryptoInfo": '/crypto/buy/v2',
  //国家法币列表
  "get_countryList": '/crypto/world/list',

  //------------------------- 买币接口 -------------------------
  "get_network": '/crypto/network',
  "get_inquiryFee": '/crypto/fee',
  "post_coinSupportedWallet": '/crypto/wallet/check',
  "post_buy": '/trade/create',
  "post_indonesiaBuy": '/pay/idr/submit',
  "post_internationalCard": '/pay/card/submit',
  "post_saveCardInfo": '/user/card/submit',
  "post_getCardInfo": '/trade/confirm',
  "get_payResult": '/pay/result/check',
  "post_basisIdAuth": '/kyc/auth/check',
  "post_storageBasisIdAuth": '/kyc/auth/create',
  "get_isbasisIdAuth": '/kyc/auth/status',
  "get_orderVerification": '/merchant/order/check',
  "post_mxnSubmit": '/pay/mxn/submit',
  //查询货币支持的支付方式
  "get_payMethods": '/crypto/payment/v2',
  //查询订单状态
  "get_orderState": '/trade/',
  //信用卡信息删除
  "post_deleteForm": '/user/card/delete/',

  //------------------------- 卖币接口 -------------------------
  //卖币查询费用
  "get_inquiryFeeSell": '/crypto/sell/fee/v2',
  //银行列表
  "get_bank": '/world/bank/list',
  //获取卖币用户卡信息
  "get_userSellCardInfo": '/user/card/query/sell',
  //卖币确认订单
  "post_sellConfirmOrder": '/trade/confirm/sell/order',
  //查询卖币订单订单状态
  "get_PlayCurrencyStatus":'/trade/query/sell/order',

  //获取卖币支持网络
  "get_networkList":'/crypto/sell/network',
  //卖币确认订单
  "post_sellForm": '/trade/create/sell/coin/order',
  //历史卡信息列表
  "get_cardList": '/user/card/query/sell/list',
  //卖币切换网络
  "post_sellSelectNet":'/trade/sell/order/switching/network',
  //卖币查询费率接口
  "get_sellRampfee":'/crypto/sell/fee/v2',
  // 卖币申请退款
  "get_sellRefund": '/trade/sell/order/refund',
  //是否需要kyc验证
  "get_kyc": '/trade/query/sell/coin/kyc',
  //卖币历史订单列表
  "get_sellHistory": '/trade/query/sell/order/history',
  //卖币查询订单详细信息
  "get_sellOrderDetails": '/trade/query/sell/order/details',
  //------------------------- kyc验证获取token接口 -------------------------
    //获取kyc验证token
  "post_getKycToken":'/kyc/getKycToken',
  //买币是否要kyc验证
  "post_getKycThrough":'/kyc/buyKycThrough',
  //卖币是否要kyc验证
  "post_getKycStatus":'/kyc/getSellKycStatus',
  //用户一键登陆接口
  "getUserLogin":'/login/free/certification',
  //用户是否是风险账号
  "post_kycDisabled":'/kyc/kycDisabled'
}
