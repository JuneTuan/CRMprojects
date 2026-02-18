export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '积分明细',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '积分明细',
      navigationBarBackgroundColor: '#dc2626',
      navigationBarTextStyle: 'white'
    }
