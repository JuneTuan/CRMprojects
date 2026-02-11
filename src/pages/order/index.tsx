import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'

export default function OrderPage() {
  const [orders] = useState<any[]>([])

  const handleAddOrder = () => {
    Taro.showToast({ title: '新增订单功能开发中', icon: 'none' })
  }

  return (
    <View className="order-page min-h-screen bg-gray-50 p-4">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">订单管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAddOrder}
        >
          新增订单
        </Button>
      </View>

      {orders.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">📝</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无订单</Text>
          <Text className="block text-sm text-gray-400">快去创建订单吧</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {/* 订单列表 */}
        </View>
      )}
    </View>
  )
}
