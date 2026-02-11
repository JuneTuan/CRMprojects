export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '活动管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '活动管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
