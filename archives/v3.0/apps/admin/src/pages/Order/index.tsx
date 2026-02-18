import React, { useEffect, useState } from 'react'
import api from '@utils/api'

export default function Order() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders')
      setOrders(res || [])
    } catch (error) {
      console.error('获取订单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">订单管理</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">订单号</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">客户</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">订单金额</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">实际金额</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">支付方式</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{order.orderNo}</td>
                <td className="px-6 py-4 text-gray-600">{order.customer?.name || '-'}</td>
                <td className="px-6 py-4 text-gray-600">¥{order.totalAmount}</td>
                <td className="px-6 py-4 text-gray-600">¥{order.actualAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === '已完成' ? 'bg-green-100 text-green-800' : 
                    order.status === '待支付' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{order.paymentMethod}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(order.createdAt).toLocaleString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无订单数据</div>
        )}
      </div>
    </div>
  )
}