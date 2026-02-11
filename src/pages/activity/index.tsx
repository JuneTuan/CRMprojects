import { View, Text, Button, Input } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [gameTypes, setGameTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameType: 'wheel',
    durationDays: '7', // 活动天数，默认7天
    status: 'active', // 默认状态为活动中
    dailyFreeDraws: '3',
    pointsEnabled: false,
    pointsPerDraw: '10',
    imageUrl: ''
  })

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/activity',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setActivities(res.data.data || [])
      }
    } catch (error) {
      console.error('获取活动列表失败:', error)
      Taro.showToast({ title: '获取活动列表失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const fetchGameTypes = async () => {
    try {
      const res = await Network.request({
        url: '/api/activity/game-types',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setGameTypes(res.data.data || [])
      }
    } catch (error) {
      console.error('获取游戏类型失败:', error)
    }
  }

  useEffect(() => {
    fetchActivities()
    fetchGameTypes()
  }, [])

  const handleAdd = () => {
    setEditingActivity(null)
    setFormData({
      name: '',
      description: '',
      gameType: 'wheel',
      durationDays: '7', // 默认7天
      status: 'active', // 默认状态为活动中
      dailyFreeDraws: '3',
      pointsEnabled: false,
      pointsPerDraw: '10',
      imageUrl: ''
    })
    setShowForm(true)
  }

  const handleEdit = (activity: any) => {
    const startTime = new Date(activity.startTime)
    const endTime = new Date(activity.endTime)
    const durationDays = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24))

    setEditingActivity(activity)
    setFormData({
      name: activity.name,
      description: activity.description || '',
      gameType: activity.gameType,
      durationDays: String(durationDays || 7),
      status: activity.status,
      dailyFreeDraws: String(activity.dailyFreeDraws || 3),
      pointsEnabled: activity.pointsEnabled || false,
      pointsPerDraw: String(activity.pointsPerDraw || 10),
      imageUrl: activity.imageUrl || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入活动名称', icon: 'none' })
      return
    }
    if (!formData.gameType) {
      Taro.showToast({ title: '请选择游戏类型', icon: 'none' })
      return
    }
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
      Taro.showToast({ title: '请输入有效的活动天数', icon: 'none' })
      return
    }

    // 自动计算开始时间和结束时间
    const startTime = new Date()
    const endTime = new Date()
    endTime.setDate(endTime.getDate() + parseInt(formData.durationDays))

    // 只传递后端需要的字段，排除 durationDays
    const { durationDays, ...baseData } = formData
    const submitData = {
      ...baseData,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    }

    try {
      if (editingActivity) {
        // 更新活动
        await Network.request({
          url: `/api/activity/${editingActivity.id}`,
          method: 'PUT',
          data: submitData
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        // 创建活动
        await Network.request({
          url: '/api/activity',
          method: 'POST',
          data: submitData
        })
        Taro.showToast({ title: '创建成功', icon: 'success' })
      }
      setShowForm(false)
      fetchActivities()
    } catch (error: any) {
      Taro.showToast({ title: error.message || '操作失败', icon: 'none' })
    }
  }

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该活动吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/activity/${id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchActivities()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const toggleActivityStatus = async (activity: any) => {
    const newStatus = activity.status === 'active' ? 'paused' : 'active'

    // 如果要启用活动，需要检测冲突
    if (newStatus === 'active') {
      // 检查是否有其他活动是 active 状态
      const otherActiveActivities = activities.filter(
        a => a.id !== activity.id && a.status === 'active'
      )

      if (otherActiveActivities.length > 0) {
        // 先禁用其他 active 活动
        for (const otherActivity of otherActiveActivities) {
          await Network.request({
            url: `/api/activity/${otherActivity.id}`,
            method: 'PUT',
            data: { ...otherActivity, status: 'paused' }
          })
        }

        // 显示提示
        Taro.showModal({
          title: '活动冲突检测',
          content: `已自动禁用 ${otherActiveActivities.length} 个其他活动`,
          showCancel: false
        })
      }
    }

    try {
      await Network.request({
        url: `/api/activity/${activity.id}`,
        method: 'PUT',
        data: { ...activity, status: newStatus }
      })
      Taro.showToast({
        title: newStatus === 'active' ? '已启用' : '已禁用',
        icon: 'success'
      })
      fetchActivities()
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const getGameTypeName = (gameType: string) => {
    const type = gameTypes.find(t => t.value === gameType)
    return type ? `${type.icon} ${type.label}` : gameType
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      active: '活动中',
      paused: '暂停',
      ended: '已结束'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      active: 'bg-green-100 text-green-600',
      paused: 'bg-yellow-100 text-yellow-600',
      ended: 'bg-red-100 text-red-600'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-600'
  }

  return (
    <View className="activity-page min-h-screen bg-gray-50 p-4 pb-20">
      {!showForm ? (
        <>
          {/* 页面标题 */}
          <View className="flex justify-between items-center mb-4">
            <Text className="block text-xl font-bold text-gray-800">活动管理</Text>
            <Button
              className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
              onClick={handleAdd}
            >
              新建活动
            </Button>
          </View>

          {/* 活动列表 */}
          {loading ? (
            <View className="flex flex-col items-center justify-center py-16">
              <Text className="block text-sm text-gray-500">加载中...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-16">
              <Text className="block text-6xl mb-4">🎪</Text>
              <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无活动</Text>
              <Text className="block text-sm text-gray-400">点击上方按钮创建新活动</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {activities.map((activity) => (
                <View
                  key={activity.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <View className="flex justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="block text-base font-semibold text-gray-800 mb-1">
                        {activity.name}
                      </Text>
                      <Text className="block text-xs text-gray-500 mb-1">
                        {getGameTypeName(activity.gameType)}
                      </Text>
                      {activity.description && (
                        <Text className="block text-xs text-gray-400">
                          {activity.description}
                        </Text>
                      )}
                    </View>
                    <View className={`px-3 py-1 rounded-lg ${getStatusColor(activity.status)}`}>
                      <Text className="block text-xs font-semibold">
                        {getStatusText(activity.status)}
                      </Text>
                    </View>
                  </View>

                  {/* 活动时间范围 */}
                  <View className="bg-gray-50 rounded-lg p-2 mb-2">
                    <Text className="block text-xs text-gray-500">
                      📅 {new Date(activity.startTime).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} 至 {new Date(activity.endTime).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {/* 活动配置 */}
                  <View className="flex gap-2 mb-2">
                    <Text className="block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      🎁 免费 {activity.dailyFreeDraws} 次/天
                    </Text>
                    {activity.pointsEnabled && (
                      <Text className="block text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        💎 {activity.pointsPerDraw} 积分/次
                      </Text>
                    )}
                  </View>

                  <View className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <Text className="block text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                    <View className="flex gap-2">
                      <Button
                        size="mini"
                        type={activity.status === 'active' ? 'warn' : 'primary'}
                        onClick={() => toggleActivityStatus(activity)}
                      >
                        {activity.status === 'active' ? '禁用' : '启用'}
                      </Button>
                      <Button
                        size="mini"
                        type="default"
                        onClick={() => handleEdit(activity)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="mini"
                        type="default"
                        onClick={() => handleDelete(activity.id)}
                      >
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
        </>
      ) : (
        /* 活动表单 */
        <View>
          <View className="flex justify-between items-center mb-4">
            <Text className="block text-xl font-bold text-gray-800">
              {editingActivity ? '编辑活动' : '新建活动'}
            </Text>
            <Button
              className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm"
              onClick={() => setShowForm(false)}
            >
              取消
            </Button>
          </View>

          <View className="bg-white rounded-xl p-4 space-y-4">
            {/* 活动名称 */}
            <View>
              <Text className="block text-sm font-semibold text-gray-800 mb-2">活动名称 *</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent"
                  placeholder="请输入活动名称"
                  value={formData.name}
                  onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                />
              </View>
            </View>

            {/* 游戏类型 */}
            <View>
              <Text className="block text-sm font-semibold text-gray-800 mb-2">游戏类型 *</Text>
              <View className="grid grid-cols-3 gap-2">
                {gameTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`p-3 rounded-lg border-2 ${
                      formData.gameType === type.value ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    onClick={() => setFormData({ ...formData, gameType: type.value })}
                  >
                    <Text className="block text-2xl text-center">
                      {type.icon}
                    </Text>
                    <Text
                      className={`block text-xs text-center mt-1 ${
                        formData.gameType === type.value ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </button>
                ))}
              </View>
            </View>

            {/* 活动描述 */}
            <View>
              <Text className="block text-sm font-semibold text-gray-800 mb-2">活动描述</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent"
                  placeholder="请输入活动描述"
                  value={formData.description}
                  onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
                />
              </View>
            </View>

            {/* 活动天数 */}
            <View>
              <Text className="block text-sm font-semibold text-gray-800 mb-2">活动天数 *</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Text className="block text-xs text-gray-500 mb-1">活动持续天数（自动从当前时间开始）</Text>
                <Input
                  className="w-full bg-transparent"
                  type="number"
                  placeholder="请输入活动天数"
                  value={formData.durationDays}
                  onInput={(e) => setFormData({ ...formData, durationDays: e.detail.value })}
                />
              </View>
            </View>

            {/* 活动状态 */}
            <View>
              <Text className="block text-sm font-semibold text-gray-800 mb-2">活动状态</Text>
              <View className="flex gap-2">
                {['draft', 'active', 'paused', 'ended'].map((status) => (
                  <View key={status} style={{ flex: 1 }}>
                    <button
                      className={`w-full py-2 rounded-lg text-xs font-bold ${
                        formData.status === status
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setFormData({ ...formData, status })}
                    >
                      {getStatusText(status)}
                    </button>
                  </View>
                ))}
              </View>
            </View>

            {/* 每日免费次数 */}
            <View>
              <Text className="block text-sm font-semibold text-gray-800 mb-2">每日免费次数</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent"
                  type="number"
                  placeholder="请输入每日免费次数"
                  value={formData.dailyFreeDraws}
                  onInput={(e) => setFormData({ ...formData, dailyFreeDraws: e.detail.value })}
                />
              </View>
            </View>

            {/* 积分抽奖 */}
            <View>
              <Text className="block text-sm font-semibold text-gray-800 mb-2">积分抽奖</Text>
              <View className="flex items-center justify-between">
                <Text className="block text-sm text-gray-600">启用积分抽奖</Text>
                <button
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    formData.pointsEnabled ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, pointsEnabled: !formData.pointsEnabled })}
                >
                  <View
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.pointsEnabled ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </View>
            </View>

            {formData.pointsEnabled && (
              <View>
                <Text className="block text-sm font-semibold text-gray-800 mb-2">每次消耗积分</Text>
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Input
                    className="w-full bg-transparent"
                    type="number"
                    placeholder="请输入消耗积分"
                    value={formData.pointsPerDraw}
                    onInput={(e) => setFormData({ ...formData, pointsPerDraw: e.detail.value })}
                  />
                </View>
              </View>
            )}

            {/* 提交按钮 */}
            <Button
              className="w-full bg-red-600 text-white rounded-lg py-3 mt-4"
              onClick={handleSubmit}
            >
              {editingActivity ? '更新活动' : '创建活动'}
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}
