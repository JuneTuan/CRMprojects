import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

export default function LotteryRecordPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState<string>('')

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
          setCustomerId(customers[0].id)
          return customers[0]
        }
      }
    } catch (error) {
      console.error('获取客户信息失败:', error)
    }
    return null
  }

  // 获取中奖记录
  const fetchRecords = async (custId?: string) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/lottery/records',
        method: 'GET',
        data: custId ? { customerId: custId } : {}
      })
      if (res.data.code === 200) {
        setRecords(res.data.data || [])
      }
    } catch (error) {
      console.error('获取中奖记录失败:', error)
      Taro.showToast({ title: '获取中奖记录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const cust = await fetchCustomer()
      if (cust) {
        fetchRecords(cust.id)
      }
    }
    init()
  }, [])

  // 查看记录详情
  const handleViewDetail = (record: any) => {
    let detail = `抽奖记录\n\n`
    detail += `结果：${record.result}\n`
    detail += `状态：${record.isWon ? '中奖' : '未中奖'}\n`
    detail += `抽奖时间：${new Date(record.createdAt).toLocaleString('zh-CN')}\n`

    Taro.showModal({
      title: '记录详情',
      content: detail,
      showCancel: false
    })
  }

  // 重置今日抽奖次数
  const handleResetTodayCount = () => {
    if (!customerId) {
      Taro.showToast({ title: '请先选择客户', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '确认重置',
      content: '确定要重置今日抽奖次数吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: '/api/lottery/reset',
              method: 'POST',
              data: { customerId }
            })
            Taro.showToast({ title: '重置成功', icon: 'success' })
            fetchRecords(customerId)
          } catch (error) {
            Taro.showToast({ title: '重置失败', icon: 'none' })
          }
        }
      }
    })
  }

  return (
    <View className="lottery-record-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">中奖记录</Text>
        <Button
          className="bg-orange-500 text-white rounded-lg px-4 py-2 text-sm"
          onClick={handleResetTodayCount}
        >
          重置次数
        </Button>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : records.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🎁</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无记录</Text>
          <Text className="block text-sm text-gray-400">参与抽奖开始赢取大奖</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {records.map((record) => (
            <View
              key={record.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="flex justify-between items-start">
                <View className="flex items-start">
                  <Text className="text-2xl mr-3">
                    {record.isWon ? '🎉' : '😊'}
                  </Text>
                  <View>
                    <Text className={`text-base font-semibold ${record.isWon ? 'text-orange-500' : 'text-gray-500'}`}>
                      {record.result}
                    </Text>
                    <Text className="block text-xs text-gray-400 mt-1">
                      {new Date(record.createdAt).toLocaleString('zh-CN')}
                    </Text>
                  </View>
                </View>
                <View className="ml-4">
                  <Text
                    className="text-xs text-red-600"
                    onClick={() => handleViewDetail(record)}
                  >
                    详情
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
