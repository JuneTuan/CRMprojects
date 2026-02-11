export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '客户管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '客户管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
