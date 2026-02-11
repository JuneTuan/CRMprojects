export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/register/index',
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
  // 移除原生TabBar，使用自定义TabBar
})
