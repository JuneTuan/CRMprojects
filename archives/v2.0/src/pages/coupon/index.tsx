import { View, Text, Button } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function CouponPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/coupon',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setCoupons(res.data.data || [])
      }
    } catch (error) {
      console.error('获取卡券列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleUseCoupon = async (id: string) => {
    Taro.showModal({
      title: '确认使用',
      content: '确定要使用该卡券吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/coupon/${id}/use`,
              method: 'PUT'
            })
            Taro.showToast({ title: '使用成功', icon: 'success' })
            fetchCoupons()
          } catch (error) {
            Taro.showToast({ title: '使用失败', icon: 'none' })
          }
        }
      }
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'claimed':
        return '未使用'
      case 'used':
        return '已使用'
      case 'expired':
        return '已过期'
      default:
        return '未知'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'text-orange-500'
      case 'used':
        return 'text-gray-400'
      case 'expired':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <View className="coupon-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">卡券中心</Text>
        <View className="flex gap-2">
          <Button
            className="bg-orange-500 text-white rounded-lg px-4 py-2 text-sm"
            onClick={() => Taro.navigateTo({ url: '/pages/coupon-verify/index' })}
          >
            卡券核销
          </Button>
          <Button
            className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
            onClick={fetchCoupons}
          >
            刷新
          </Button>
        </View>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : coupons.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🧧</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无卡券</Text>
          <Text className="block text-sm text-gray-400">参与抽奖可获得卡券</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate)
            return (
              <View
                key={coupon.id}
                className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                  expired ? 'border-red-400' : coupon.status === 'used' ? 'border-gray-300' : 'border-orange-500'
                }`}
              >
                <View className="flex justify-between items-start">
                  <View className="flex-1">
                    <Text className="block text-base font-semibold text-gray-800 mb-1">
                      卡券 #{coupon.code}
                    </Text>
                    <Text className="block text-sm text-gray-500 mb-1">
                      客户: {coupon.customerId}
                    </Text>
                    {coupon.expiryDate && (
                      <Text className="block text-xs text-gray-400 mb-1">
                        有效期至: {new Date(coupon.expiryDate).toLocaleDateString('zh-CN')}
                      </Text>
                    )}
                    <Text className={`text-sm font-semibold mb-1 ${getStatusColor(coupon.status)}`}>
                      {getStatusText(coupon.status)}
                    </Text>
                    {coupon.usedAt && (
                      <Text className="block text-xs text-gray-400">
                        使用时间: {new Date(coupon.usedAt).toLocaleString('zh-CN')}
                      </Text>
                    )}
                  </View>
                  {coupon.status === 'claimed' && !expired && (
                    <View className="ml-4">
                      <Button size="mini" type="primary" onClick={() => handleUseCoupon(coupon.id)}>
                        使用
                      </Button>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* 自定义TabBar */}
      <CustomTabBar />
    </View>
  )
}
