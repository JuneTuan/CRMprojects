import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.username) {
      Taro.showToast({ title: '请输入用户名', icon: 'none' })
      return false
    }
    if (formData.username.length < 3) {
      Taro.showToast({ title: '用户名至少3个字符', icon: 'none' })
      return false
    }
    if (!formData.password) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return false
    }
    if (formData.password.length < 6) {
      Taro.showToast({ title: '密码至少6个字符', icon: 'none' })
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return false
    }
    if (!formData.name) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return false
    }
    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      console.log('开始注册请求...', formData)

      const res = await Network.request({
        url: '/api/auth/register',
        method: 'POST',
        data: {
          username: formData.username,
          password: formData.password,
          name: formData.name,
          role: 'customer', // 默认注册为客户角色
          phone: formData.phone
        }
      })

      console.log('注册响应:', res)

      if (res.data.code === 200) {
        Taro.showToast({ title: '注册成功', icon: 'success' })

        // 注册成功后自动登录
        setTimeout(() => {
          // 保存登录信息
          Taro.setStorageSync('token', res.data.data.token)
          Taro.setStorageSync('userInfo', res.data.data.user)

          Taro.showToast({ title: '登录成功', icon: 'success' })

          // 跳转到抽奖页面
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/index/index' })
          }, 1000)
        }, 1000)
      } else {
        Taro.showToast({ title: res.data.msg || '注册失败', icon: 'none' })
      }
    } catch (error: any) {
      console.error('注册错误:', error)
      Taro.showToast({ title: error.message || '网络错误，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    Taro.navigateBack()
  }

  return (
    <View className="register-page min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center">
      <View className="mb-8">
        <Text className="block text-6xl mb-3">🧧</Text>
        <Text className="block text-2xl font-bold text-white">用户注册</Text>
        <Text className="block text-sm text-red-100 mt-2">注册成为客户，参与抽奖赢大奖</Text>
      </View>

      <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <View className="mb-4">
          <Text className="block text-sm font-semibold text-gray-800 mb-2">用户名 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent text-base outline-none"
              placeholder="请输入用户名（至少3个字符）"
              value={formData.username}
              onInput={(e) => handleInputChange('username', e.detail.value)}
              disabled={loading}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="block text-sm font-semibold text-gray-800 mb-2">姓名 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent text-base outline-none"
              placeholder="请输入真实姓名"
              value={formData.name}
              onInput={(e) => handleInputChange('name', e.detail.value)}
              disabled={loading}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="block text-sm font-semibold text-gray-800 mb-2">手机号</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent text-base outline-none"
              type="number"
              placeholder="请输入手机号（选填）"
              value={formData.phone}
              onInput={(e) => handleInputChange('phone', e.detail.value)}
              disabled={loading}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="block text-sm font-semibold text-gray-800 mb-2">密码 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent text-base outline-none"
              password
              placeholder="请输入密码（至少6个字符）"
              value={formData.password}
              onInput={(e) => handleInputChange('password', e.detail.value)}
              disabled={loading}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="block text-sm font-semibold text-gray-800 mb-2">确认密码 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent text-base outline-none"
              password
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onInput={(e) => handleInputChange('confirmPassword', e.detail.value)}
              disabled={loading}
            />
          </View>
        </View>

        <Button
          className={`w-full rounded-xl py-3 font-semibold ${
            loading ? 'bg-gray-400 text-gray-200' : 'bg-red-600 text-white active:bg-red-700'
          }`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? '注册中...' : '注册'}
        </Button>

        <View className="mt-4 flex justify-between items-center">
          <Text className="text-xs text-gray-400">注册即表示同意用户协议</Text>
          <Text
            className="text-xs text-red-600"
            onClick={handleBackToLogin}
          >
            已有账号？去登录
          </Text>
        </View>
      </View>

      <View className="mt-6">
        <Text className="text-xs text-red-200">春节快乐 · 万事如意</Text>
      </View>
    </View>
  )
}
