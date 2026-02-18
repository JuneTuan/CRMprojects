export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '卡券核销',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '卡券核销',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
