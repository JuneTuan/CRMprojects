import { View, Text, Picker } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import './index.css'

export default function IndexPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [remainingCount, setRemainingCount] = useState(3)
  const [lastResult, setLastResult] = useState<any>(null)

  const prizes = [
    { name: '10元优惠券', color: '#FF6B6B', icon: '🧧' },
    { name: '谢谢参与', color: '#FFE66D', icon: '😊' },
    { name: '50元红包', color: '#4ECDC4', icon: '🧧' },
    { name: '谢谢参与', color: '#FFE66D', icon: '😊' },
    { name: '100元优惠券', color: '#FF6B6B', icon: '🎁' },
    { name: '谢谢参与', color: '#FFE66D', icon: '😊' },
    { name: '神秘奖品', color: '#95E1D3', icon: '🎉' },
    { name: '谢谢参与', color: '#FFE66D', icon: '😊' },
  ]

  useEffect(() => {
    fetchCustomers()
    checkLogin()
  }, [])

  const checkLogin = () => {
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }

  const fetchCustomers = async () => {
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
  }

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
        const finalAngle = rotation + (360 * spins) + (360 / prizes.length) * prizeIndex + (180 / prizes.length)

        setRotation(finalAngle)

        setTimeout(() => {
          setIsSpinning(false)
          setLastResult({ prize, isWon, result: res.data.data.record.result })
          setRemainingCount(prev => Math.max(0, prev - 1))

          Taro.showModal({
            title: isWon ? '恭喜中奖！' : '很遗憾',
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
      <View className="text-center mb-6">
        <Text className="text-4xl mb-2">🎰</Text>
        <Text className="text-2xl font-bold text-white">春节幸运大转盘</Text>
      </View>

      <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
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
          <View className="mt-2 flex justify-between">
            <Text className="text-xs text-gray-500">积分: {selectedCustomer.points}</Text>
            <Text className="text-xs text-orange-500">剩余次数: {remainingCount}/3</Text>
          </View>
        )}
      </View>

      <View className="relative">
        <View
          className="w-64 h-64 rounded-full mx-auto relative overflow-hidden shadow-2xl border-8 border-yellow-400"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * index
            return (
              <View
                key={index}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <View
                  className="absolute w-1/2 h-1/2 top-0 left-1/2 flex flex-col items-center justify-center"
                  style={{
                    background: prize.color,
                    transform: 'translateY(-50%) rotate(22.5deg)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  }}
                >
                  <Text className="text-2xl mb-1">{prize.icon}</Text>
                  <Text className="text-xs font-semibold text-center px-2 leading-tight">{prize.name}</Text>
                </View>
              </View>
            )
          })}
        </View>

        <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <View className="w-16 h-16 bg-red-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
            <Text className="text-2xl font-bold text-white">GO</Text>
          </View>
        </View>
      </View>

      <View className="text-center mt-6">
        <button
          className={`w-48 py-3 rounded-full font-semibold text-white shadow-lg ${
            isSpinning || remainingCount <= 0
              ? 'bg-gray-400'
              : 'bg-gradient-to-r from-red-600 to-orange-500 active:scale-95'
          }`}
          onClick={handleSpin}
          disabled={isSpinning || remainingCount <= 0}
        >
          {isSpinning ? '抽奖中...' : remainingCount > 0 ? '开始抽奖' : '次数已用完'}
        </button>
      </View>

      <View className="mt-6 bg-white/20 rounded-xl p-4">
        <Text className="block text-sm text-white font-semibold mb-2">抽奖规则</Text>
        <View className="text-xs text-white/90 space-y-1">
          <Text>• 每位客户每天可抽奖3次</Text>
          <Text>• 抽奖不消耗积分</Text>
          <Text>• 中奖概率90%</Text>
          <Text>• 中奖后自动发放卡券</Text>
        </View>
      </View>

      {lastResult && (
        <View className="mt-4 bg-white rounded-xl p-4">
          <Text className="block text-sm font-semibold text-gray-800 mb-2">最近抽奖结果</Text>
          <Text className={lastResult.isWon ? 'text-orange-500' : 'text-gray-500'}>
            {lastResult.result}
          </Text>
        </View>
      )}
    </View>
  )
}
