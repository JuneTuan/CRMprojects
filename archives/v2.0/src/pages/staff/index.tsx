import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'
import { useResponsive, responsive } from '@/utils/responsive'

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [formData, setFormData] = useState({ username: '', password: '', name: '' })
  const [searchKeyword, setSearchKeyword] = useState('')
  const { isMobile, breakpoint } = useResponsive()

  const fetchStaffList = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/staff',
        method: 'GET'
      })
      if (res.data.code === 200) {
        setStaffList(res.data.data || [])
      }
    } catch (error) {
      console.error('获取员工列表失败:', error)
      Taro.showToast({ title: '获取员工列表失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
  }

  const handleAdd = () => {
    setEditingStaff(null)
    setFormData({ username: '', password: '', name: '' })
    setShowForm(true)
  }

  const handleEdit = (staff: any) => {
    setEditingStaff(staff)
    setFormData({ username: staff.username, password: '', name: staff.name })
    setShowForm(true)
  }

  const handleDelete = (staff: any) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除员工 ${staff.name} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/staff/${staff.id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchStaffList()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleToggleStatus = async (staff: any) => {
    try {
      await Network.request({
        url: `/api/staff/${staff.id}/toggle`,
        method: 'PUT'
      })
      Taro.showToast({ title: '状态更新成功', icon: 'success' })
      fetchStaffList()
    } catch (error) {
      Taro.showToast({ title: '状态更新失败', icon: 'none' })
    }
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.name) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    if (!editingStaff && !formData.password) {
      Taro.showToast({ title: '请设置密码', icon: 'none' })
      return
    }

    try {
      if (editingStaff) {
        await Network.request({
          url: `/api/staff/${editingStaff.id}`,
          method: 'PUT',
          data: formData
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await Network.request({
          url: '/api/staff',
          method: 'POST',
          data: formData
        })
        Taro.showToast({ title: '创建成功', icon: 'success' })
      }
      setShowForm(false)
      fetchStaffList()
    } catch (error: any) {
      Taro.showToast({ title: error.message || '操作失败', icon: 'none' })
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员'
      case 'staff':
        return '员工'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700'
      case 'staff':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  useEffect(() => {
    fetchStaffList()
  }, [])

  if (showForm) {
    return (
      <View className={`staff-form-page min-h-screen bg-gray-50 pb-20 ${responsive.padding[breakpoint]}`}>
        <View className={`bg-white rounded-2xl ${responsive.padding.lg} shadow-sm`}>
          <View className="flex items-center mb-6">
            <Button onClick={() => setShowForm(false)} size="mini">返回</Button>
            <Text className={`ml-4 ${responsive.text.xl} font-bold text-gray-800`}>
              {editingStaff ? '编辑员工' : '添加员工'}
            </Text>
          </View>

          <View className={`space-y-4 ${responsive.gap[breakpoint]}`}>
            <View>
              <Text className={`block ${responsive.text.sm} font-semibold text-gray-700 mb-2`}>用户名</Text>
              <Input
                className={`w-full bg-gray-50 rounded-xl ${responsive.paddingX.md} ${responsive.paddingY.md}`}
                placeholder="请输入用户名"
                value={formData.username}
                onInput={(e) => setFormData({ ...formData, username: e.detail.value })}
              />
            </View>

            <View>
              <Text className={`block ${responsive.text.sm} font-semibold text-gray-700 mb-2`}>姓名</Text>
              <Input
                className={`w-full bg-gray-50 rounded-xl ${responsive.paddingX.md} ${responsive.paddingY.md}`}
                placeholder="请输入姓名"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>

            <View>
              <Text className={`block ${responsive.text.sm} font-semibold text-gray-700 mb-2`}>
                密码{editingStaff ? '（留空不修改）' : ''}
              </Text>
              <Input
                className={`w-full bg-gray-50 rounded-xl ${responsive.paddingX.md} ${responsive.paddingY.md}`}
                password
                placeholder={editingStaff ? '留空不修改密码' : '请输入密码'}
                value={formData.password}
                onInput={(e) => setFormData({ ...formData, password: e.detail.value as any })}
              />
            </View>

            <Button
              type="primary"
              className={`w-full bg-red-600 text-white rounded-xl py-3 mt-6 ${responsive.button.md}`}
              onClick={handleSubmit}
            >
              {editingStaff ? '更新' : '创建'}
            </Button>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={`staff-page min-h-screen bg-gray-50 pb-20 ${responsive.padding[breakpoint]}`}>
      <View className="flex justify-between items-center mb-4">
        <Text className={`${responsive.text.xl} font-bold text-gray-800`}>员工管理</Text>
        <View className={`flex gap-2 ${responsive.gap.sm}`}>
          <Button
            className={`bg-red-600 text-white rounded-lg ${responsive.button.sm}`}
            onClick={handleAdd}
          >
            添加员工
          </Button>
          <Button
            className={`bg-orange-500 text-white rounded-lg ${responsive.button.sm}`}
            onClick={fetchStaffList}
          >
            刷新
          </Button>
        </View>
      </View>

      <View className={`bg-white rounded-2xl ${responsive.padding.md} mb-4 shadow-sm`}>
        <Input
          className={`w-full bg-gray-50 rounded-xl ${responsive.paddingX.md} ${responsive.paddingY.md}`}
          placeholder="搜索员工姓名或用户名"
          value={searchKeyword}
          onInput={(e) => handleSearch(e.detail.value)}
        />
      </View>

      {loading ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-sm text-gray-500">加载中...</Text>
        </View>
      ) : staffList.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16">
          <Text className="block text-6xl mb-4">👔</Text>
          <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无员工</Text>
          <Text className="block text-sm text-gray-400">点击"添加员工"按钮添加新员工</Text>
        </View>
      ) : (
        <View className={`space-y-3 ${responsive.gap.sm}`}>
          {staffList
            .filter(staff => {
              if (!searchKeyword.trim()) return true
              const keyword = searchKeyword.toLowerCase()
              return (
                staff.name?.toLowerCase().includes(keyword) ||
                staff.username?.toLowerCase().includes(keyword)
              )
            })
            .map((staff) => (
              <View
                key={staff.id}
                className={`bg-white rounded-xl ${responsive.padding.md} shadow-sm`}
              >
                <View className="flex justify-between items-start">
                  <View className="flex-1">
                    <View className={`flex items-center ${responsive.gap.sm} mb-2`}>
                      <Text className={`${responsive.text.lg} font-bold text-gray-800`}>
                        {staff.name}
                      </Text>
                      <View className={`px-2 py-1 rounded-lg ${responsive.text.xs} font-semibold ${getRoleColor(staff.role)}`}>
                        {getRoleText(staff.role)}
                      </View>
                    </View>
                    <Text className={`block ${responsive.text.sm} text-gray-600 mb-1`}>
                      用户名：{staff.username}
                    </Text>
                    <Text className={`block ${responsive.text.xs} text-gray-400`}>
                      创建时间：{new Date(staff.createdAt).toLocaleString('zh-CN')}
                    </Text>
                  </View>
                  <View className={`flex flex-col ${responsive.gap.sm} ml-4`}>
                    <Button
                      size="mini"
                      type="default"
                      onClick={() => handleToggleStatus(staff)}
                    >
                      {staff.isActive ? '禁用' : '启用'}
                    </Button>
                    <Button
                      size="mini"
                      type="default"
                      onClick={() => handleEdit(staff)}
                    >
                      编辑
                    </Button>
                    {staff.role !== 'admin' && (
                      <Button
                        size="mini"
                        type="warn"
                        onClick={() => handleDelete(staff)}
                      >
                        删除
                      </Button>
                    )}
                  </View>
                </View>
              </View>
            ))}
        </View>
      )}

      <CustomTabBar />
    </View>
  )
}
