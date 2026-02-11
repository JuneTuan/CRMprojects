import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.less'

export default function CustomTabBar() {
  const [selected, setSelected] = useState(0)
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    // 获取用户角色
    const userInfo = Taro.getStorageSync('userInfo')
    setRole(userInfo?.role || 'customer')

    // 获取当前页面路径
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage.route || ''

    // 设置当前选中的Tab
    if (role === 'customer') {
      const customerTabs = ['pages/index/index', 'pages/profile/index']
      const index = customerTabs.findIndex(tab => route.includes(tab))
      setSelected(index >= 0 ? index : 0)
    } else {
      const staffTabs = [
        'pages/customer/index',
        'pages/product/index',
        'pages/order/index',
        'pages/prize/index',
        'pages/coupon/index',
        'pages/profile/index'
      ]
      const index = staffTabs.findIndex(tab => route.includes(tab))
      setSelected(index >= 0 ? index : 0)
    }
  }, [role])

  const handleTabClick = (index: number, url: string) => {
    setSelected(index)

    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage.route || ''

    // 如果已经在目标页面，不做任何操作
    if (currentRoute === url.replace(/^\//, '')) {
      return
    }

    // 判断是使用 switchTab 还是 navigateTo
    if (currentRoute.startsWith('pages/index') || currentRoute.startsWith('pages/profile') ||
        currentRoute.startsWith('pages/customer') || currentRoute.startsWith('pages/product') ||
        currentRoute.startsWith('pages/order') || currentRoute.startsWith('pages/prize') ||
        currentRoute.startsWith('pages/coupon')) {
      Taro.switchTab({ url })
    } else {
      Taro.redirectTo({ url })
    }
  }

  // 客户角色的TabBar
  const customerTabs = [
    { text: '抽奖', icon: '🎰', url: '/pages/index/index' },
    { text: '我的', icon: '👤', url: '/pages/profile/index' }
  ]

  // 员工角色的TabBar
  const staffTabs = [
    { text: '客户', icon: '👥', url: '/pages/customer/index' },
    { text: '产品', icon: '📦', url: '/pages/product/index' },
    { text: '订单', icon: '📝', url: '/pages/order/index' },
    { text: '奖品', icon: '🎁', url: '/pages/prize/index' },
    { text: '卡券', icon: '🧧', url: '/pages/coupon/index' },
    { text: '我的', icon: '👤', url: '/pages/profile/index' }
  ]

  const tabs = role === 'customer' ? customerTabs : staffTabs

  return (
    <View className="custom-tab-bar">
      {tabs.map((tab, index) => (
        <View
          key={index}
          className={`tab-item ${selected === index ? 'active' : ''}`}
          onClick={() => handleTabClick(index, tab.url)}
        >
          <Text className="tab-icon">{tab.icon}</Text>
          <Text className="tab-text">{tab.text}</Text>
        </View>
      ))}
    </View>
  )
}
