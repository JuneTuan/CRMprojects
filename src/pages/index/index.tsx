import { View, Text, Picker } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function IndexPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [remainingCount, setRemainingCount] = useState(3)
  const [lastResult, setLastResult] = useState<any>(null)

  const prizes = [
    { name: '5元优惠券', color: '#FF6B6B', icon: '🧧' },
    { name: '10元红包', color: '#4ECDC4', icon: '🧧' },
    { name: '20元优惠券', color: '#FF9F43', icon: '🎫' },
    { name: '30元红包', color: '#5F27CD', icon: '🧧' },
    { name: '50元优惠券', color: '#FF6B6B', icon: '🎁' },
    { name: '谢谢参与', color: '#FFE66D', icon: '😊' },
    { name: '50元红包', color: '#4ECDC4', icon: '🧧' },
    { name: '100元优惠券', color: '#FF9F43', icon: '🎁' },
    { name: '神秘奖品', color: '#95E1D3', icon: '🎉' },
    { name: '200元红包', color: '#5F27CD', icon: '🧧' },
  ]

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await Network.request({
        url: '/api/customer',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setCustomers(res.data.data || [])
        if (res.data.data.length > 0) {
          setSelectedCustomerId(res.data.data[0].id)
          fetchTodayCount(res.data.data[0].id)
        }
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
    }
  }, [])

  const checkLogin = useCallback(() => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
    checkLogin()
  }, [fetchCustomers, checkLogin])

  const fetchTodayCount = async (customerId: string) => {
    try {
      const res = await Network.request({
        url: '/api/lottery/count',
        method: 'GET',
        data: { customerId }
      })
      if (res.data.code === 200) {
        setRemainingCount(3 - (res.data.data.count || 0))
      }
    } catch (error) {
      console.error('获取抽奖次数失败:', error)
    }
  }

  const handleCustomerChange = (e: any) => {
    setSelectedCustomerId(e.detail.value)
    fetchTodayCount(customers[e.detail.value].id)
  }

  const handleSpin = async () => {
    if (isSpinning) return
    if (remainingCount <= 0) {
      Taro.showToast({ title: '今日抽奖次数已用完', icon: 'none' })
      return
    }
    if (!selectedCustomerId) {
      Taro.showToast({ title: '请选择客户', icon: 'none' })
      return
    }

    setIsSpinning(true)
    setLastResult(null)

    try {
      const res = await Network.request({
        url: '/api/lottery/draw',
        method: 'POST',
        data: { customerId: selectedCustomerId }
      })

      if (res.data.code === 200) {
        const { prize, isWon } = res.data.data

        const prizeIndex = isWon
          ? prizes.findIndex(p => p.name.includes(prize.type === 'coupon' ? '优惠券' : prize.type === 'redpacket' ? '红包' : '奖品'))
          : prizes.findIndex(p => p.name === '谢谢参与')

        const spins = 5
        const segmentAngle = 360 / prizes.length
        const finalAngle = rotation + (360 * spins) + (segmentAngle * prizeIndex) + (segmentAngle / 2)

        setRotation(finalAngle)

        setTimeout(() => {
          setIsSpinning(false)
          setLastResult({ prize, isWon, result: res.data.data.record.result })
          setRemainingCount(prev => Math.max(0, prev - 1))

          Taro.showModal({
            title: isWon ? '🎉 恭喜中奖！' : '😊 再接再厉',
            content: res.data.data.record.result,
            showCancel: false
          })
        }, 4000)
      }
    } catch (error: any) {
      setIsSpinning(false)
      Taro.showToast({ title: error.message || '抽奖失败', icon: 'none' })
    }
  }

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  return (
    <View className="min-h-screen bg-gradient-to-b from-red-600 to-orange-500 p-4">
      {/* 标题 */}
      <View className="text-center mb-6 pt-4">
        <Text className="block text-5xl mb-2">🧧</Text>
        <Text className="text-2xl font-bold text-white">春节幸运大转盘</Text>
        <Text className="text-sm text-red-100 mt-1">好运连连，惊喜不断</Text>
      </View>

      {/* 客户选择 */}
      <View className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
        <Text className="block text-sm font-semibold text-gray-800 mb-2">选择参与客户</Text>
        <Picker
          mode="selector"
          range={customers.map(c => c.name)}
          value={customers.findIndex(c => c.id === selectedCustomerId)}
          onChange={handleCustomerChange}
        >
          <View className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
            <Text className={selectedCustomer ? 'text-gray-800' : 'text-gray-400'}>
              {selectedCustomer ? selectedCustomer.name : '请选择客户'}
            </Text>
            <Text className="text-gray-400">›</Text>
          </View>
        </Picker>
        {selectedCustomer && (
          <View className="mt-3 flex justify-between items-center">
            <View className="flex items-center">
              <Text className="text-xs text-gray-500">积分:</Text>
              <Text className="text-xs font-bold text-orange-500 ml-1">{selectedCustomer.points}</Text>
            </View>
            <View className="flex items-center">
              <Text className="text-xs text-gray-500">剩余次数:</Text>
              <Text className="text-xs font-bold text-red-500 ml-1">{remainingCount}/3</Text>
            </View>
          </View>
        )}
      </View>

      {/* 转盘区域 */}
      <View className="relative mb-6">
        {/* 指针 */}
        <View className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
          <View className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-400" />
        </View>

        {/* 转盘外圈 */}
        <View className="relative w-[320px] h-[320px] mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl p-2">
          {/* 转盘主体 */}
          <View
            className="w-full h-full rounded-full relative overflow-hidden bg-white"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {/* 奖品区域 */}
            {prizes.map((prize, index) => {
              const angle = (360 / prizes.length) * index
              const segmentAngle = 360 / prizes.length
              const isEven = index % 2 === 0

              return (
                <View
                  key={index}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  {/* 扇形背景 */}
                  <View
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      width: '160px',
                      height: '160px',
                      background: prize.color,
                      transformOrigin: '0 0',
                      transform: `translate(-50%, -50%) rotate(${segmentAngle / 2}deg)`,
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    }}
                  />

                  {/* 奖品内容 */}
                  <View
                    className="absolute flex flex-col items-center"
                    style={{
                      left: '50%',
                      top: '22%',
                      transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`,
                      width: '70px',
                      textAlign: 'center',
                    }}
                  >
                    <Text className="text-xl mb-1">{prize.icon}</Text>
                    <Text className={`text-[10px] font-bold leading-tight ${isEven ? 'text-white' : 'text-gray-700'}`}>
                      {prize.name}
                    </Text>
                  </View>
                </View>
              )
            })}

            {/* 中心圆 */}
            <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-red-500 to-orange-400 rounded-full shadow-lg border-4 border-white flex items-center justify-center z-10">
              <Text className="text-lg font-bold text-white">抽奖</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 抽奖按钮 */}
      <View className="text-center mb-6">
        <button
          className={`w-56 py-4 rounded-full font-bold text-white shadow-xl transform transition-transform ${
            isSpinning || remainingCount <= 0
              ? 'bg-gray-400'
              : 'bg-gradient-to-r from-red-600 to-orange-500 active:scale-95'
          }`}
          onClick={handleSpin}
          disabled={isSpinning || remainingCount <= 0}
        >
          {isSpinning ? '🎰 抽奖中...' : remainingCount > 0 ? '🎯 开始抽奖' : '❌ 次数已用完'}
        </button>
      </View>

      {/* 抽奖规则 */}
      <View className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
        <Text className="block text-sm font-bold text-white mb-3">📋 抽奖规则</Text>
        <View className="space-y-2">
          <View className="flex items-start">
            <Text className="text-white/90 text-xs mr-2">•</Text>
            <Text className="text-white/90 text-xs">每位客户每天可抽奖3次</Text>
          </View>
          <View className="flex items-start">
            <Text className="text-white/90 text-xs mr-2">•</Text>
            <Text className="text-white/90 text-xs">抽奖不消耗积分，免费参与</Text>
          </View>
          <View className="flex items-start">
            <Text className="text-white/90 text-xs mr-2">•</Text>
            <Text className="text-white/90 text-xs font-bold">中奖概率高达95%</Text>
          </View>
          <View className="flex items-start">
            <Text className="text-white/90 text-xs mr-2">•</Text>
            <Text className="text-white/90 text-xs">中奖后自动发放卡券到账户</Text>
          </View>
        </View>
      </View>

      {/* 最近结果 */}
      {lastResult && (
        <View className="bg-white rounded-xl p-4 shadow-lg">
          <Text className="block text-sm font-bold text-gray-800 mb-2">📌 最近抽奖结果</Text>
          <View className="flex items-center">
            <Text className="text-2xl mr-2">{lastResult.isWon ? '🎉' : '😊'}</Text>
            <Text className={`text-sm font-semibold ${lastResult.isWon ? 'text-orange-500' : 'text-gray-500'}`}>
              {lastResult.result}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
