export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '用户注册',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '用户注册',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
