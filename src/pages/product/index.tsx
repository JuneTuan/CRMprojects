import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'

export default function ProductPage() {
  const [products] = useState<any[]>([])

  const handleAddProduct = () => {
    Taro.showToast({ title: '新增产品功能开发中', icon: 'none' })
  }

  return (
    <View className="product-page min-h-screen bg-gray-50 p-4">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">产品管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAddProduct}
        >
          新增产品
        </Button>
      </View>

      {products.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">📦</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无产品</Text>
          <Text className="block text-sm text-gray-400">快去添加产品吧</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {/* 产品列表 */}
        </View>
      )}
    </View>
  )
}
