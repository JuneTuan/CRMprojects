import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'
import { useResponsive, responsive } from '@/utils/responsive'

export default function CleanupPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const { isMobile, breakpoint } = useResponsive()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/cleanup/stats',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setStats(res.data.data)
      }
    } catch (error) {
      console.error('获取清理统计失败:', error)
      Taro.showToast({
        title: '获取数据失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = () => {
    Taro.showModal({
      title: '确认清理',
      content: '确定要清理过期和无效数据吗？此操作不可撤销。',
      success: async (res) => {
        if (res.confirm) {
          setCleaning(true)
          try {
            const res = await Network.request({
              url: '/api/cleanup/execute',
              method: 'POST'
            })
            if (res.data.code === 200) {
              Taro.showToast({
                title: '清理完成',
                icon: 'success'
              })
              fetchStats()
            }
          } catch (error) {
            console.error('清理失败:', error)
            Taro.showToast({
              title: '清理失败',
              icon: 'none'
            })
          } finally {
            setCleaning(false)
          }
        }
      }
    })
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <View className={`cleanup-page min-h-screen bg-gray-50 pb-20 ${responsive.padding[breakpoint]}`}>
      <View className="mb-6">
        <Text className={`block ${responsive.text['2xl']} font-bold text-gray-800 mb-2`}>数据清理</Text>
        <Text className={`block ${responsive.text.md} text-gray-500`}>清理过期和无效数据，优化系统性能</Text>
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-20">
          <Text className={`block ${responsive.text.sm} text-gray-500`}>加载中...</Text>
        </View>
      ) : stats ? (
        <View className={`space-y-4 ${responsive.gap[breakpoint]}`}>
          <View className={`bg-white rounded-2xl ${responsive.padding.lg} shadow-sm`}>
            <Text className={`block ${responsive.text.lg} font-semibold text-gray-800 mb-4`}>清理统计</Text>
            <View className={`space-y-3 ${responsive.gap[breakpoint]}`}>
              <View className="flex justify-between items-center py-3 border-b border-gray-100">
                <Text className={`${responsive.text.md} text-gray-600`}>过期卡券</Text>
                <Text className={`${responsive.text.xl} font-bold text-orange-600`}>{stats.expiredCoupons} 条</Text>
              </View>
              <View className="flex justify-between items-center py-3 border-b border-gray-100">
                <Text className={`${responsive.text.md} text-gray-600`}>无效客户</Text>
                <Text className={`${responsive.text.xl} font-bold text-red-600`}>{stats.invalidCustomers} 条</Text>
              </View>
              <View className="flex justify-between items-center py-3 border-b border-gray-100">
                <Text className={`${responsive.text.md} text-gray-600`}>无效订单</Text>
                <Text className={`${responsive.text.xl} font-bold text-red-600`}>{stats.invalidOrders} 条</Text>
              </View>
              <View className="flex justify-between items-center py-3">
                <Text className={`${responsive.text.md} text-gray-600`}>数据总大小</Text>
                <Text className={`${responsive.text.xl} font-bold text-blue-600`}>{formatSize(stats.totalDataSize)}</Text>
              </View>
            </View>
          </View>

          <View className={`bg-white rounded-2xl ${responsive.padding.lg} shadow-sm`}>
            <Text className={`block ${responsive.text.lg} font-semibold text-gray-800 mb-4`}>清理说明</Text>
            <View className={`space-y-3 ${responsive.gap[breakpoint]}`}>
              <View className="flex items-start">
                <Text className={`${responsive.text.lg} mr-3`}>🧹</Text>
                <View className="flex-1">
                  <Text className={`block ${responsive.text.md} text-gray-800 font-semibold mb-1`}>过期卡券</Text>
                  <Text className={`block ${responsive.text.sm} text-gray-500`}>清理已过期但状态未更新的卡券</Text>
                </View>
              </View>
              <View className="flex items-start">
                <Text className={`${responsive.text.lg} mr-3`}>👥</Text>
                <View className="flex-1">
                  <Text className={`block ${responsive.text.md} text-gray-800 font-semibold mb-1`}>无效客户</Text>
                  <Text className={`block ${responsive.text.sm} text-gray-500`}>清理关联用户账号已删除的客户记录</Text>
                </View>
              </View>
              <View className="flex items-start">
                <Text className={`${responsive.text.lg} mr-3`}>📝</Text>
                <View className="flex-1">
                  <Text className={`block ${responsive.text.md} text-gray-800 font-semibold mb-1`}>无效订单</Text>
                  <Text className={`block ${responsive.text.sm} text-gray-500`}>清理关联客户已不存在的订单记录</Text>
                </View>
              </View>
            </View>
          </View>

          <View className={`bg-yellow-50 rounded-2xl ${responsive.padding.lg} border border-yellow-200`}>
            <View className="flex items-start">
              <Text className={`${responsive.text['2xl']} mr-3`}>⚠️</Text>
              <View className="flex-1">
                <Text className={`block ${responsive.text.md} text-gray-800 font-semibold mb-2`}>注意事项</Text>
                <Text className={`block ${responsive.text.sm} text-gray-600`}>
                  清理操作不可撤销，请谨慎操作。建议在执行清理前先备份数据。
                </Text>
              </View>
            </View>
          </View>

          <Button
            className={`w-full bg-red-600 text-white rounded-xl py-4 ${responsive.text.md} font-semibold`}
            onClick={handleCleanup}
            disabled={cleaning || (stats.expiredCoupons === 0 && stats.invalidCustomers === 0 && stats.invalidOrders === 0)}
          >
            {cleaning ? '清理中...' : '🧹 开始清理'}
          </Button>

          <Button
            className={`w-full bg-blue-600 text-white rounded-xl py-4 ${responsive.text.md} font-semibold`}
            onClick={fetchStats}
            disabled={loading}
          >
            🔄 刷新统计
          </Button>
        </View>
      ) : (
        <View className="flex flex-col items-center justify-center py-20">
          <Text className={`block text-7xl mb-6`}>📊</Text>
          <Text className={`block ${responsive.text.xl} font-semibold text-gray-600 mb-3`}>暂无数据</Text>
          <Text className={`block ${responsive.text.md} text-gray-400`}>点击刷新按钮获取统计信息</Text>
        </View>
      )}

      <CustomTabBar />
    </View>
  )
}
