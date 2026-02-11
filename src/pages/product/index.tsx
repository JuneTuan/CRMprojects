import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isActive: true
  })

  const fetchProducts = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAdd = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      isActive: true
    })
    setShowForm(true)
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      isActive: product.isActive
    })
    setShowForm(true)
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await Network.request({
        url: `/api/product/${id}`,
        method: 'PUT',
        data: { isActive: !isActive }
      })
      Taro.showToast({ title: isActive ? '已下架' : '已上架', icon: 'success' })
      fetchProducts()
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleDelete = async (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该产品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/product/${id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchProducts()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入产品名称', icon: 'none' })
      return
    }
    if (!formData.price) {
      Taro.showToast({ title: '请输入产品价格', icon: 'none' })
      return
    }

    try {
      if (editingProduct) {
        await Network.request({
          url: `/api/product/${editingProduct.id}`,
          method: 'PUT',
          data: formData
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await Network.request({
          url: '/api/product',
          method: 'POST',
          data: formData
        })
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }
      setShowForm(false)
      fetchProducts()
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  if (showForm) {
    return (
      <View className="product-page min-h-screen bg-gray-50 p-4">
        <View className="flex items-center mb-4">
          <Button onClick={() => setShowForm(false)} size="mini">返回</Button>
          <Text className="ml-4 text-xl font-bold text-gray-800">
            {editingProduct ? '编辑产品' : '新增产品'}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">产品名称 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入产品名称"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">产品描述</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入产品描述"
                value={formData.description}
                onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">产品价格 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="digit"
                placeholder="请输入产品价格"
                value={formData.price}
                onInput={(e) => setFormData({ ...formData, price: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">状态</Text>
            <View
              className={`rounded-xl px-4 py-3 ${formData.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
            >
              <Text className="block">{formData.isActive ? '✓ 已上架' : '✗ 已下架'}</Text>
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
    <View className="product-page min-h-screen bg-gray-50 p-4">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">产品管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAdd}
        >
          新增产品
        </Button>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : products.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">📦</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无产品</Text>
          <Text className="block text-sm text-gray-400">点击上方按钮添加产品</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {products.map((product) => (
            <View key={product.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex justify-between items-start">
                <View className="flex-1">
                  <Text className="block text-base font-semibold text-gray-800 mb-1">
                    {product.name}
                  </Text>
                  {product.description && (
                    <Text className="block text-sm text-gray-500 mb-1">
                      {product.description}
                    </Text>
                  )}
                  <Text className="block text-lg text-orange-500 font-semibold mb-1">
                    ¥{product.price}
                  </Text>
                  <Text className={`text-xs ${product.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                    {product.isActive ? '已上架' : '已下架'}
                  </Text>
                </View>
                <View className="flex flex-col gap-2 ml-4">
                  <Button
                    size="mini"
                    type={product.isActive ? 'warn' : 'primary'}
                    onClick={() => handleToggleStatus(product.id, product.isActive)}
                  >
                    {product.isActive ? '下架' : '上架'}
                  </Button>
                  <Button size="mini" onClick={() => handleEdit(product)}>编辑</Button>
                  <Button size="mini" onClick={() => handleDelete(product.id)}>删除</Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
