export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/customer/index',
    'pages/product/index',
    'pages/order/index',
    'pages/prize/index',
    'pages/coupon/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#dc2626',
    navigationBarTitleText: '春节幸运大转盘',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#dc2626',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '抽奖'
      },
      {
        pagePath: 'pages/customer/index',
        text: '客户'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
