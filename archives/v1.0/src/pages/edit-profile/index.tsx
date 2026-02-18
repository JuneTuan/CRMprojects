import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'

export default function EditProfilePage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'password'>('basic')

  useEffect(() => {
    const init = async () => {
      // 获取用户信息
      const user = Taro.getStorageSync('userInfo')
      if (user) {
        setUserInfo(user)
        setFormData(prev => ({ ...prev, name: user.name }))

        // 获取关联的客户
        try {
          const res = await Network.request({
            url: '/api/customer',
            method: 'GET'
          })
          if (res.data.code === 200) {
            const customers = res.data.data || []
            if (customers.length > 0) {
              setCustomer(customers[0])
              setFormData(prev => ({ ...prev, phone: customers[0].phone || '' }))
            }
          }
        } catch (error) {
          console.error('获取客户信息失败:', error)
        }
      }
    }
    init()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 保存基本信息
  const handleSaveBasic = async () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 更新用户信息
      const userRes = await Network.request({
        url: `/api/customer/${customer.id}`,
        method: 'PUT',
        data: {
          name: formData.name,
          phone: formData.phone
        }
      })

      if (userRes.data.code === 200) {
        // 更新本地存储
        const updatedUser = { ...userInfo, name: formData.name }
        Taro.setStorageSync('userInfo', updatedUser)
        setUserInfo(updatedUser)

        Taro.showToast({ title: '保存成功', icon: 'success' })
      }
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 修改密码
  const handleChangePassword = async () => {
    if (!formData.oldPassword) {
      Taro.showToast({ title: '请输入原密码', icon: 'none' })
      return
    }
    if (!formData.newPassword) {
      Taro.showToast({ title: '请输入新密码', icon: 'none' })
      return
    }
    if (formData.newPassword.length < 6) {
      Taro.showToast({ title: '新密码至少6个字符', icon: 'none' })
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 注意：这里需要后端提供修改密码的接口
      // 暂时提示用户联系管理员修改密码
      Taro.showModal({
        title: '提示',
        content: '修改密码功能需要联系管理员或提供后端接口支持',
        showCancel: false
      })
    } catch (error) {
      console.error('修改密码失败:', error)
      Taro.showToast({ title: '修改密码失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="edit-profile-page min-h-screen bg-gray-50 p-4 pb-20">
      <View className="flex justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">个人资料管理</Text>
      </View>

      {/* Tab切换 */}
      <View className="flex mb-6 bg-white rounded-xl p-1">
        <View
          className={`flex-1 text-center py-2 rounded-lg ${
            activeTab === 'basic' ? 'bg-red-600 text-white' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('basic')}
        >
          基本信息
        </View>
        <View
          className={`flex-1 text-center py-2 rounded-lg ${
            activeTab === 'password' ? 'bg-red-600 text-white' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('password')}
        >
          修改密码
        </View>
      </View>

      {activeTab === 'basic' ? (
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">用户名</Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="block text-base text-gray-600">
                {userInfo?.username || '-'}
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">姓名 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent text-base outline-none"
                placeholder="请输入姓名"
                value={formData.name}
                onInput={(e) => handleInputChange('name', e.detail.value)}
                disabled={loading}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">手机号</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent text-base outline-none"
                type="number"
                placeholder="请输入手机号"
                value={formData.phone}
                onInput={(e) => handleInputChange('phone', e.detail.value)}
                disabled={loading}
              />
            </View>
          </View>

          <Button
            className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold"
            onClick={handleSaveBasic}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </View>
      ) : (
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">原密码 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent text-base outline-none"
                password
                placeholder="请输入原密码"
                value={formData.oldPassword}
                onInput={(e) => handleInputChange('oldPassword', e.detail.value)}
                disabled={loading}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">新密码 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent text-base outline-none"
                password
                placeholder="请输入新密码（至少6个字符）"
                value={formData.newPassword}
                onInput={(e) => handleInputChange('newPassword', e.detail.value)}
                disabled={loading}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-800 mb-2">确认新密码 *</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent text-base outline-none"
                password
                placeholder="请再次输入新密码"
                value={formData.confirmPassword}
                onInput={(e) => handleInputChange('confirmPassword', e.detail.value)}
                disabled={loading}
              />
            </View>
          </View>

          <Button
            className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? '修改中...' : '修改密码'}
          </Button>
        </View>
      )}

      {/* 自定义TabBar */}
      <CustomTabBar />
    </View>
  )
}
