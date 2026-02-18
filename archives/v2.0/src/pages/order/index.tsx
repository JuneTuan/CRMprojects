import { View, Text, Input, Button, Picker, Checkbox } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    amount: '',
    quantity: 1
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBatchActions, setShowBatchActions] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/order',
        method: 'GET'
      })
      if (res.data.code === 200) {
        const ordersData = res.data.data || []
        setOrders(ordersData)
        setFilteredOrders(ordersData)
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    if (!keyword.trim()) {
      setFilteredOrders(orders)
      return
    }

    const filtered = orders.filter(order => {
      const idMatch = order.id?.toLowerCase().includes(keyword.toLowerCase())
      const customerMatch = customers.find(c => c.id === order.customerId)?.name?.toLowerCase().includes(keyword.toLowerCase())
      const productMatch = products.find(p => p.id === order.productId)?.name?.toLowerCase().includes(keyword.toLowerCase())
      return idMatch || customerMatch || productMatch
    })
    setFilteredOrders(filtered)
  }

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      setShowBatchActions(newSet.size > 0)
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
      setShowBatchActions(false)
    } else {
      const allIds = new Set(filteredOrders.map(o => o.id))
      setSelectedIds(allIds)
      setShowBatchActions(true)
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return

    Taro.showModal({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedIds.size} 个订单吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const deletePromises = Array.from(selectedIds).map(id =>
              Network.request({
                url: `/api/order/${id}`,
                method: 'DELETE'
              })
            )
            await Promise.all(deletePromises)
            Taro.showToast({ title: '批量删除成功', icon: 'success' })
            setSelectedIds(new Set())
            setShowBatchActions(false)
            fetchOrders()
          } catch (error) {
            Taro.showToast({ title: '批量删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleBatchUpdateStatus = (status: string) => {
    if (selectedIds.size === 0) return

    Taro.showModal({
      title: '确认批量修改状态',
      content: `确定要将选中的 ${selectedIds.size} 个订单状态修改为${status === 'completed' ? '已完成' : '待处理'}吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const updatePromises = Array.from(selectedIds).map(id =>
              Network.request({
                url: `/api/order/${id}`,
                method: 'PUT',
                data: { status }
              })
            )
            await Promise.all(updatePromises)
            Taro.showToast({ title: '批量修改成功', icon: 'success' })
            setSelectedIds(new Set())
            setShowBatchActions(false)
            fetchOrders()
          } catch (error) {
            Taro.showToast({ title: '批量修改失败', icon: 'none' })
          }
        }
      }
    })
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
    setEditingOrder(null)
    setFormData({
      customerId: customers.length > 0 ? customers[0].id : '',
      productId: products.length > 0 ? products[0].id : '',
      amount: '',
      quantity: 1
    })
    setShowForm(true)
  }

  const handleEdit = (order: any) => {
    setEditingOrder(order)
    setFormData({
      customerId: order.customerId,
      productId: order.productId,
      amount: String(order.amount),
      quantity: order.quantity || 1
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/order/${id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchOrders()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
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
      const orderData = {
        customerId: formData.customerId,
        productId: formData.productId,
        quantity: formData.quantity,
        totalPrice: parseFloat(formData.amount)
      }

      if (editingOrder) {
        // 更新订单
        await Network.request({
          url: `/api/order/${editingOrder.id}`,
          method: 'PUT',
          data: orderData
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        // 创建订单
        await Network.request({
          url: '/api/order',
          method: 'POST',
          data: orderData
        })
        Taro.showToast({ title: '创建成功', icon: 'success' })
      }
      setShowForm(false)
      fetchOrders()
    } catch (error) {
      Taro.showToast({ title: editingOrder ? '更新失败' : '创建失败', icon: 'none' })
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
          <Text className="ml-4 text-xl font-bold text-gray-800">{editingOrder ? '编辑订单' : '新增订单'}</Text>
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
            {editingOrder ? '更新订单' : '创建订单'}
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

      <View className="bg-white rounded-xl px-5 py-4 mb-4 shadow-sm">
        <Input
          className="w-full bg-transparent text-base outline-none"
          placeholder="搜索订单号、客户或产品"
          value={searchKeyword}
          onInput={(e) => handleSearch(e.detail.value)}
        />
      </View>

      {showBatchActions && (
        <View className="bg-red-50 rounded-xl px-5 py-4 mb-4 flex justify-between items-center">
          <Text className="text-base text-red-600">已选择 {selectedIds.size} 个订单</Text>
          <View className="flex gap-2 flex-wrap">
            <Button
              className="bg-white text-red-600 border border-red-600 rounded-lg px-3 py-2 text-sm"
              onClick={() => {
                setSelectedIds(new Set())
                setShowBatchActions(false)
              }}
            >
              取消选择
            </Button>
            <Button
              className="bg-green-600 text-white rounded-lg px-3 py-2 text-sm"
              onClick={() => handleBatchUpdateStatus('completed')}
            >
              标记完成
            </Button>
            <Button
              className="bg-yellow-600 text-white rounded-lg px-3 py-2 text-sm"
              onClick={() => handleBatchUpdateStatus('pending')}
            >
              标记待处理
            </Button>
            <Button
              className="bg-red-600 text-white rounded-lg px-3 py-2 text-sm"
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
          </View>
        </View>
      )}

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">📝</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">
            {searchKeyword ? '未找到匹配的订单' : '暂无订单'}
          </Text>
          <Text className="block text-sm text-gray-400">
            {searchKeyword ? '请尝试其他关键词' : '点击上方按钮创建订单'}
          </Text>
        </View>
      ) : (
        <View className="space-y-3">
          <View className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center">
            <Checkbox
              value="all"
              checked={selectedIds.size === filteredOrders.length}
              onClick={handleSelectAll}
            />
            <Text className="ml-3 text-base text-gray-600">全选</Text>
          </View>
          {filteredOrders.map((order) => (
            <View key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex justify-between items-start">
                <View className="flex items-start flex-1">
                  <Checkbox
                    value={order.id}
                    checked={selectedIds.has(order.id)}
                    onClick={() => handleSelect(order.id)}
                  />
                  <View className="ml-4 flex-1">
                    <Text className="block text-base font-semibold text-gray-800 mb-1">
                      订单 #{order.id.slice(0, 8)}
                    </Text>
                    <Text className="block text-sm text-gray-500 mb-1">
                      客户: {customers.find(c => c.id === order.customerId)?.name || order.customerId}
                    </Text>
                    <Text className="block text-sm text-gray-500 mb-1">
                      产品: {products.find(p => p.id === order.productId)?.name || order.productId}
                    </Text>
                    <Text className="block text-lg text-orange-500 font-semibold mb-1">
                      ¥{order.totalPrice}
                    </Text>
                    <Text className="block text-xs text-orange-400">
                      数量: {order.quantity}
                    </Text>
                  </View>
                </View>
                <View className="flex flex-col items-end gap-2">
                  <Text className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                  <View className="flex gap-2">
                    <Button
                      size="mini"
                      type="primary"
                      onClick={() => handleEdit(order)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="mini"
                      type="warn"
                      onClick={() => handleDelete(order.id)}
                    >
                      删除
                    </Button>
                  </View>
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
