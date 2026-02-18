import { View, Text, Input, Button, Checkbox } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'
import Skeleton from '@/components/Skeleton'
import { useResponsive, responsive } from '@/utils/responsive'

export default function CustomerPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', password: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBatchActions, setShowBatchActions] = useState(false)
  const { isMobile, breakpoint } = useResponsive()

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/customer',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setCustomers(res.data.data || [])
        setFilteredCustomers(res.data.data || [])
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    if (!keyword.trim()) {
      setFilteredCustomers(customers)
      return
    }

    const filtered = customers.filter(customer => {
      const nameMatch = customer.name?.toLowerCase().includes(keyword.toLowerCase())
      const phoneMatch = customer.phone?.toLowerCase().includes(keyword.toLowerCase())
      const addressMatch = customer.address?.toLowerCase().includes(keyword.toLowerCase())
      return nameMatch || phoneMatch || addressMatch
    })
    setFilteredCustomers(filtered)
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
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set())
      setShowBatchActions(false)
    } else {
      const allIds = new Set(filteredCustomers.map(c => c.id))
      setSelectedIds(allIds)
      setShowBatchActions(true)
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return

    Taro.showModal({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedIds.size} 个客户吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const deletePromises = Array.from(selectedIds).map(id =>
              Network.request({
                url: `/api/customer/${id}`,
                method: 'DELETE'
              })
            )
            await Promise.all(deletePromises)
            Taro.showToast({ title: '批量删除成功', icon: 'success' })
            setSelectedIds(new Set())
            setShowBatchActions(false)
            fetchCustomers()
          } catch (error) {
            Taro.showToast({ title: '批量删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const res = await Network.request({
        url: `/api/customer/${customerId}/orders`,
        method: 'GET'
      })
      if (res.data.code === 200) {
        setCustomerOrders(res.data.data || [])
      }
    } catch (error) {
      console.error('获取客户订单失败:', error)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleAdd = () => {
    setEditingCustomer(null)
    setFormData({ name: '', phone: '', address: '', password: '' })
    setShowForm(true)
  }

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer)
    setFormData({ name: customer.name, phone: customer.phone, address: customer.address || '', password: '' })
    setShowForm(true)
  }

  const handleViewOrders = (customer: any) => {
    setSelectedCustomer(customer)
    setShowOrders(true)
    fetchCustomerOrders(customer.id)
  }

  const handleChangePassword = (customer: any) => {
    setSelectedCustomer(customer)
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswordForm(true)
  }

  const handleDelete = async (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该客户吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/customer/${id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchCustomers()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入客户名称', icon: 'none' })
      return
    }

    if (formData.password && formData.password.length < 6) {
      Taro.showToast({ title: '密码至少6个字符', icon: 'none' })
      return
    }

    try {
      if (editingCustomer) {
        await Network.request({
          url: `/api/customer/${editingCustomer.id}`,
          method: 'PUT',
          data: formData
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await Network.request({
          url: '/api/customer',
          method: 'POST',
          data: formData
        })
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }
      setShowForm(false)
      fetchCustomers()
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handlePasswordSubmit = async () => {
    if (!passwordForm.newPassword) {
      Taro.showToast({ title: '请输入新密码', icon: 'none' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      Taro.showToast({ title: '密码至少6个字符', icon: 'none' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }

    try {
      await Network.request({
        url: `/api/customer/${selectedCustomer.id}/password`,
        method: 'PUT',
        data: passwordForm
      })
      Taro.showToast({ title: '密码修改成功', icon: 'success' })
      setShowPasswordForm(false)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '修改失败', icon: 'none' })
    }
  }

  if (showForm) {
    return (
      <View className="customer-page min-h-screen bg-gray-50 p-6 pb-20">
        <View className="flex items-center mb-6">
          <Button onClick={() => setShowForm(false)} size="mini">返回</Button>
          <Text className="ml-4 text-2xl font-bold text-gray-800">
            {editingCustomer ? '编辑客户' : '新增客户'}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-8 shadow-sm">
          <View className="mb-5">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">客户名称 *</Text>
            <View className="bg-gray-50 rounded-xl px-5 py-4">
              <Input
                className="w-full bg-transparent text-lg outline-none"
                placeholder="请输入客户名称"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">联系电话</Text>
            <View className="bg-gray-50 rounded-xl px-5 py-4">
              <Input
                className="w-full bg-transparent text-lg outline-none"
                placeholder="请输入联系电话"
                value={formData.phone}
                onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">地址</Text>
            <View className="bg-gray-50 rounded-xl px-5 py-4">
              <Input
                className="w-full bg-transparent text-lg outline-none"
                placeholder="请输入地址"
                value={formData.address}
                onInput={(e) => setFormData({ ...formData, address: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">登录密码</Text>
            <Text className="block text-sm text-gray-500 mb-3">设置后客户可登录系统（至少6个字符）</Text>
            <View className="bg-gray-50 rounded-xl px-5 py-4">
              <Input
                className="w-full bg-transparent text-lg outline-none"
                password
                placeholder="请输入登录密码（选填）"
                value={formData.password}
                onInput={(e) => setFormData({ ...formData, password: e.detail.value })}
              />
            </View>
          </View>

          <Button
            className="w-full bg-red-600 text-white rounded-xl py-4 text-lg font-semibold"
            onClick={handleSubmit}
          >
            保存
          </Button>
        </View>
      </View>
    )
  }

  if (showPasswordForm) {
    return (
      <View className="customer-page min-h-screen bg-gray-50 p-6 pb-20">
        <View className="flex items-center mb-6">
          <Button onClick={() => setShowPasswordForm(false)} size="mini">返回</Button>
          <Text className="ml-4 text-2xl font-bold text-gray-800">修改密码</Text>
        </View>

        <View className="bg-white rounded-2xl p-8 shadow-sm">
          <View className="mb-5">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">客户名称</Text>
            <Text className="block text-base text-gray-600">{selectedCustomer?.name}</Text>
          </View>

          <View className="mb-5">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">原密码</Text>
            <View className="bg-gray-50 rounded-xl px-5 py-4">
              <Input
                className="w-full bg-transparent text-lg outline-none"
                password
                placeholder="请输入原密码（如未设置可留空）"
                value={passwordForm.oldPassword}
                onInput={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">新密码 *</Text>
            <View className="bg-gray-50 rounded-xl px-5 py-4">
              <Input
                className="w-full bg-transparent text-lg outline-none"
                password
                placeholder="请输入新密码（至少6个字符）"
                value={passwordForm.newPassword}
                onInput={(e) => setPasswordForm({ ...passwordForm, newPassword: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="block text-lg font-semibold text-gray-800 mb-3">确认新密码 *</Text>
            <View className="bg-gray-50 rounded-xl px-5 py-4">
              <Input
                className="w-full bg-transparent text-lg outline-none"
                password
                placeholder="请再次输入新密码"
                value={passwordForm.confirmPassword}
                onInput={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.detail.value })}
              />
            </View>
          </View>

          <Button
            className="w-full bg-red-600 text-white rounded-xl py-4 text-lg font-semibold"
            onClick={handlePasswordSubmit}
          >
            修改密码
          </Button>
        </View>
      </View>
    )
  }

  if (showOrders) {
    return (
      <View className="customer-page min-h-screen bg-gray-50 p-6 pb-20">
        <View className="flex items-center mb-6">
          <Button onClick={() => setShowOrders(false)} size="mini">返回</Button>
          <Text className="ml-4 text-2xl font-bold text-gray-800">购买记录</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="block text-lg font-semibold text-gray-800">客户名称</Text>
          <Text className="block text-base text-gray-600">{selectedCustomer?.name}</Text>
          <Text className="block text-lg font-semibold text-gray-800 mt-3">联系电话</Text>
          <Text className="block text-base text-gray-600">{selectedCustomer?.phone || '无'}</Text>
        </View>

        {customerOrders.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <Text className="block text-7xl mb-6">📦</Text>
            <Text className="block text-xl font-semibold text-gray-600 mb-3">暂无购买记录</Text>
            <Text className="block text-base text-gray-400">该客户还没有购买过商品</Text>
          </View>
        ) : (
          <View className="space-y-4">
            {customerOrders.map((order) => (
              <View key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                <View className="flex justify-between items-start">
                  <View>
                    <Text className="block text-base font-semibold text-gray-800 mb-2">
                      订单号: {order.id.slice(-8)}
                    </Text>
                    <Text className="block text-sm text-gray-500">
                      数量: {order.quantity} | 总价: ¥{order.totalPrice}
                    </Text>
                    <Text className="block text-sm text-gray-400 mt-2">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </Text>
                  </View>
                  <View>
                    <Text className={`text-sm px-3 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-600' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status === 'completed' ? '已完成' :
                       order.status === 'pending' ? '待处理' : '已取消'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <View className={`customer-page min-h-screen bg-gray-50 pb-20 ${responsive.padding[breakpoint]}`}>
      <View className="flex justify-between items-center mb-6">
        <Text className={`${responsive.text['2xl']} font-bold text-gray-800`}>客户管理</Text>
        <Button
          className={`bg-red-600 text-white rounded-lg ${responsive.button[breakpoint]}`}
          onClick={handleAdd}
        >
          新增客户
        </Button>
      </View>

      <View className={`bg-white rounded-xl ${responsive.paddingX[breakpoint]} ${responsive.paddingY[breakpoint]} mb-6 shadow-sm`}>
        <Input
          className={`w-full bg-transparent ${responsive.text.md} outline-none`}
          placeholder="搜索客户名称、电话或地址"
          value={searchKeyword}
          onInput={(e) => handleSearch(e.detail.value)}
        />
      </View>

      {showBatchActions && (
        <View className="bg-red-50 rounded-xl px-5 py-4 mb-4 flex justify-between items-center">
          <Text className="text-base text-red-600">已选择 {selectedIds.size} 个客户</Text>
          <View className="flex gap-3">
            <Button
              className="bg-white text-red-600 border border-red-600 rounded-lg px-4 py-2 text-sm"
              onClick={() => {
                setSelectedIds(new Set())
                setShowBatchActions(false)
              }}
            >
              取消选择
            </Button>
            <Button
              className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
          </View>
        </View>
      )}

      {loading ? (
        <View className="space-y-4">
          <Skeleton type="card" count={3} />
        </View>
      ) : filteredCustomers.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-20">
          <Text className="block text-7xl mb-6">👤</Text>
          <Text className="block text-xl font-semibold text-gray-600 mb-3">
            {searchKeyword ? '未找到匹配的客户' : '暂无客户'}
          </Text>
          <Text className="block text-base text-gray-400">
            {searchKeyword ? '请尝试其他关键词' : '点击上方按钮添加客户'}
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          <View className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center">
            <Checkbox
              value="all"
              checked={selectedIds.size === filteredCustomers.length}
              onClick={handleSelectAll}
            />
            <Text className="ml-3 text-base text-gray-600">全选</Text>
          </View>
          {filteredCustomers.map((customer) => (
            <View key={customer.id} className="bg-white rounded-xl p-6 shadow-sm">
              <View className="flex justify-between items-start">
                <View className="flex items-start flex-1">
                  <Checkbox
                    value={customer.id}
                    checked={selectedIds.has(customer.id)}
                    onClick={() => handleSelect(customer.id)}
                  />
                  <View className="ml-4 flex-1">
                    <Text className="block text-lg font-semibold text-gray-800 mb-2">{customer.name}</Text>
                    <Text className="block text-base text-gray-500">{customer.phone || '无电话'}</Text>
                    <Text className="block text-sm text-gray-400 mt-1">{customer.address || '无地址'}</Text>
                    <Text className="block text-base text-orange-500 font-semibold mt-3">积分: {customer.points}</Text>
                  </View>
                </View>
                <View className="flex flex-col gap-2">
                  <Button size="mini" onClick={() => handleViewOrders(customer)}>购买记录</Button>
                  <Button size="mini" onClick={() => handleChangePassword(customer)}>修改密码</Button>
                  <Button size="mini" onClick={() => handleEdit(customer)}>编辑</Button>
                  <Button size="mini" onClick={() => handleDelete(customer.id)}>删除</Button>
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
