import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function PrizePage() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPrize, setEditingPrize] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'coupon',
    value: '',
    probability: 10,
    totalQuantity: 100,
    remainingQuantity: 100
  })

  const fetchPrizes = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/prize',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setPrizes(res.data.data || [])
      }
    } catch (error) {
      console.error('获取奖品列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrizes()
  }, [])

  const handleAdd = () => {
    setEditingPrize(null)
    setFormData({
      name: '',
      type: 'coupon',
      value: '',
      probability: 10,
      totalQuantity: 100,
      remainingQuantity: 100
    })
    setShowForm(true)
  }

  const handleEdit = (prize: any) => {
    setEditingPrize(prize)
    setFormData({
      name: prize.name,
      type: prize.type,
      value: prize.value || '',
      probability: prize.probability,
      totalQuantity: prize.totalQuantity,
      remainingQuantity: prize.remainingQuantity
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该奖品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/prize/${id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchPrizes()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入奖品名称', icon: 'none' })
      return
    }
    if (formData.probability < 0 || formData.probability > 100) {
      Taro.showToast({ title: '概率必须在0-100之间', icon: 'none' })
      return
    }

    try {
      if (editingPrize) {
        await Network.request({
          url: `/api/prize/${editingPrize.id}`,
          method: 'PUT',
          data: formData
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await Network.request({
          url: '/api/prize',
          method: 'POST',
          data: formData
        })
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }
      setShowForm(false)
      fetchPrizes()
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coupon':
        return '🎫'
      case 'redpacket':
        return '🧧'
      case 'item':
        return '🎁'
      default:
        return '🎁'
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'coupon':
        return '优惠券'
      case 'redpacket':
        return '红包'
      case 'item':
        return '实物'
      default:
        return '未知'
    }
  }

  if (showForm) {
    return (
      <View className="prize-page min-h-screen bg-gray-50 p-4">
        <View className="flex items-center mb-4">
          <Button onClick={() => setShowForm(false)} size="mini">返回</Button>
          <Text className="ml-4 text-xl font-bold text-gray-800">
            {editingPrize ? '编辑奖品' : '新增奖品'}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">奖品名称 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入奖品名称"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">奖品类型 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="coupon（优惠券）/ redpacket（红包）/ item（实物）"
                value={formData.type}
                onInput={(e) => setFormData({ ...formData, type: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">奖品值</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="如：10元优惠、100元红包"
                value={formData.value}
                onInput={(e) => setFormData({ ...formData, value: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">中奖概率 (%) *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="number"
                placeholder="0-100之间的数字"
                value={formData.probability.toString()}
                onInput={(e) => setFormData({ ...formData, probability: parseInt(e.detail.value) || 0 })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">总数量 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="number"
                placeholder="奖品总数量"
                value={formData.totalQuantity.toString()}
                onInput={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.detail.value) || 0 })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">剩余数量 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="number"
                placeholder="剩余奖品数量"
                value={formData.remainingQuantity.toString()}
                onInput={(e) => setFormData({ ...formData, remainingQuantity: parseInt(e.detail.value) || 0 })}
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
    <View className="prize-page min-h-screen bg-gray-50 p-4">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">奖品管理</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleAdd}
        >
          新增奖品
        </Button>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : prizes.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🎁</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无奖品</Text>
          <Text className="block text-sm text-gray-400">点击上方按钮添加奖品</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {prizes.map((prize) => (
            <View key={prize.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex justify-between items-start">
                <View className="flex-1">
                  <View className="flex items-center mb-2">
                    <Text className="text-2xl mr-2">{getTypeIcon(prize.type)}</Text>
                    <Text className="text-base font-semibold text-gray-800">{prize.name}</Text>
                  </View>
                  <Text className="block text-sm text-gray-500 mb-1">
                    类型: {getTypeName(prize.type)}
                  </Text>
                  {prize.value && (
                    <Text className="block text-sm text-gray-500 mb-1">
                      奖品值: {prize.value}
                    </Text>
                  )}
                  <Text className="block text-sm text-orange-500 font-semibold mb-1">
                    概率: {prize.probability}%
                  </Text>
                  <Text className="block text-xs text-gray-400">
                    数量: {prize.remainingQuantity} / {prize.totalQuantity}
                  </Text>
                </View>
                <View className="flex flex-col gap-2 ml-4">
                  <Button size="mini" onClick={() => handleEdit(prize)}>编辑</Button>
                  <Button size="mini" onClick={() => handleDelete(prize.id)}>删除</Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
