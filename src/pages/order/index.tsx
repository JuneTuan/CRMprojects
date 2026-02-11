import { View, Text, Input, Button, Picker } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    amount: '',
    quantity: 1
  })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/order',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setOrders(res.data.data || [])
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await Network.request({
        url: '/api/customer',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setCustomers(res.data.data || [])
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
    }
  }

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

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
    fetchProducts()
  }, [])

  const handleAdd = () => {
    setFormData({
      customerId: customers.length > 0 ? customers[0].id : '',
      productId: products.length > 0 ? products[0].id : '',
      amount: '',
      quantity: 1
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!formData.customerId) {
      Taro.showToast({ title: '请选择客户', icon: 'none' })
      return
    }
    if (!formData.productId) {
      Taro.showToast({ title: '请选择产品', icon: 'none' })
      return
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Taro.showToast({ title: '请输入正确的金额', icon: 'none' })
      return
    }

    try {
      await Network.request({
        url: '/api/order',
        method: 'POST',
        data: {
          ...formData,
          pointsEarned: Math.floor(parseFloat(formData.amount))
        }
      })
      Taro.showToast({ title: '创建成功', icon: 'success' })
      setShowForm(false)
      fetchOrders()
    } catch (error) {
      Taro.showToast({ title: '创建失败', icon: 'none' })
    }
  }

  const handleCustomerChange = (e: any) => {
    setFormData({ ...formData, customerId: customers[e.detail.value].id })
  }

  const handleProductChange = (e: any) => {
    setFormData({ ...formData, productId: products[e.detail.value].id })
  }

  if (showForm) {
    return (
      <View className="order-page min-h-screen bg-gray-50 p-4 pb-20">
        <View className="flex items-center mb-4">
          <Button onClick={() => setShowForm(false)} size="mini">返回</Button>
          <Text className="ml-4 text-xl font-bold text-gray-800">新增订单</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">选择客户 *</Text>
            {customers.length > 0 ? (
              <Picker
                mode="selector"
                range={customers.map((c: any) => c.name)}
                value={customers.findIndex((c: any) => c.id === formData.customerId)}
                onChange={handleCustomerChange}
              >
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Text className="block">
                    {customers.find((c: any) => c.id === formData.customerId)?.name || '请选择客户'}
                  </Text>
                </View>
              </Picker>
            ) : (
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-gray-400">暂无客户，请先添加客户</Text>
              </View>
            )}
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">选择产品 *</Text>
            {products.length > 0 ? (
              <Picker
                mode="selector"
                range={products.map((p: any) => `${p.name} (¥${p.price})`)}
                value={products.findIndex((p: any) => p.id === formData.productId)}
                onChange={handleProductChange}
              >
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Text className="block">
                    {products.find((p: any) => p.id === formData.productId)?.name || '请选择产品'}
                  </Text>
                </View>
              </Picker>
            ) : (
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-gray-400">暂无产品，请先添加产品</Text>
              </View>
            )}
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">订单金额 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="digit"
                placeholder="请输入订单金额"
                value={formData.amount}
                onInput={(e) => setFormData({ ...formData, amount: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">获得积分</Text>
            <View className="bg-orange-50 rounded-xl px-4 py-3">
              <Text className="text-orange-600 font-semibold">
                {formData.amount ? Math.floor(parseFloat(formData.amount)) : 0} 积分
              </Text>
            </View>
          </View>

          <Button
            className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold"
            onClick={handleSubmit}
          >
            创建订单
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="order-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">订单管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAdd}
        >
          新增订单
        </Button>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">📝</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无订单</Text>
          <Text className="block text-sm text-gray-400">点击上方按钮创建订单</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {orders.map((order) => (
            <View key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex justify-between items-start">
                <View className="flex-1">
                  <Text className="block text-base font-semibold text-gray-800 mb-1">
                    订单 #{order.id.slice(0, 8)}
                  </Text>
                  <Text className="block text-sm text-gray-500 mb-1">
                    客户: {order.customerId}
                  </Text>
                  <Text className="block text-sm text-gray-500 mb-1">
                    产品: {order.productId}
                  </Text>
                  <Text className="block text-lg text-orange-500 font-semibold mb-1">
                    ¥{order.amount}
                  </Text>
                  <Text className="block text-xs text-orange-400">
                    获得积分: {order.pointsEarned}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                </Text>
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
