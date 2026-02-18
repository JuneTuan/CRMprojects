export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
