export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '产品管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '产品管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
