import { View, Text, ScrollView, Picker } from '@tarojs/components'
import CustomTabBar from '@/components/CustomTabBar'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useResponsive, responsive } from '@/utils/responsive'

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [salesPeriod, setSalesPeriod] = useState('day')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const { isMobile, breakpoint } = useResponsive()

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/statistics/dashboard',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setDashboardData(res.data.data)
      }
    } catch (error) {
      console.error('获取数据看板失败:', error)
      Taro.showToast({ title: '获取数据失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesData = async (period: string) => {
    try {
      const res = await Network.request({
        url: `/api/statistics/sales?period=${period}`,
        method: 'GET'
      })
      if (res.data.code === 200) {
        setDashboardData(prev => ({
          ...prev,
          sales: res.data.data
        }))
      }
    } catch (error) {
      console.error('获取销售数据失败:', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleSalesPeriodChange = (e: any) => {
    const periods = ['day', 'week', 'month']
    const period = periods[e.detail.value]
    setSalesPeriod(period)
    fetchSalesData(period)
  }

  if (loading || !dashboardData) {
    return (
      <View className="dashboard-page min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Text className="text-gray-500">加载中...</Text>
      </View>
    )
  }

  return (
    <View className={`dashboard-page min-h-screen bg-gray-50 pb-20 ${responsive.padding[breakpoint]}`}>
      <View className="mb-6">
        <Text className={`${responsive.text['2xl']} font-bold text-gray-800`}>数据看板</Text>
        <Text className={`${responsive.text.sm} text-gray-500 mt-1`}>实时数据统计与分析</Text>
      </View>

      <ScrollView scrollY className={`space-y-4 ${responsive.gap[breakpoint]}`}>
        <View className={`bg-white rounded-2xl ${responsive.padding.md} shadow-sm`}>
          <View className="flex justify-between items-center mb-4">
            <Text className={`${responsive.text.lg} font-bold text-gray-800`}>销售数据</Text>
            <Picker
              mode="selector"
              range={['今日', '本周', '本月']}
              value={['day', 'week', 'month'].indexOf(salesPeriod)}
              onChange={handleSalesPeriodChange}
            >
              <View className="bg-red-50 px-3 py-1 rounded-lg">
                <Text className={`${responsive.text.sm} text-red-600 font-medium`}>
                  {salesPeriod === 'day' ? '今日' : salesPeriod === 'week' ? '本周' : '本月'}
                </Text>
              </View>
            </Picker>
          </View>
          <View className={`grid grid-cols-2 ${responsive.gap[breakpoint]}`}>
            <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-blue-100 mb-1`}>销售额</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>¥{dashboardData.sales?.totalSales?.toFixed(2) || '0.00'}</Text>
            </View>
            <View className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-green-100 mb-1`}>订单数</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.sales?.orderCount || 0}</Text>
            </View>
            <View className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-purple-100 mb-1`}>平均客单价</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>¥{dashboardData.sales?.averageOrderValue?.toFixed(2) || '0.00'}</Text>
            </View>
            <View className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-orange-100 mb-1`}>时间范围</Text>
              <Text className={`${responsive.text.lg} font-bold text-white`}>
                {salesPeriod === 'day' ? '今日' : salesPeriod === 'week' ? '本周' : '本月'}
              </Text>
            </View>
          </View>
        </View>

        <View className={`bg-white rounded-2xl ${responsive.padding.md} shadow-sm`}>
          <Text className={`${responsive.text.lg} font-bold text-gray-800 mb-4`}>客户数据</Text>
          <View className={`grid grid-cols-2 ${responsive.gap[breakpoint]}`}>
            <View className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-indigo-100 mb-1`}>总客户数</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.customers?.totalCustomers || 0}</Text>
            </View>
            <View className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-teal-100 mb-1`}>今日新增</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.customers?.newCustomersToday || 0}</Text>
            </View>
            <View className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-cyan-100 mb-1`}>本周新增</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.customers?.newCustomersThisWeek || 0}</Text>
            </View>
            <View className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-rose-100 mb-1`}>平均积分</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{Math.round(dashboardData.customers?.averagePoints || 0)}</Text>
            </View>
          </View>
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className={`${responsive.text.md} font-semibold text-gray-800 mb-3`}>积分分布</Text>
            <View className="space-y-2">
              {dashboardData.customers?.pointsDistribution?.map((item: any, index: number) => (
                <View key={index} className="flex items-center justify-between">
                  <View className="flex-1">
                    <View className="flex justify-between items-center mb-1">
                      <Text className={`${responsive.text.sm} text-gray-600`}>{item.label}</Text>
                      <Text className={`${responsive.text.sm} font-semibold text-gray-800`}>{item.count}人</Text>
                    </View>
                    <View className="w-full bg-gray-200 rounded-full h-2">
                      <View 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${(item.count / (dashboardData.customers.totalCustomers || 1)) * 100}%` }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={`bg-white rounded-2xl ${responsive.padding.md} shadow-sm`}>
          <Text className={`${responsive.text.lg} font-bold text-gray-800 mb-4`}>抽奖数据</Text>
          <View className={`grid grid-cols-2 ${responsive.gap[breakpoint]}`}>
            <View className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-amber-100 mb-1`}>总抽奖次数</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.lottery?.totalDraws || 0}</Text>
            </View>
            <View className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-pink-100 mb-1`}>中奖次数</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.lottery?.totalWins || 0}</Text>
            </View>
            <View className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-violet-100 mb-1`}>中奖率</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.lottery?.winRate || 0}%</Text>
            </View>
            <View className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 rounded-xl p-4">
              <Text className={`${responsive.text.sm} text-fuchsia-100 mb-1`}>奖品种类</Text>
              <Text className={`${responsive.text['2xl']} font-bold text-white`}>{dashboardData.lottery?.prizeDistribution?.length || 0}</Text>
            </View>
          </View>
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className={`${responsive.text.md} font-semibold text-gray-800 mb-3`}>奖品分布</Text>
            <View className="space-y-2">
              {dashboardData.lottery?.prizeDistribution?.map((item: any, index: number) => (
                <View key={index} className="flex items-center justify-between">
                  <View className="flex-1">
                    <View className="flex justify-between items-center mb-1">
                      <Text className={`${responsive.text.sm} text-gray-600`}>{item.prizeName}</Text>
                      <Text className={`${responsive.text.sm} font-semibold text-gray-800`}>{item.wins}次 ({item.percentage.toFixed(1)}%)</Text>
                    </View>
                    <View className="w-full bg-gray-200 rounded-full h-2">
                      <View 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">积分数据</Text>
          <View className="grid grid-cols-2 gap-4">
            <View className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4">
              <Text className="text-sm text-emerald-100 mb-1">累计发放积分</Text>
              <Text className="text-2xl font-bold text-white">{dashboardData.points?.totalPointsEarned || 0}</Text>
            </View>
            <View className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-xl p-4">
              <Text className="text-sm text-lime-100 mb-1">当前积分余额</Text>
              <Text className="text-2xl font-bold text-white">{dashboardData.points?.totalPointsBalance || 0}</Text>
            </View>
          </View>
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="text-base font-semibold text-gray-800 mb-3">积分发放趋势</Text>
            <View className="space-y-3">
              <View className="flex items-center justify-between">
                <Text className="text-sm text-gray-600">今日发放</Text>
                <Text className="text-lg font-bold text-emerald-600">+{dashboardData.points?.pointsEarnedDistribution?.today || 0}</Text>
              </View>
              <View className="flex items-center justify-between">
                <Text className="text-sm text-gray-600">本周发放</Text>
                <Text className="text-lg font-bold text-emerald-600">+{dashboardData.points?.pointsEarnedDistribution?.thisWeek || 0}</Text>
              </View>
              <View className="flex items-center justify-between">
                <Text className="text-sm text-gray-600">本月发放</Text>
                <Text className="text-lg font-bold text-emerald-600">+{dashboardData.points?.pointsEarnedDistribution?.thisMonth || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <CustomTabBar />
    </View>
  )
}
