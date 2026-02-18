export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '卡券管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '卡券管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
