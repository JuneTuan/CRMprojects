import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

export default function PointsHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)

  // 获取关联的客户
  const fetchCustomer = async () => {
    try {
      const res = await Network.request({
        url: '/api/customer',
        method: 'GET'
      })
      if (res.data.code === 200) {
        const customers = res.data.data || []
        if (customers.length > 0) {
          setCustomer(customers[0])
          return customers[0]
        }
      }
    } catch (error) {
      console.error('获取客户信息失败:', error)
    }
    return null
  }

  // 获取订单列表（积分明细）
  const fetchOrders = async (customerId?: string) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/order',
        method: 'GET',
        data: customerId ? { customerId } : {}
      })
      if (res.data.code === 200) {
        setOrders(res.data.data || [])
      }
    } catch (error) {
      console.error('获取积分明细失败:', error)
      Taro.showToast({ title: '获取积分明细失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const cust = await fetchCustomer()
      if (cust) {
        fetchOrders(cust.id)
      }
    }
    init()
  }, [])

  return (
    <View className="points-history-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">积分明细</Text>
      </View>

      {/* 积分总览 */}
      {customer && (
        <View className="bg-gradient-to-r from-red-500 to-orange-400 rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="block text-white/80 text-sm mb-2">当前积分</Text>
          <Text className="block text-white text-4xl font-bold">
            {customer.points}
          </Text>
          <Text className="block text-white/80 text-xs mt-2">
            累计消费积分明细如下
          </Text>
        </View>
      )}

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">⭐</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无积分记录</Text>
          <Text className="block text-sm text-gray-400">消费后可获得积分</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {orders.map((order) => (
            <View
              key={order.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="flex justify-between items-start">
                <View>
                  <Text className="block text-base font-semibold text-gray-800 mb-1">
                    订单消费
                  </Text>
                  <Text className="block text-sm text-gray-500 mb-2">
                    金额: ¥{order.amount}
                  </Text>
                  <Text className="block text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </View>
                <View className="text-right">
                  <Text className="block text-2xl font-bold text-orange-500">
                    +{order.pointsEarned}
                  </Text>
                  <Text className="block text-xs text-gray-400 mt-1">
                    积分
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 自定义TabBar */}
      <CustomTabBar />
    </View>
  )
}
