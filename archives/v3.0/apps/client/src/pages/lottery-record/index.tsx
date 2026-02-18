import { View, Text, Button, Picker } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

export default function LotteryRecordPage() {
  const [records, setRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState<string>('')
  const [filterType, setFilterType] = useState('all')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

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

  const fetchRecords = async (custId?: string) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/lottery/records',
        method: 'GET',
        data: custId ? { customerId: custId } : {}
      })
      if (res.data.code === 200) {
        const recordsData = res.data.data || []
        setRecords(recordsData)
        setFilteredRecords(recordsData)
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

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredRecords(records)
    } else if (filterType === 'won') {
      setFilteredRecords(records.filter(r => r.isWon))
    } else if (filterType === 'lost') {
      setFilteredRecords(records.filter(r => !r.isWon))
    }
  }, [filterType, records])

  const handleFilterChange = (e: any) => {
    const filters = ['全部', '中奖', '未中奖']
    const values = ['all', 'won', 'lost']
    setFilterType(values[e.detail.value])
  }

  const getWonCount = () => records.filter(r => r.isWon).length
  const getTotalCount = () => records.length
  const getWinRate = () => {
    if (getTotalCount() === 0) return 0
    return Math.round((getWonCount() / getTotalCount()) * 100)
  }

  const handleViewDetail = (record: any) => {
    setSelectedRecord(record)
    setShowDetail(true)
  }

  if (showDetail && selectedRecord) {
    return (
      <View className="lottery-record-detail-page min-h-screen bg-gray-50 p-6 pb-20">
        <View className="flex items-center mb-6">
          <Button onClick={() => setShowDetail(false)} size="mini">返回</Button>
          <Text className="ml-4 text-2xl font-bold text-gray-800">抽奖详情</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <View className="flex items-center justify-center mb-6">
            <Text className="text-8xl">
              {selectedRecord.isWon ? '🎉' : '😊'}
            </Text>
          </View>
          <View className="text-center mb-6">
            <Text className={`text-3xl font-bold ${selectedRecord.isWon ? 'text-orange-500' : 'text-gray-500'}`}>
              {selectedRecord.result}
            </Text>
          </View>
          <View className="space-y-4">
            <View className="flex justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-base text-gray-500">抽奖结果</Text>
              <Text className={`text-base font-semibold ${selectedRecord.isWon ? 'text-orange-500' : 'text-gray-600'}`}>
                {selectedRecord.isWon ? '中奖' : '未中奖'}
              </Text>
            </View>
            <View className="flex justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-base text-gray-500">抽奖时间</Text>
              <Text className="text-base text-gray-800">
                {new Date(selectedRecord.createdAt).toLocaleString('zh-CN')}
              </Text>
            </View>
            {selectedRecord.prizeId && (
              <View className="flex justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-base text-gray-500">奖品ID</Text>
                <Text className="text-base text-gray-800">
                  {selectedRecord.prizeId}
                </Text>
              </View>
            )}
            {selectedRecord.pointsEarned && (
              <View className="flex justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-base text-gray-500">获得积分</Text>
                <Text className="text-base font-semibold text-orange-500">
                  +{selectedRecord.pointsEarned}
                </Text>
              </View>
            )}
            {selectedRecord.couponId && (
              <View className="flex justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-base text-gray-500">获得卡券</Text>
                <Text className="text-base text-gray-800">
                  {selectedRecord.couponId}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-red-50 rounded-xl p-4">
          <Text className="text-sm text-red-600 text-center">
            感谢您的参与，继续抽奖赢取更多大奖！
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="lottery-record-page min-h-screen bg-gray-50 p-6 pb-20">
      <View className="flex justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-800">中奖记录</Text>
      </View>

      <View className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-6 shadow-lg">
        <View className="flex justify-around">
          <View className="text-center">
            <Text className="block text-white/80 text-sm mb-2">总抽奖次数</Text>
            <Text className="block text-white text-3xl font-bold">{getTotalCount()}</Text>
          </View>
          <View className="text-center">
            <Text className="block text-white/80 text-sm mb-2">中奖次数</Text>
            <Text className="block text-white text-3xl font-bold">{getWonCount()}</Text>
          </View>
          <View className="text-center">
            <Text className="block text-white/80 text-sm mb-2">中奖率</Text>
            <Text className="block text-white text-3xl font-bold">{getWinRate()}%</Text>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
        <Picker
          mode="selector"
          range={['全部', '中奖', '未中奖']}
          value={filterType === 'all' ? 0 : filterType === 'won' ? 1 : 2}
          onChange={handleFilterChange}
        >
          <View className="flex justify-between items-center">
            <Text className="text-base text-gray-600">筛选</Text>
            <Text className="text-base text-gray-800">
              {filterType === 'all' ? '全部' : filterType === 'won' ? '中奖' : '未中奖'}
            </Text>
          </View>
        </Picker>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-20">
          <Text className="block text-base text-gray-500">加载中...</Text>
        </View>
      ) : filteredRecords.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-20">
          <Text className="block text-7xl mb-6">🎁</Text>
          <Text className="block text-xl font-semibold text-gray-600 mb-3">暂无记录</Text>
          <Text className="block text-base text-gray-400">参与抽奖开始赢取大奖</Text>
        </View>
      ) : (
        <View className="space-y-4">
          {filteredRecords.map((record) => (
            <View
              key={record.id}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <View className="flex justify-between items-start">
                <View className="flex items-start flex-1">
                  <Text className="text-3xl mr-4">
                    {record.isWon ? '🎉' : '😊'}
                  </Text>
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${record.isWon ? 'text-orange-500' : 'text-gray-500'}`}>
                      {record.result}
                    </Text>
                    <Text className="block text-sm text-gray-400 mt-2">
                      {new Date(record.createdAt).toLocaleString('zh-CN')}
                    </Text>
                    {record.pointsEarned && (
                      <Text className="block text-sm text-orange-500 mt-1">
                        +{record.pointsEarned} 积分
                      </Text>
                    )}
                    {record.couponId && (
                      <Text className="block text-sm text-blue-500 mt-1">
                        获得卡券
                      </Text>
                    )}
                  </View>
                </View>
                <View className="ml-4">
                  <Button
                    size="mini"
                    type="primary"
                    onClick={() => handleViewDetail(record)}
                  >
                    详情
                  </Button>
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
