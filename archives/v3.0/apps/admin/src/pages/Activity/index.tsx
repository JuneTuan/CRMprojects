import React, { useEffect, useState } from 'react'
import api from '@utils/api'

export default function Activity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities')
      setActivities(res || [])
    } catch (error) {
      console.error('获取活动列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">活动管理</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">活动名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">描述</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">开始时间</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">结束时间</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">游戏数量</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{activity.name}</td>
                <td className="px-6 py-4 text-gray-600">{activity.description}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(activity.startTime).toLocaleString('zh-CN')}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(activity.endTime).toLocaleString('zh-CN')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    activity.status === '进行中' ? 'bg-green-100 text-green-800' : 
                    activity.status === '未开始' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{activity.activityGames?.length || 0}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(activity.createdAt).toLocaleString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无活动数据</div>
        )}
      </div>
    </div>
  )
}