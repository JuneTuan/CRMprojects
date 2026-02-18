import React, { useEffect, useState } from 'react'
import api from '@utils/api'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">数据看板</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">总客户数</span>
            <span className="text-3xl">👤</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats?.customers?.total || 0}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">总订单数</span>
            <span className="text-3xl">📝</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats?.orders?.total || 0}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">总销售额</span>
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">¥{stats?.orders?.revenue?.toFixed(2) || '0.00'}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">抽奖次数</span>
            <span className="text-3xl">🎰</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats?.lottery?.totalRecords || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">产品总数</span>
            <span className="text-3xl">📦</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats?.products?.total || 0}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">优惠券总数</span>
            <span className="text-3xl">🎫</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats?.coupons?.total || 0}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">活动总数</span>
            <span className="text-3xl">🎉</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats?.activities?.total || 0}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">进行中活动</span>
            <span className="text-3xl">🔥</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{stats?.activities?.active || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">系统状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">服务器运行正常</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">数据库连接正常</span>
          </div>
        </div>
      </div>
    </div>
  )
}
