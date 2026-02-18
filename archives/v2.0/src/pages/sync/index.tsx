import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { syncService, SyncResult } from '@/utils/sync-service'
import { offlineStorage } from '@/utils/offline-storage'
import CustomTabBar from '@/components/CustomTabBar'
import { useResponsive, responsive } from '@/utils/responsive'

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<number>(0)
  const { isMobile, breakpoint } = useResponsive()

  useEffect(() => {
    loadSyncStatus()
  }, [])

  const loadSyncStatus = async () => {
    try {
      const count = await syncService.getPendingCount()
      const time = await syncService.getLastSyncTime()
      setPendingCount(count)
      setLastSyncTime(time)
    } catch (error) {
      console.error('获取同步状态失败:', error)
    }
  }

  const handleSync = async () => {
    if (syncing) return

    setSyncing(true)
    setSyncResult(null)

    try {
      const result = await syncService.syncWithRetry(3)
      setSyncResult(result)

      if (result.failed === 0) {
        Taro.showToast({
          title: '同步完成',
          icon: 'success'
        })
      } else {
        Taro.showToast({
          title: `同步完成，${result.failed}条失败`,
          icon: 'none'
        })
      }

      await loadSyncStatus()
    } catch (error: any) {
      console.error('同步失败:', error)
      Taro.showToast({
        title: error.message || '同步失败',
        icon: 'none'
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleClearOfflineData = () => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除所有离线数据吗？此操作不可撤销。',
      success: async (res) => {
        if (res.confirm) {
          try {
            await offlineStorage.clearAll()
            setSyncResult(null)
            await loadSyncStatus()
            Taro.showToast({
              title: '清除成功',
              icon: 'success'
            })
          } catch (error) {
            Taro.showToast({
              title: '清除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }

  const formatTime = (timestamp: number): string => {
    if (!timestamp) return '从未同步'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleString('zh-CN')
  }

  return (
    <View className={`sync-page min-h-screen bg-gray-50 pb-20 ${responsive.padding[breakpoint]}`}>
      <View className="mb-6">
        <Text className={`block ${responsive.text['2xl']} font-bold text-gray-800 mb-2`}>数据同步</Text>
        <Text className={`block ${responsive.text.md} text-gray-500`}>同步离线数据到服务器</Text>
      </View>

      <View className={`bg-white rounded-2xl ${responsive.padding.lg} shadow-sm mb-6`}>
        <Text className={`block ${responsive.text.lg} font-semibold text-gray-800 mb-4`}>同步状态</Text>
        <View className={`space-y-3 ${responsive.gap[breakpoint]}`}>
          <View className="flex justify-between items-center py-3 border-b border-gray-100">
            <Text className={`${responsive.text.md} text-gray-600`}>待同步操作</Text>
            <Text className={`${responsive.text.xl} font-bold text-orange-600`}>{pendingCount} 条</Text>
          </View>
          <View className="flex justify-between items-center py-3">
            <Text className={`${responsive.text.md} text-gray-600`}>上次同步时间</Text>
            <Text className={`${responsive.text.md} text-gray-800`}>{formatTime(lastSyncTime)}</Text>
          </View>
        </View>
      </View>

      <View className={`space-y-4 ${responsive.gap[breakpoint]}`}>
        <Button
          className={`w-full bg-red-600 text-white rounded-xl py-4 ${responsive.text.md} font-semibold`}
          onClick={handleSync}
          disabled={syncing || pendingCount === 0}
        >
          {syncing ? '同步中...' : pendingCount === 0 ? '📱 无需同步' : '🔄 开始同步'}
        </Button>

        <Button
          className={`w-full bg-gray-200 text-gray-700 rounded-xl py-4 ${responsive.text.md} font-semibold`}
          onClick={loadSyncStatus}
          disabled={syncing}
        >
          🔄 刷新状态
        </Button>
      </View>

      {syncResult && (
        <View className={`mt-6 bg-white rounded-2xl ${responsive.padding.lg} shadow-sm`}>
          <Text className={`block ${responsive.text.lg} font-semibold text-gray-800 mb-4`}>同步结果</Text>
          <View className={`space-y-3 ${responsive.gap[breakpoint]}`}>
            <View className="flex justify-between items-center py-3 border-b border-gray-100">
              <Text className={`${responsive.text.md} text-gray-600`}>成功同步</Text>
              <Text className={`${responsive.text.xl} font-bold text-green-600`}>{syncResult.success} 条</Text>
            </View>
            <View className="flex justify-between items-center py-3 border-b border-gray-100">
              <Text className={`${responsive.text.md} text-gray-600`}>同步失败</Text>
              <Text className={`${responsive.text.xl} font-bold text-red-600`}>{syncResult.failed} 条</Text>
            </View>
            {syncResult.errors && syncResult.errors.length > 0 && (
              <View className="mt-4">
                <Text className={`block ${responsive.text.md} font-semibold text-gray-800 mb-2`}>错误详情</Text>
                <View className="bg-red-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                  {syncResult.errors.map((error, index) => (
                    <Text key={index} className={`block ${responsive.text.sm} text-red-600 mb-2`}>
                      {error}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      <View className={`mt-6 bg-yellow-50 rounded-2xl ${responsive.padding.lg} border border-yellow-200`}>
        <View className="flex items-start">
          <Text className={`${responsive.text['2xl']} mr-3`}>💡</Text>
          <View className="flex-1">
            <Text className={`block ${responsive.text.md} text-gray-800 font-semibold mb-2`}>使用说明</Text>
            <Text className={`block ${responsive.text.sm} text-gray-600`}>
              离线模式下创建、修改或删除的数据会暂存在本地，联网后点击"开始同步"即可将数据上传到服务器。
            </Text>
          </View>
        </View>
      </View>

      <View className={`mt-4 bg-red-50 rounded-2xl ${responsive.padding.lg} border border-red-200`}>
        <View className="flex items-start">
          <Text className={`${responsive.text['2xl']} mr-3`}>⚠️</Text>
          <View className="flex-1">
            <Text className={`block ${responsive.text.md} text-gray-800 font-semibold mb-2`}>危险操作</Text>
            <Button
              className={`w-full bg-red-600 text-white rounded-xl py-3 ${responsive.text.sm} font-semibold`}
              onClick={handleClearOfflineData}
            >
              清除所有离线数据
            </Button>
          </View>
        </View>
      </View>

      <CustomTabBar />
    </View>
  )
}
