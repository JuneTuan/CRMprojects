import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import './index.css'

export default function CouponPage() {
  const [coupons] = useState<any[]>([])

  return (
    <View className="coupon-page min-h-screen bg-gray-50 p-4">
      <Text className="text-xl font-bold text-gray-800 mb-4">卡券管理</Text>

      {coupons.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🧧</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无卡券</Text>
          <Text className="block text-sm text-gray-400">中奖后将自动发放卡券</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {/* 卡券列表 */}
        </View>
      )}
    </View>
  )
}
