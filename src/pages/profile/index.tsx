import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import CustomTabBar from '@/components/CustomTabBar'

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // 获取用户信息
    const user = Taro.getStorageSync('userInfo')
    setUserInfo(user)
  }, [])

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('userInfo')

          Taro.showToast({ title: '已退出登录', icon: 'success' })

          // 跳转到登录页
          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/login/index' })
          }, 1000)
        }
      }
    })
  }

  const navigateTo = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  // 根据角色显示不同的内容
  const isCustomer = userInfo?.role === 'customer'
  const isStaff = userInfo?.role === 'staff' || userInfo?.role === 'admin'

  return (
    <View className="profile-page min-h-screen bg-gray-50 pb-20">
      {/* 用户信息卡片 */}
      <View className="bg-red-600 p-6 pt-12 pb-8">
        <View className="flex items-center">
          <View className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Text className="text-3xl">👤</Text>
          </View>
          <View className="ml-4">
            <Text className="block text-xl font-bold text-white">{userInfo?.name || '用户'}</Text>
            <Text className="block text-sm text-red-100">
              {isCustomer ? '客户' : isStaff ? '管理员' : '用户'}
            </Text>
          </View>
        </View>
      </View>

      {/* 客户功能 */}
      {isCustomer && (
        <View className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <View
            className="flex items-center justify-between p-4 border-b border-gray-100"
            onClick={() => navigateTo('/pages/my-coupon/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">🎫</Text>
              <Text className="text-base font-semibold text-gray-800">我的卡券</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>

          <View
            className="flex items-center justify-between p-4 border-b border-gray-100"
            onClick={() => navigateTo('/pages/lottery-record/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">🎁</Text>
              <Text className="text-base font-semibold text-gray-800">中奖记录</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>

          <View
            className="flex items-center justify-between p-4 border-b border-gray-100"
            onClick={() => navigateTo('/pages/points-history/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">⭐</Text>
              <Text className="text-base font-semibold text-gray-800">积分明细</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>

          <View
            className="flex items-center justify-between p-4"
            onClick={() => navigateTo('/pages/edit-profile/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">👤</Text>
              <Text className="text-base font-semibold text-gray-800">个人资料</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>
        </View>
      )}

      {/* 员工功能 */}
      {isStaff && (
        <View className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <View
            className="flex items-center justify-between p-4 border-b border-gray-100"
            onClick={() => navigateTo('/pages/product/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">📦</Text>
              <Text className="text-base font-semibold text-gray-800">产品管理</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>

          <View
            className="flex items-center justify-between p-4 border-b border-gray-100"
            onClick={() => navigateTo('/pages/order/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">📝</Text>
              <Text className="text-base font-semibold text-gray-800">订单管理</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>

          <View
            className="flex items-center justify-between p-4 border-b border-gray-100"
            onClick={() => navigateTo('/pages/prize/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">🎁</Text>
              <Text className="text-base font-semibold text-gray-800">奖品管理</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>

          <View
            className="flex items-center justify-between p-4"
            onClick={() => navigateTo('/pages/coupon/index')}
          >
            <View className="flex items-center">
              <Text className="text-2xl mr-3">🧧</Text>
              <Text className="text-base font-semibold text-gray-800">卡券管理</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </View>
        </View>
      )}

      {/* 退出登录 */}
      <View className="mx-4 mt-4">
        <Button
          className="bg-white text-red-600 rounded-2xl"
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </View>

      {/* 自定义TabBar */}
      <CustomTabBar />
    </View>
  )
}
