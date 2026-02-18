export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '个人资料',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '个人资料',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
