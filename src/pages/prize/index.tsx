import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'

export default function PrizePage() {
  const [prizes] = useState<any[]>([])

  const handleAddPrize = () => {
    Taro.showToast({ title: '新增奖品功能开发中', icon: 'none' })
  }

  return (
    <View className="prize-page min-h-screen bg-gray-50 p-4">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">奖品管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAddPrize}
        >
          新增奖品
        </Button>
      </View>

      {prizes.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🎁</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无奖品</Text>
          <Text className="block text-sm text-gray-400">快去添加奖品吧</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {/* 奖品列表 */}
        </View>
      )}
    </View>
  )
}
