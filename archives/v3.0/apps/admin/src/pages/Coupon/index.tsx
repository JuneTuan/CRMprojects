import React, { useEffect, useState } from 'react'
import api from '@utils/api'

export default function Coupon() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons')
      setCoupons(res || [])
    } catch (error) {
      console.error('获取优惠券列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">卡券管理</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">优惠券名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">类型</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">优惠金额</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">最低消费</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">总数</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">剩余</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">有效期</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{coupon.name}</td>
                <td className="px-6 py-4 text-gray-600">{coupon.type}</td>
                <td className="px-6 py-4 text-gray-600">¥{coupon.value}</td>
                <td className="px-6 py-4 text-gray-600">¥{coupon.minAmount}</td>
                <td className="px-6 py-4 text-gray-600">{coupon.totalQuantity}</td>
                <td className="px-6 py-4 text-gray-600">{coupon.remainingQuantity}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(coupon.startTime).toLocaleDateString('zh-CN')} - {new Date(coupon.endTime).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    coupon.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {coupon.status ? '有效' : '无效'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无优惠券数据</div>
        )}
      </div>
    </div>
  )
}