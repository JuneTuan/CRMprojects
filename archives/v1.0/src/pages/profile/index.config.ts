export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '我的',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '我的',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
