import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

export default function PurchaseRecordPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])

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

  // 获取产品列表
  const fetchProducts = async () => {
    try {
      const res = await Network.request({
        url: '/api/product',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setProducts(res.data.data || [])
      }
    } catch (error) {
      console.error('获取产品列表失败:', error)
    }
  }

  // 获取订单列表
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
      console.error('获取购买记录失败:', error)
      Taro.showToast({ title: '获取购买记录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 获取产品名称
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product ? product.name : '未知商品'
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    const init = async () => {
      await fetchProducts()
      const cust = await fetchCustomer()
      if (cust) {
        fetchOrders(cust.id)
      }
    }
    init()
  }, [])

  // 计算总消费和总积分
  const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0)
  const totalPoints = orders.reduce((sum, order) => sum + (order.pointsEarned || 0), 0)

  return (
    <View className="purchase-record-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="block text-xl font-bold text-gray-800">购买记录</Text>
      </View>

      {/* 统计卡片 */}
      <View className="bg-gradient-to-r from-red-500 to-orange-400 rounded-2xl p-6 mb-6 shadow-lg">
        <View className="flex justify-between">
          <View className="flex-1 text-center">
            <Text className="block text-white/80 text-sm mb-2">累计消费</Text>
            <Text className="block text-white text-3xl font-bold">
              ¥{totalAmount.toFixed(2)}
            </Text>
          </View>
          <View className="w-px bg-white/20 mx-4"></View>
          <View className="flex-1 text-center">
            <Text className="block text-white/80 text-sm mb-2">累计积分</Text>
            <Text className="block text-white text-3xl font-bold">
              {totalPoints}
            </Text>
          </View>
          <View className="w-px bg-white/20 mx-4"></View>
          <View className="flex-1 text-center">
            <Text className="block text-white/80 text-sm mb-2">订单数量</Text>
            <Text className="block text-white text-3xl font-bold">
              {orders.length}
            </Text>
          </View>
        </View>
      </View>

      {/* 订单列表 */}
      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-2xl mb-2">📋</Text>
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🛒</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无购买记录</Text>
          <Text className="block text-sm text-gray-400">购买商品后将显示在此处</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {orders.map((order, index) => (
            <View
              key={order.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              {/* 订单头部 */}
              <View className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                <View className="flex-1">
                  <View className="flex items-center mb-1">
                    <Text className="block text-base font-semibold text-gray-800">
                      {getProductName(order.productId)}
                    </Text>
                  </View>
                  <Text className="block text-xs text-gray-400">
                    订单号: {order.id.slice(0, 8)}...
                  </Text>
                </View>
                <View className="ml-3 text-right">
                  <Text className="block text-xs text-gray-400 mb-1">
                    {formatDate(order.createdAt)}
                  </Text>
                  <Text className="block text-xs text-blue-500">
                    第 {orders.length - index} 单
                  </Text>
                </View>
              </View>

              {/* 订单详情 */}
              <View className="flex justify-between items-center">
                <View>
                  <View className="flex items-center mb-1">
                    <Text className="block text-xs text-gray-500">消费金额:</Text>
                    <Text className="block text-lg font-bold text-gray-800 ml-2">
                      ¥{parseFloat(order.amount).toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex items-center">
                    <Text className="block text-xs text-gray-500">获得积分:</Text>
                    <Text className="block text-lg font-bold text-orange-500 ml-2">
                      +{order.pointsEarned}
                    </Text>
                  </View>
                </View>
                <View className="bg-orange-50 rounded-lg px-3 py-2">
                  <Text className="block text-xs text-orange-600 font-semibold">
                    已完成
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
