import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

export default function MyCouponPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)

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
          setCustomer(customers[0])
          return customers[0]
        }
      }
    } catch (error) {
      console.error('获取客户信息失败:', error)
    }
    return null
  }

  // 获取卡券列表
  const fetchCoupons = async (customerId?: string) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/coupon',
        method: 'GET',
        data: customerId ? { customerId } : {}
      })
      if (res.data.code === 200) {
        const allCoupons = res.data.data || []
        if (customerId) {
          setCoupons(allCoupons)
        } else {
          setCoupons([])
        }
      }
    } catch (error) {
      console.error('获取卡券列表失败:', error)
      Taro.showToast({ title: '获取卡券列表失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const cust = await fetchCustomer()
      if (cust) {
        fetchCoupons(cust.id)
      }
    }
    init()
  }, [])

  // 展示卡券（显示二维码）
  const handleShowCoupon = (coupon: any) => {
    Taro.showModal({
      title: '卡券详情',
      content: `卡券编号：${coupon.code}\n\n请向店员出示此卡券编号进行核销`,
      showCancel: true,
      cancelText: '关闭',
      confirmText: '复制编号',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({
            data: coupon.code,
            success: () => {
              Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
            }
          })
        }
      }
    })
  }

  // 查看卡券详情
  const handleViewDetail = (coupon: any) => {
    let detail = `卡券信息\n\n`
    
    if (coupon.prizeName) {
      detail += `奖品名称：${coupon.prizeName}\n`
    }
    
    if (coupon.prizeType) {
      detail += `奖品类型：${getPrizeTypeText(coupon.prizeType)}\n`
    }
    
    if (coupon.prizeValue) {
      detail += `奖品价值：${coupon.prizeValue}\n`
    }
    
    detail += `卡券编号：${coupon.code}\n`
    detail += `状态：${getStatusText(coupon.status)}\n`
    detail += `获得时间：${new Date(coupon.createdAt).toLocaleString('zh-CN')}\n`
    
    if (coupon.expiryDate) {
      detail += `过期时间：${new Date(coupon.expiryDate).toLocaleString('zh-CN')}\n`
    }
    
    if (coupon.usedAt) {
      detail += `使用时间：${new Date(coupon.usedAt).toLocaleString('zh-CN')}\n`
    }

    Taro.showModal({
      title: '卡券详情',
      content: detail,
      showCancel: false
    })
  }

  const getPrizeTypeText = (type: string) => {
    switch (type) {
      case 'coupon':
        return '优惠券'
      case 'redpacket':
        return '红包'
      case 'item':
        return '实物奖品'
      default:
        return type
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'claimed':
        return '未使用'
      case 'used':
        return '已使用'
      case 'expired':
        return '已过期'
      default:
        return '未知'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'text-orange-500'
      case 'used':
        return 'text-gray-400'
      case 'expired':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <View className="my-coupon-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">我的卡券</Text>
        <Button
          className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
          onClick={() => fetchCoupons(customer?.id)}
        >
          刷新
        </Button>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : coupons.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🎫</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无卡券</Text>
          <Text className="block text-sm text-gray-400">参与抽奖有机会获得卡券</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate)
            const canUse = coupon.status === 'claimed' && !expired

            return (
              <View
                key={coupon.id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <View className="flex justify-between items-start">
                  <View className="flex-1">
                    {coupon.prizeName && (
                      <Text className="block text-lg font-bold text-gray-800 mb-1">
                        {coupon.prizeName}
                      </Text>
                    )}
                    {coupon.prizeValue && (
                      <Text className="block text-base font-semibold text-red-500 mb-2">
                        {coupon.prizeValue}
                      </Text>
                    )}
                    <Text className="block text-sm text-gray-600 mb-1">
                      卡券编号: {coupon.code}
                    </Text>
                    {coupon.prizeType && (
                      <Text className="block text-xs text-gray-500 mb-1">
                        类型: {getPrizeTypeText(coupon.prizeType)}
                      </Text>
                    )}
                    <Text className={`text-sm font-semibold mb-1 ${getStatusColor(coupon.status)}`}>
                      {getStatusText(coupon.status)}
                    </Text>
                    {coupon.expiryDate && (
                      <Text className="block text-xs text-gray-400">
                        过期时间: {new Date(coupon.expiryDate).toLocaleDateString('zh-CN')}
                      </Text>
                    )}
                  </View>
                  <View className="flex flex-col gap-2 ml-4">
                    <Button
                      size="mini"
                      type="default"
                      onClick={() => handleViewDetail(coupon)}
                    >
                      详情
                    </Button>
                    {canUse && (
                      <Button
                        size="mini"
                        type="primary"
                        onClick={() => handleShowCoupon(coupon)}
                      >
                        展示
                      </Button>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* 自定义TabBar */}
      <CustomTabBar />
    </View>
  )
}
