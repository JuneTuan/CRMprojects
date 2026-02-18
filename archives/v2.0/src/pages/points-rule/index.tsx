import { View, Text, Input, Button } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function PointsRulePage() {
  const [rules, setRules] = useState<any[]>([])
  const [activeRule, setActiveRule] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    pointsPerAmount: '1',
    minAmount: '0',
    maxPoints: '',
    description: '',
    isActive: true
  })

  const fetchRules = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/points-rule',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setRules(res.data.data || [])
      }
    } catch (error) {
      console.error('获取积分规则列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveRule = async () => {
    try {
      const res = await Network.request({
        url: '/api/points-rule/active',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setActiveRule(res.data.data)
      }
    } catch (error) {
      console.error('获取活动规则失败:', error)
    }
  }

  useEffect(() => {
    fetchRules()
    fetchActiveRule()
  }, [])

  const handleAdd = () => {
    setEditingRule(null)
    setFormData({
      name: '',
      pointsPerAmount: '1',
      minAmount: '0',
      maxPoints: '',
      description: '',
      isActive: true
    })
    setShowForm(true)
  }

  const handleEdit = (rule: any) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      pointsPerAmount: rule.pointsPerAmount || 1,
      minAmount: rule.minAmount || '0',
      maxPoints: rule.maxPoints || '',
      description: rule.description || '',
      isActive: rule.isActive !== undefined ? rule.isActive : true
    })
    setShowForm(true)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      // 如果要启用当前规则，需要先禁用其他规则
      if (!isActive) {
        const res = await Network.request({
          url: `/api/points-rule/${id}`,
          method: 'PUT',
          data: { isActive: !isActive }
        })
        if (res.data.code === 200) {
          Taro.showToast({ title: '已启用', icon: 'success' })
          fetchRules()
          fetchActiveRule()
        }
      } else {
        // 要禁用当前规则
        Taro.showModal({
          title: '确认禁用',
          content: '确定要禁用该积分规则吗？',
          success: async (res) => {
            if (res.confirm) {
              const response = await Network.request({
                url: `/api/points-rule/${id}`,
                method: 'PUT',
                data: { isActive: false }
              })
              if (response.data.code === 200) {
                Taro.showToast({ title: '已禁用', icon: 'success' })
                fetchRules()
                fetchActiveRule()
              }
            }
          }
        })
      }
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleDelete = async (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该积分规则吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/points-rule/${id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchRules()
            fetchActiveRule()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入规则名称', icon: 'none' })
      return
    }
    if (!formData.pointsPerAmount || parseInt(formData.pointsPerAmount) <= 0) {
      Taro.showToast({ title: '请输入正确的积分比例', icon: 'none' })
      return
    }

    try {
      // 如果要启用新规则，需要先禁用其他规则
      if (formData.isActive) {
        const res = await Network.request({
          url: '/api/points-rule',
          method: 'GET',
          data: { isActive: 'true' }
        })
        if (res.data.code === 200 && res.data.data.length > 0) {
          await Promise.all(
            res.data.data.map((rule: any) =>
              Network.request({
                url: `/api/points-rule/${rule.id}`,
                method: 'PUT',
                data: { isActive: false }
              })
            )
          )
        }
      }

      if (editingRule) {
        await Network.request({
          url: `/api/points-rule/${editingRule.id}`,
          method: 'PUT',
          data: formData
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await Network.request({
          url: '/api/points-rule',
          method: 'POST',
          data: formData
        })
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }
      setShowForm(false)
      fetchRules()
      fetchActiveRule()
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  if (showForm) {
    return (
      <View className="points-rule-page min-h-screen bg-gray-50 p-4">
        <View className="flex items-center mb-4">
          <Button onClick={() => setShowForm(false)} size="mini">返回</Button>
          <Text className="ml-4 text-xl font-bold text-gray-800">
            {editingRule ? '编辑积分规则' : '新增积分规则'}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">规则名称 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入规则名称"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">积分比例 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="number"
                placeholder="请输入积分比例"
                value={formData.pointsPerAmount}
                onInput={(e) => setFormData({ ...formData, pointsPerAmount: String(parseInt(e.detail.value) || 1) })}
              />
            </View>
            <Text className="block text-xs text-gray-500 mt-2">
              说明：消费1元获得的积分数量（如设置为10，则消费100元获得1000积分）
            </Text>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">最低消费金额</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="digit"
                placeholder="请输入最低消费金额"
                value={formData.minAmount}
                onInput={(e) => setFormData({ ...formData, minAmount: e.detail.value })}
              />
            </View>
            <Text className="block text-xs text-gray-500 mt-2">
              说明：订单金额低于此值时不获得积分
            </Text>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">单次最高积分</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                type="number"
                placeholder="留空表示不限制"
                value={formData.maxPoints}
                onInput={(e) => setFormData({ ...formData, maxPoints: e.detail.value })}
              />
            </View>
            <Text className="block text-xs text-gray-500 mt-2">
              说明：单次订单最高可获得的积分数，留空表示不限制
            </Text>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">规则说明</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入规则说明"
                value={formData.description}
                onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">启用状态</Text>
            <View
              className={`rounded-xl px-4 py-3 ${formData.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
            >
              <Text className="block">{formData.isActive ? '✓ 已启用' : '✗ 已禁用'}</Text>
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
    <View className="points-rule-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">积分规则管理</Text>
        <Button size="mini" onClick={handleAdd}>新增规则</Button>
      </View>

      {/* 当前活动规则 */}
      {activeRule && (
        <View className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 mb-6 shadow-lg">
          <Text className="block text-white/80 text-sm mb-2">当前生效规则</Text>
          <Text className="block text-white text-lg font-bold mb-2">{activeRule.name}</Text>
          <Text className="block text-white/80 text-sm">
            {activeRule.pointsPerAmount} 元 = {activeRule.pointsPerAmount} 积分
            {activeRule.minAmount && ` (最低消费 ¥${activeRule.minAmount})`}
            {activeRule.maxPoints && ` (最高 ${activeRule.maxPoints} 积分)`}
          </Text>
        </View>
      )}

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : rules.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">⚙️</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无积分规则</Text>
          <Text className="block text-sm text-gray-400">点击上方按钮创建规则</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {rules.map((rule) => (
            <View
              key={rule.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="flex justify-between items-start mb-2">
                <View className="flex-1">
                  <View className="flex items-center mb-2">
                    <Text className="block text-lg font-semibold text-gray-800">
                      {rule.name}
                    </Text>
                    {rule.isActive && (
                      <View className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                        <Text className="block">生效中</Text>
                      </View>
                    )}
                  </View>
                  <Text className="block text-sm text-gray-600 mb-1">
                    {rule.pointsPerAmount} 元 = {rule.pointsPerAmount} 积分
                  </Text>
                  {rule.minAmount && rule.minAmount !== '0.00' && (
                    <Text className="block text-xs text-gray-500 mb-1">
                      最低消费: ¥{rule.minAmount}
                    </Text>
                  )}
                  {rule.maxPoints && (
                    <Text className="block text-xs text-gray-500 mb-1">
                      单次最高: {rule.maxPoints} 积分
                    </Text>
                  )}
                  {rule.description && (
                    <Text className="block text-xs text-gray-500">
                      {rule.description}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <View style={{ flex: 1 }}>
                  <Button
                    size="mini"
                    onClick={() => handleToggleActive(rule.id, rule.isActive)}
                  >
                    {rule.isActive ? '禁用' : '启用'}
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button size="mini" onClick={() => handleEdit(rule)}>
                    编辑
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button size="mini" onClick={() => handleDelete(rule.id)}>
                    删除
                  </Button>
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
