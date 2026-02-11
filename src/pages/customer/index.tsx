import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.css'

export default function CustomerPage() {
  const [customers, setCustomers] = useState<any[]>([])

  const handleAddCustomer = () => {
    Taro.showToast({ title: '新增客户功能开发中', icon: 'none' })
  }

  return (
    <View className="customer-page min-h-screen bg-gray-50 p-4">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">客户管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAddCustomer}
        >
          新增客户
        </Button>
      </View>

      {customers.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">👥</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无客户</Text>
          <Text className="block text-sm text-gray-400">快去添加客户吧</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {/* 客户列表 */}
        </View>
      )}
    </View>
  )
}
