import React, { useEffect, useState } from 'react'
import api from '@utils/api'

export default function Product() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res || [])
    } catch (error) {
      console.error('获取产品列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">产品管理</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">产品名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">描述</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">价格</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">库存</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{product.name}</td>
                <td className="px-6 py-4 text-gray-600">{product.description}</td>
                <td className="px-6 py-4 text-gray-600">¥{product.price}</td>
                <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    product.status === '上架' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(product.createdAt).toLocaleString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无产品数据</div>
        )}
      </div>
    </div>
  )
}