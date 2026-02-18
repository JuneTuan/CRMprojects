export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '奖品管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '奖品管理',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
