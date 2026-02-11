import { View, Text, Button, Input } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function CouponVerifyPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [prizes, setPrizes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('') // '', claimed, used, expired

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/coupon',
        method: 'GET',
        data: filterStatus ? { status: filterStatus } : {}
      })
      if (res.data.code === 200) {
        setCoupons(res.data.data || [])
      }
    } catch (error) {
      console.error('获取卡券列表失败:', error)
      Taro.showToast({ title: '获取卡券列表失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  const fetchCustomers = async () => {
    try {
      const res = await Network.request({
        url: '/api/customer',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setCustomers(res.data.data || [])
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
    }
  }

  const fetchPrizes = async () => {
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
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchPrizes()
    fetchCoupons()
  }, [fetchCoupons])

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : '未知客户'
  }

  const getPrizeName = (prizeId: string) => {
    const prize = prizes.find(p => p.id === prizeId)
    return prize ? prize.name : '未知奖品'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      claimed: '已领取',
      used: '已使用',
      expired: '已过期'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      claimed: 'text-blue-600 bg-blue-50',
      used: 'text-green-600 bg-green-50',
      expired: 'text-gray-600 bg-gray-100'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-100'
  }

  const handleVerifyCoupon = async (couponId: string, coupon: any) => {
    if (coupon.status !== 'claimed') {
      Taro.showToast({ title: '该卡券已使用或已过期', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '确认核销',
      content: `确定要核销客户的卡券吗？\n客户：${getCustomerName(coupon.customerId)}\n奖品：${getPrizeName(coupon.prizeId)}`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/coupon/${couponId}/use`,
              method: 'PUT'
            })
            Taro.showToast({ title: '核销成功', icon: 'success' })
            fetchCoupons()
          } catch (error) {
            Taro.showToast({ title: '核销失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleSearchCoupon = async (code: string) => {
    if (!code) {
      fetchCoupons()
      return
    }

    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/coupon',
        method: 'GET'
      })
      if (res.data.code === 200) {
        const allCoupons = res.data.data || []
        const filtered = allCoupons.filter((c: any) =>
          c.code.toLowerCase().includes(code.toLowerCase())
        )
        setCoupons(filtered)
      }
    } catch (error) {
      console.error('搜索卡券失败:', error)
      Taro.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="coupon-verify-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="block text-xl font-bold text-gray-800">卡券核销管理</Text>
      </View>

      {/* 搜索栏 */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <View className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <Input
            className="w-full bg-transparent"
            placeholder="输入卡券编码搜索"
            onConfirm={(e) => handleSearchCoupon(e.detail.value)}
          />
        </View>

        {/* 筛选按钮 */}
        <View className="flex gap-2">
          <View style={{ flex: 1 }}>
            <Button
              size="mini"
              className={filterStatus === '' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}
              onClick={() => setFilterStatus('')}
            >
              全部
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              size="mini"
              className={filterStatus === 'claimed' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}
              onClick={() => setFilterStatus('claimed')}
            >
              已领取
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              size="mini"
              className={filterStatus === 'used' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}
              onClick={() => setFilterStatus('used')}
            >
              已使用
            </Button>
          </View>
        </View>
      </View>

      {/* 卡券列表 */}
      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : coupons.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">🎫</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无卡券</Text>
          <Text className="block text-sm text-gray-400">客户中奖后将显示卡券</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {coupons.map((coupon) => (
            <View
              key={coupon.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              {/* 卡券头部 */}
              <View className="flex justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="block text-lg font-bold text-gray-800 mb-1">
                    {getPrizeName(coupon.prizeId)}
                  </Text>
                  <Text className="block text-xs text-gray-500 mb-1">
                    客户：{getCustomerName(coupon.customerId)}
                  </Text>
                  <Text className="block text-xs text-gray-400">
                    卡券码：{coupon.code}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-lg ${getStatusColor(coupon.status)}`}>
                  <Text className="block text-xs font-semibold">
                    {getStatusText(coupon.status)}
                  </Text>
                </View>
              </View>

              {/* 卡券操作 */}
              <View className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <Text className="block text-xs text-gray-400">
                  {new Date(coupon.createdAt).toLocaleString('zh-CN')}
                </Text>
                {coupon.status === 'claimed' && (
                  <Button
                    size="mini"
                    type="primary"
                    onClick={() => handleVerifyCoupon(coupon.id, coupon)}
                  >
                    核销
                  </Button>
                )}
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
