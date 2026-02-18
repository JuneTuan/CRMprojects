import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/dashboard', label: '数据看板', icon: '📊' },
  { path: '/customer', label: '客户管理', icon: '👤' },
  { path: '/staff', label: '员工管理', icon: '👔' },
  { path: '/activity', label: '活动管理', icon: '🎪' },
  { path: '/product', label: '产品管理', icon: '📦' },
  { path: '/order', label: '订单管理', icon: '📝' },
  { path: '/prize', label: '奖品管理', icon: '🎁' },
  { path: '/coupon', label: '卡券管理', icon: '🧧' },
  { path: '/import', label: '批量导入', icon: '📥' },
  { path: '/cleanup', label: '数据清理', icon: '🧹' }
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-red-600 text-white min-h-screen fixed left-0 top-0">
        <div className="p-6 border-b border-red-700">
          <h1 className="text-2xl font-bold">CRM管理后台</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-red-700 text-white'
                      : 'hover:bg-red-700 text-red-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}
