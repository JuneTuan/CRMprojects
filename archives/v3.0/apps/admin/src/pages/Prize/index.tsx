import React, { useEffect, useState } from 'react'
import api from '@utils/api'

export default function Prize() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrizes()
  }, [])

  const fetchPrizes = async () => {
    try {
      const res = await api.get('/prizes')
      setPrizes(res || [])
    } catch (error) {
      console.error('获取奖品列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">奖品管理</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">奖品名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">描述</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">类型</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">价值</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">数量</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">剩余</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">概率</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize) => (
              <tr key={prize.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{prize.name}</td>
                <td className="px-6 py-4 text-gray-600">{prize.description}</td>
                <td className="px-6 py-4 text-gray-600">{prize.type}</td>
                <td className="px-6 py-4 text-gray-600">¥{prize.value}</td>
                <td className="px-6 py-4 text-gray-600">{prize.quantity}</td>
                <td className="px-6 py-4 text-gray-600">{prize.remainingQuantity}</td>
                <td className="px-6 py-4 text-gray-600">{(prize.probability * 100).toFixed(2)}%</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    prize.status === '可用' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {prize.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(prize.createdAt).toLocaleString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {prizes.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无奖品数据</div>
        )}
      </div>
    </div>
  )
}