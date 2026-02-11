import { View, Text } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

// 转盘游戏组件
function WheelGame({ isSpinning, rotation }: any) {
  const prizes = [
    { name: '5元优惠券', color: '#FF4757', icon: '🧧', type: 'coupon' },
    { name: '10元红包', color: '#2ED573', icon: '🧧', type: 'redpacket' },
    { name: '20元优惠券', color: '#FFA502', icon: '🎫', type: 'coupon' },
    { name: '50元红包', color: '#5352ED', icon: '🧧', type: 'redpacket' },
    { name: '谢谢参与', color: '#F1C40F', icon: '😊', type: 'none' },
    { name: '100元优惠券', color: '#FF6348', icon: '🎁', type: 'coupon' },
    { name: '神秘奖品', color: '#1E90FF', icon: '🎉', type: 'item' },
    { name: '200元红包', color: '#9B59B6', icon: '🧧', type: 'redpacket' },
  ]

  return (
    <View className="relative mb-6">
      {/* 指针 */}
      <View className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-30">
        <View className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-lg" />
      </View>

      {/* 转盘外圈 */}
      <View className="relative w-[25vh] h-[25vh] mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl p-1.5">
        {/* 转盘主体 */}
        <View
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background: prizes.map((prize: any, index: number) => {
              const segmentAngle = 360 / prizes.length
              const startAngle = index * segmentAngle
              const endAngle = startAngle + segmentAngle - 1
              return `${prize.color} ${startAngle}deg ${endAngle}deg, white ${endAngle}deg ${endAngle + 1}deg`
            }).join(', '),
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {/* 奖品文字 */}
          {prizes.map((prize: any, index: number) => {
            const segmentAngle = 360 / prizes.length
            const startAngle = index * segmentAngle
            const midAngle = startAngle + segmentAngle / 2
            const isEven = index % 2 === 0

            return (
              <View
                key={index}
                className="absolute flex flex-col items-center"
                style={{
                  top: '25%',
                  left: '50%',
                  transform: `translateX(-50%) rotate(${midAngle}deg)`,
                  transformOrigin: '50% 133%',
                  zIndex: 10,
                }}
              >
                <Text className="block text-lg mb-0.5">{prize.icon}</Text>
                <Text className={`block text-[8px] font-bold leading-tight ${isEven ? 'text-white' : 'text-white'}`}>
                  {prize.name}
                </Text>
              </View>
            )
          })}

          {/* 中心圆 */}
          <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[15%] h-[15%] bg-gradient-to-br from-red-600 to-orange-500 rounded-full shadow-lg border-[3px] border-white flex items-center justify-center z-20">
            <Text className="block text-xs font-bold text-white">抽奖</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

// 盲盒游戏组件
function BlindBoxGame({ onOpen, isOpening, selectedBoxIndex }: any) {
  return (
    <View className="relative mb-6">
      <View className="grid grid-cols-3 gap-3 p-4">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            className={`relative aspect-square rounded-xl shadow-lg transition-all ${
              selectedBoxIndex === index && isOpening
                ? 'opacity-50 scale-95'
                : 'active:scale-95'
            } bg-gradient-to-br from-purple-500 to-pink-500`}
            onClick={() => onOpen(index)}
            disabled={isOpening}
          >
            <Text className="block text-4xl">🎁</Text>
            {selectedBoxIndex === index && isOpening && (
              <View className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-xl">
                <Text className="block text-2xl">✨</Text>
              </View>
            )}
          </button>
        ))}
      </View>
    </View>
  )
}

