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
  const [searchCode, setSearchCode] = useState('')

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
      content: `确定要核销此卡券吗？\n卡券：${coupon.prizeName || getPrizeName(coupon.prizeId)}\n卡券码：${coupon.code}`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const currentUser = Taro.getStorageSync('currentUser')
            await Network.request({
              url: `/api/coupon/${couponId}/verify`,
              method: 'PUT',
              data: { userId: currentUser?.id || 'admin' }
            })
            Taro.showToast({ title: '核销成功', icon: 'success' })
            fetchCoupons()
          } catch (error: any) {
            Taro.showToast({ title: error.message || '核销失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleQuickVerify = async () => {
    if (!searchCode.trim()) {
      Taro.showToast({ title: '请输入卡券编码', icon: 'none' })
      return
    }

    try {
      const currentUser = Taro.getStorageSync('currentUser')
      const res = await Network.request({
        url: '/api/coupon/verify-by-code',
        method: 'PUT',
        data: { 
          code: searchCode.trim(),
          userId: currentUser?.id || 'admin'
        }
      })
      
      if (res.data.code === 200) {
        const coupon = res.data.data
        Taro.showModal({
          title: '核销成功',
          content: `卡券：${coupon.prizeName || '未知奖品'}\n客户：${getCustomerName(coupon.customerId)}\n核销时间：${new Date().toLocaleString('zh-CN')}`,
          showCancel: false,
          success: () => {
            setSearchCode('')
            fetchCoupons()
          }
        })
      }
    } catch (error: any) {
      Taro.showToast({ title: error.message || '核销失败', icon: 'none' })
    }
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
        {/* 快速核销 */}
        <View className="mb-4">
          <Text className="block text-sm font-semibold text-gray-700 mb-2">快速核销</Text>
          <View className="flex gap-2">
            <Input
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3"
              placeholder="输入卡券编码快速核销"
              value={searchCode}
              onInput={(e) => setSearchCode(e.detail.value)}
            />
            <Button
              type="primary"
              onClick={handleQuickVerify}
            >
              核销
            </Button>
          </View>
        </View>

        {/* 搜索筛选 */}
        <View className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <Input
            className="w-full bg-transparent"
            placeholder="搜索卡券编码"
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
                    {coupon.prizeName || getPrizeName(coupon.prizeId)}
                  </Text>
                  {coupon.prizeValue && (
                    <Text className="block text-base font-semibold text-red-500 mb-1">
                      {coupon.prizeValue}
                    </Text>
                  )}
                  <Text className="block text-xs text-gray-500 mb-1">
                    卡券码：{coupon.code}
                  </Text>
                  {coupon.customerId && (
                    <Text className="block text-xs text-gray-400">
                      客户：{getCustomerName(coupon.customerId)}
                    </Text>
                  )}
                </View>
                <View className={`px-3 py-1 rounded-lg ${getStatusColor(coupon.status)}`}>
                  <Text className="block text-xs font-semibold">
                    {getStatusText(coupon.status)}
                  </Text>
                </View>
              </View>

              {/* 卡券信息 */}
              {coupon.verifiedBy && (
                <View className="bg-blue-50 rounded-lg p-2 mb-3">
                  <Text className="block text-xs text-blue-600">
                    核销人：{coupon.verifiedBy}
                  </Text>
                  {coupon.verifiedAt && (
                    <Text className="block text-xs text-blue-600">
                      核销时间：{new Date(coupon.verifiedAt).toLocaleString('zh-CN')}
                    </Text>
                  )}
                </View>
              )}

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
