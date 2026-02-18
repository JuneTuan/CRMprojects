export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '首页'
    })
  : {
      navigationBarTitleText: '首页'
    }
