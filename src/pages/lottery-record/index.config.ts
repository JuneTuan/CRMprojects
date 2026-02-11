export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '中奖记录',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '中奖记录',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
