import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.css'

export default function ProfilePage() {
  const navigateTo = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <View className="profile-page min-h-screen bg-gray-50">
      {/* 用户信息卡片 */}
      <View className="bg-red-600 p-6 pt-12 pb-8">
        <View className="flex items-center">
          <View className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Text className="text-3xl">👤</Text>
          </View>
          <View className="ml-4">
            <Text className="block text-xl font-bold text-white">管理员</Text>
            <Text className="block text-sm text-red-100">超级管理员</Text>
          </View>
        </View>
      </View>

      {/* 功能菜单 */}
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

      {/* 退出登录 */}
      <View className="mx-4 mt-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="block text-center text-base font-semibold text-red-600">
            退出登录
          </Text>
        </View>
      </View>
    </View>
  )
}
