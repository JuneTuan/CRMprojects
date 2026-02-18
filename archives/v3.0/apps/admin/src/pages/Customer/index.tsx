import React, { useEffect, useState } from 'react'
import api from '@utils/api'

export default function Customer() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers')
      setCustomers(res || [])
    } catch (error) {
      console.error('获取客户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">客户管理</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">姓名</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">电话</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">积分</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{customer.name}</td>
                <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                <td className="px-6 py-4 text-gray-600">{customer.points || 0}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(customer.createdAt).toLocaleString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无客户数据</div>
        )}
      </div>
    </div>
  )
}
