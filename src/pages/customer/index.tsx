import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function CustomerPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' })

  const fetchCustomers = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleAdd = () => {
    setEditingCustomer(null)
    setFormData({ name: '', phone: '', address: '' })
    setShowForm(true)
  }

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer)
    setFormData({ name: customer.name, phone: customer.phone, address: customer.address })
    setShowForm(true)
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

  if (showForm) {
    return (
      <View className="customer-page min-h-screen bg-gray-50 p-4">
        <View className="flex items-center mb-4">
          <Button onClick={() => setShowForm(false)} size="mini">返回</Button>
          <Text className="ml-4 text-xl font-bold text-gray-800">
            {editingCustomer ? '编辑客户' : '新增客户'}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">客户名称 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入客户名称"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">联系电话</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入联系电话"
                value={formData.phone}
                onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">地址</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入地址"
                value={formData.address}
                onInput={(e) => setFormData({ ...formData, address: e.detail.value })}
              />
            </View>
          </View>

          <Button
            className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold"
            onClick={handleSubmit}
          >
            保存
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="customer-page min-h-screen bg-gray-50 p-4">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">客户管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAdd}
        >
          新增客户
        </Button>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : customers.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">👥</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无客户</Text>
          <Text className="block text-sm text-gray-400">点击上方按钮添加客户</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {customers.map((customer) => (
            <View key={customer.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex justify-between items-start">
                <View>
                  <Text className="block text-base font-semibold text-gray-800 mb-1">{customer.name}</Text>
                  <Text className="block text-sm text-gray-500">{customer.phone || '无电话'}</Text>
                  <Text className="block text-xs text-gray-400 mt-1">{customer.address || '无地址'}</Text>
                </View>
                <View className="flex flex-col items-end">
                  <Text className="text-sm text-orange-500 font-semibold">积分: {customer.points}</Text>
                  <View className="mt-2 flex gap-2">
                    <Button size="mini" onClick={() => handleEdit(customer)}>编辑</Button>
                    <Button size="mini" onClick={() => handleDelete(customer.id)}>删除</Button>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
