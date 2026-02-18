import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

export default function PointsHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)

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

  const fetchPointsHistory = async (customerId?: string) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/points-history',
        method: 'GET',
        data: customerId ? { customerId } : {}
      })
      if (res.data.code === 200) {
        setTransactions(res.data.data || [])
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
        fetchPointsHistory(cust.id)
      }
    }
    init()
  }, [])

  const getTypeText = (type: string) => {
    switch (type) {
      case 'earn':
        return '获得积分'
      case 'spend':
        return '消费积分'
      case 'refund':
        return '积分返还'
      case 'adjust':
        return '积分调整'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'text-green-500'
      case 'spend':
        return 'text-red-500'
      case 'refund':
        return 'text-blue-500'
      case 'adjust':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return '🎉'
      case 'spend':
        return '🛒'
      case 'refund':
        return '↩️'
      case 'adjust':
        return '⚙️'
      default:
        return '📊'
    }
  }

  return (
    <View className="points-history-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">积分明细</Text>
      </View>

      {customer && (
        <View className="bg-gradient-to-r from-red-500 to-orange-400 rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="block text-white/80 text-sm mb-2">当前积分</Text>
          <Text className="block text-white text-4xl font-bold">
            {customer.points}
          </Text>
          <Text className="block text-white/80 text-xs mt-2">
            累计积分明细如下
          </Text>
        </View>
      )}

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">⭐</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无积分记录</Text>
          <Text className="block text-sm text-gray-400">消费后可获得积分</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {transactions.map((transaction) => (
            <View
              key={transaction.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="flex justify-between items-start">
                <View className="flex-1">
                  <View className="flex items-center mb-2">
                    <Text className="block text-2xl mr-2">
                      {getTypeIcon(transaction.type)}
                    </Text>
                    <Text className="block text-base font-semibold text-gray-800">
                      {getTypeText(transaction.type)}
                    </Text>
                  </View>
                  <Text className="block text-sm text-gray-500 mb-1">
                    {transaction.description}
                  </Text>
                  <Text className="block text-xs text-gray-400">
                    {new Date(transaction.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </View>
                <View className="text-right">
                  <Text className={`block text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                    {transaction.type === 'spend' ? '-' : '+'}{transaction.amount}
                  </Text>
                  <Text className="block text-xs text-gray-400 mt-1">
                    余额: {transaction.balance}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <CustomTabBar />
    </View>
  )
}