// 老虎机游戏组件
function SlotMachineGame({ onSpin, isSpinning, results }: any) {
  const defaultIcon = '🍒'
  const icons = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣']

  return (
    <View className="relative mb-6">
      <View className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 shadow-xl">
        <View className="flex justify-between gap-2 mb-4">
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              className="flex-1 h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden"
            >
              <Text className={`text-6xl ${isSpinning ? 'animate-bounce' : ''}`}>
                {isSpinning ? icons[Math.floor(Math.random() * icons.length)] : results?.[index] || defaultIcon}
              </Text>
            </View>
          ))}
        </View>
        <button
          className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-bold text-lg shadow-lg"
          onClick={onSpin}
          disabled={isSpinning}
        >
          {isSpinning ? '🎰 转动中...' : '开始'}
        </button>
      </View>
    </View>
  )
}

// 刮刮乐游戏组件
function ScratchCardGame({ onScratch, isScratched, prize }: any) {
  return (
    <View className="relative mb-6">
      <View className="bg-white rounded-2xl p-4 shadow-lg">
        <View className="relative aspect-square bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl overflow-hidden">
          {/* 刮刮层 */}
          {!isScratched ? (
            <View className="absolute inset-0 bg-gray-300 flex items-center justify-center cursor-pointer" onClick={onScratch}>
              <Text className="block text-2xl text-gray-500">👆 点击刮奖</Text>
            </View>
          ) : (
            <View className="absolute inset-0 flex flex-col items-center justify-center">
              <Text className="block text-4xl mb-2">{prize?.icon || '🎉'}</Text>
              <Text className={`block text-lg font-bold ${prize ? 'text-white' : 'text-gray-300'}`}>
                {prize?.name || '谢谢参与'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

// 抽奖箱游戏组件
function LotteryBoxGame({ onDraw, isDrawing }: any) {
  return (
    <View className="relative mb-6">
      <View className="bg-gradient-to-b from-red-600 to-red-800 rounded-2xl p-6 shadow-xl">
        <View className="text-center mb-4">
          <Text className="block text-8xl mb-2">🎁</Text>
          <Text className="block text-white text-lg font-semibold">神秘抽奖箱</Text>
        </View>
        <button
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-bold text-lg shadow-lg"
          onClick={onDraw}
          disabled={isDrawing}
        >
          {isDrawing ? '🎉 抽取中...' : '🎁 点击抽奖'}
        </button>
      </View>
    </View>
  )
}

export default function IndexPage() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [remainingCount, setRemainingCount] = useState(3)
  const [lastResult, setLastResult] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [activity, setActivity] = useState<any>(null) // 当前活动
  const [gameState, setGameState] = useState<any>({
    selectedBoxIndex: null,
    slotResults: ['🍒', '🍒', '🍒'],
    isScratched: false,
    revealedPrize: null
  })

  // 8个奖品，只有1个"谢谢参与"，87.5%中奖率
  const prizes = [
    { name: '5元优惠券', color: '#FF4757', icon: '🧧', type: 'coupon' },
    { name: '10元红包', color: '#2ED573', icon: '🧧', type: 'redpacket' },
    { name: '20元优惠券', color: '#FFA502', icon: '🎫', type: 'coupon' },
    { name: '50元红包', color: '#5352ED', icon: '🧧', type: 'redpacket' },
    { name: '谢谢参与', color: '#F1C40F', icon: '😊', type: 'none' },
    { name: '100元优惠券', color: '#FF6348', icon: '🎁', type: 'coupon' },
    { name: '神秘奖品', color: '#1E90FF', icon: '🎉', type: 'item' },
    { name: '200元红包', color: '#9B59B6', icon: '🧧', type: 'redpacket' },
  ]

  const checkLogin = useCallback(() => {
    const token = Taro.getStorageSync('token')
    const user = Taro.getStorageSync('userInfo')
    if (!token || !user) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return null
    }
    return user
  }, [])

  const fetchUserInfo = useCallback(async () => {
    const user = checkLogin()
    if (!user) return

    setUserInfo(user)

    // 查找与用户关联的客户
    try {
      const res = await Network.request({
        url: '/api/customer',
        method: 'GET'
      })
      if (res.data.code === 200) {
        const customers = res.data.data || []
        if (customers.length > 0) {
          setCustomer(customers[0])
          fetchTodayCount(customers[0].id)
        }
      }
    } catch (error) {
      console.error('获取客户信息失败:', error)
    }
  }, [checkLogin])

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

  // 获取当前活动
  const fetchActiveActivity = async () => {
    try {
      const res = await Network.request({
        url: '/api/activity/active',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setActivity(res.data.data || null)
      }
    } catch (error) {
      console.error('获取当前活动失败:', error)
    }
  }

  useEffect(() => {
    fetchUserInfo()
    fetchActiveActivity()
  }, [fetchUserInfo])

  // 根据游戏类型渲染不同的游戏组件
  const renderGame = () => {
    const gameType = activity?.gameType || 'wheel'

    switch (gameType) {
      case 'wheel':
        return (
          <WheelGame
            isSpinning={isSpinning}
            rotation={rotation}
          />
        )
      case 'blindbox':
        return (
          <BlindBoxGame
            onOpen={handleBlindBoxOpen}
            isOpening={isSpinning}
            selectedBoxIndex={gameState.selectedBoxIndex}
          />
        )
      case 'slotmachine':
        return (
          <SlotMachineGame
            onSpin={handleSpin}
            isSpinning={isSpinning}
            results={gameState.slotResults}
          />
        )
      case 'scratchcard':
        return (
          <ScratchCardGame
            onScratch={handleScratch}
            isScratched={gameState.isScratched}
            prize={gameState.revealedPrize}
          />
        )
      case 'lotterybox':
        return (
          <LotteryBoxGame
            onDraw={handleSpin}
            isDrawing={isSpinning}
          />
        )
      default:
        return (
          <WheelGame
            isSpinning={isSpinning}
            rotation={rotation}
          />
        )
    }
  }

  // 获取游戏类型名称
  const getGameTypeName = (gameType: string) => {
    const gameTypeMap: Record<string, string> = {
      wheel: '幸运转盘',
      blindbox: '神秘盲盒',
      slotmachine: '老虎机',
      scratchcard: '刮刮乐',
      lotterybox: '抽奖箱'
    }
    return gameTypeMap[gameType] || '幸运转盘'
  }

  const handleSpin = async () => {
    if (isSpinning) return
    if (!customer) {
      Taro.showToast({ title: '请先创建客户信息', icon: 'none' })
      return
    }

    // 判断是否需要使用积分抽奖
    let usePoints = false
    if (remainingCount <= 0) {
      // 免费次数用完，检查是否启用积分抽奖
      const pointsEnabled = activity?.pointsEnabled !== false
      const pointsPerDraw = activity?.pointsPerDraw || 10

      if (pointsEnabled) {
        if (customer.points < pointsPerDraw) {
          Taro.showToast({ title: `积分不足，需要${pointsPerDraw}积分`, icon: 'none' })
          return
        }
        usePoints = true
        Taro.showModal({
          title: '使用积分抽奖',
          content: `今日免费抽奖次数已用完，是否消耗${pointsPerDraw}积分继续抽奖？`,
          success: (res) => {
            if (res.confirm) {
              performDraw(usePoints)
            }
          }
        })
        return
      } else {
        Taro.showToast({ title: '今日抽奖次数已用完', icon: 'none' })
        return
      }
    }

    performDraw(usePoints)
  }

  const performDraw = async (usePoints: boolean) => {
    setIsSpinning(true)
    setLastResult(null)

    try {
      const res = await Network.request({
        url: '/api/lottery/draw',
        method: 'POST',
        data: {
          customerId: customer.id,
          activityId: activity?.id,
          usePoints // 传递是否使用积分抽奖
        }
      })

      if (res.data.code === 200) {
        const { prize, isWon } = res.data.data
        const gameType = activity?.gameType || 'wheel'

        // 老虎机游戏特殊处理
        if (gameType === 'slotmachine') {
          const icons = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣']
          let finalResults: string[]

          if (isWon) {
            // 中奖：三个相同图标
            const winIcon = icons[Math.floor(Math.random() * icons.length)]
            finalResults = [winIcon, winIcon, winIcon]
          } else {
            // 未中奖：三个不同图标
            finalResults = [
              icons[Math.floor(Math.random() * icons.length)],
              icons[Math.floor(Math.random() * icons.length)],
              icons[Math.floor(Math.random() * icons.length)]
            ]
            // 确保三个图标不全部相同
            while (finalResults[0] === finalResults[1] && finalResults[1] === finalResults[2]) {
              finalResults[2] = icons[Math.floor(Math.random() * icons.length)]
            }
          }

          setGameState({ ...gameState, slotResults: finalResults })

          setTimeout(() => {
            setIsSpinning(false)
            setLastResult({ prize, isWon, result: res.data.data.record.result })
            setRemainingCount(prev => Math.max(0, prev - 1))

            Taro.showModal({
              title: isWon ? '🎉 恭喜中奖！' : '😊 再接再厉',
              content: res.data.data.record.result,
              showCancel: false
            })

            fetchUserInfo()
          }, 2000)
        }
        // 转盘游戏处理
        else if (gameType === 'wheel') {
          // 根据奖品类型匹配转盘位置
          let prizeIndex = 5
        if (isWon && prize) {
          prizeIndex = prizes.findIndex(p => p.type === prize.type && p.name.includes(prize.type === 'coupon' ? '优惠券' : prize.type === 'redpacket' ? '红包' : '奖品'))
          if (prizeIndex === -1) {
            const winnableIndices = [0, 1, 2, 3, 4, 6, 7, 8, 9]
            prizeIndex = winnableIndices[Math.floor(Math.random() * winnableIndices.length)]
          }
        }

        const spins = 5
        const segmentAngle = 360 / prizes.length
        const finalAngle = rotation + (360 * spins) - (segmentAngle * prizeIndex)

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

          fetchUserInfo()
        }, 4000)
        }
        // 其他游戏类型
        else {
          setTimeout(() => {
            setIsSpinning(false)
            setLastResult({ prize, isWon, result: res.data.data.record.result })
            setRemainingCount(prev => Math.max(0, prev - 1))

            Taro.showModal({
              title: isWon ? '🎉 恭喜中奖！' : '😊 再接再厉',
              content: res.data.data.record.result,
              showCancel: false
            })

            fetchUserInfo()
          }, 1500)
        }
      }
    } catch (error: any) {
      setIsSpinning(false)
      Taro.showToast({ title: error.message || '抽奖失败', icon: 'none' })
    }
  }

  // 盲盒打开处理
  const handleBlindBoxOpen = async (boxIndex: number) => {
    if (isSpinning) return
    if (remainingCount <= 0) {
      Taro.showToast({ title: '今日抽奖次数已用完', icon: 'none' })
      return
    }
    if (!customer) {
      Taro.showToast({ title: '请先创建客户信息', icon: 'none' })
      return
    }

    setGameState({ ...gameState, selectedBoxIndex: boxIndex })
    setIsSpinning(true)

    try {
      const res = await Network.request({
        url: '/api/lottery/draw',
        method: 'POST',
        data: {
          customerId: customer.id,
          activityId: activity?.id
        }
      })

      if (res.data.code === 200) {
        const { prize, isWon } = res.data.data

        setTimeout(() => {
          setIsSpinning(false)
          setLastResult({ prize, isWon, result: res.data.data.record.result })
          setRemainingCount(prev => Math.max(0, prev - 1))

          Taro.showModal({
            title: isWon ? '🎉 恭喜中奖！' : '😊 再接再厉',
            content: res.data.data.record.result,
            showCancel: false
          })

          fetchUserInfo()
        }, 1500)
      }
    } catch (error: any) {
      setIsSpinning(false)
      setGameState({ ...gameState, selectedBoxIndex: null })
      Taro.showToast({ title: error.message || '抽奖失败', icon: 'none' })
    }
  }

  // 刮刮乐处理
  const handleScratch = async () => {
    if (isSpinning) return
    if (remainingCount <= 0) {
      Taro.showToast({ title: '今日抽奖次数已用完', icon: 'none' })
      return
    }
    if (!customer) {
      Taro.showToast({ title: '请先创建客户信息', icon: 'none' })
      return
    }

    setIsSpinning(true)

    try {
      const res = await Network.request({
        url: '/api/lottery/draw',
        method: 'POST',
        data: {
          customerId: customer.id,
          activityId: activity?.id
        }
      })

      if (res.data.code === 200) {
        const { prize, isWon } = res.data.data

        setGameState({ ...gameState, isScratched: true, revealedPrize: isWon ? prize : null })

        setTimeout(() => {
          setIsSpinning(false)
          setLastResult({ prize, isWon, result: res.data.data.record.result })
          setRemainingCount(prev => Math.max(0, prev - 1))

          fetchUserInfo()
        }, 1000)
      }
    } catch (error: any) {
      setIsSpinning(false)
      Taro.showToast({ title: error.message || '抽奖失败', icon: 'none' })
    }
  }

  return (
    <View className="min-h-screen bg-gradient-to-b from-red-600 to-orange-500 p-4 pb-20">
      {/* 标题 */}
      <View className="text-center mb-6 pt-4">
        <Text className="block text-5xl mb-2">🧧</Text>
        <Text className="block text-2xl font-bold text-white">
          {activity ? `${activity.name}` : '春节幸运大转盘'}
        </Text>
        <Text className="block text-sm text-red-100 mt-1">
          {activity ? getGameTypeName(activity.gameType) : '好运连连，惊喜不断'}
        </Text>
      </View>

      {/* 用户信息卡片 */}
      <View className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
        <View className="flex justify-between items-center mb-3">
          <Text className="block text-sm font-bold text-gray-800">👤 用户信息</Text>
          <Text className="block text-xs text-gray-400">{userInfo?.name || '管理员'}</Text>
        </View>
        {customer && (
          <View className="flex justify-between items-center">
            <View className="flex items-center">
              <Text className="block text-xs text-gray-500">积分:</Text>
              <Text className="block text-lg font-bold text-orange-500 ml-2">{customer.points}</Text>
            </View>
            <View className="flex items-center">
              <Text className="block text-xs text-gray-500">剩余次数:</Text>
              <Text className="block text-lg font-bold text-red-500 ml-2">{remainingCount}/3</Text>
            </View>
          </View>
        )}
        {!customer && (
          <Text className="block text-xs text-gray-400">请先在客户管理中创建客户信息</Text>
        )}
      </View>

      {/* 游戏区域 - 根据活动类型动态渲染 */}
      {renderGame()}

      {/* 抽奖按钮（非转盘类游戏不需要单独的按钮） */}
      {activity?.gameType === 'wheel' && (
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
      )}

      {/* 抽奖规则 */}
      <View className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
        <Text className="block text-sm font-bold text-white mb-3">📋 抽奖规则</Text>
        <View className="space-y-2">
          <View className="flex items-start">
            <Text className="text-white/90 text-xs mr-2">•</Text>
            <Text className="text-white/90 text-xs">每天可抽奖3次（免费）</Text>
          </View>
          {activity?.pointsEnabled && (
            <View className="flex items-start">
              <Text className="text-white/90 text-xs mr-2">•</Text>
              <Text className="text-white/90 text-xs">免费次数用完后可使用积分抽奖（{activity.pointsPerDraw}积分/次）</Text>
            </View>
          )}
          <View className="flex items-start">
            <Text className="text-white/90 text-xs mr-2">•</Text>
            <Text className="text-white/90 text-xs font-bold">8个奖品，中奖概率87.5%</Text>
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

      {/* 自定义TabBar */}
      <CustomTabBar />
    </View>
  )
}
