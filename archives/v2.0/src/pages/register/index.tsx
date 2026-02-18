import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { FormValidator, commonRules } from '@/utils/validator'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  })

  const validator = new FormValidator({
    username: [
      {
        required: true,
        message: '请输入用户名'
      },
      {
        minLength: 3,
        message: '用户名至少3个字符'
      }
    ],
    password: [
      {
        required: true,
        message: '请输入密码'
      },
      {
        minLength: 6,
        message: '密码至少6个字符'
      }
    ],
    confirmPassword: [
      {
        required: true,
        message: '请确认密码'
      },
      {
        validator: (value: string) => {
          return value === formData.password || '两次密码不一致'
        }
      }
    ],
    name: [
      {
        required: true,
        message: '请输入姓名'
      }
    ],
    phone: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号'
      }
    ]
  })

  const validateField = (fieldName: string, value: string) => {
    validator.setFieldValue(fieldName, value)
    const isValid = validator.validateField(fieldName)
    const error = validator.getFieldError(fieldName) || ''
    setErrors(prev => ({ ...prev, [fieldName]: error }))
    return isValid
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (value) {
      validateField(field, value)
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    let isValid = true
    for (const field in formData) {
      if (field === 'confirmPassword') {
        validator.setFieldValue('confirmPassword', formData.confirmPassword)
      } else {
        validator.setFieldValue(field, formData[field])
      }
      const fieldValid = validator.validateField(field)
      if (!fieldValid) {
        isValid = false
        const error = validator.getFieldError(field) || ''
        setErrors(prev => ({ ...prev, [field]: error }))
      }
    }
    return isValid
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      Taro.showToast({ title: '请检查输入信息', icon: 'none' })
      return
    }

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
          role: 'customer',
          phone: formData.phone
        }
      })

      console.log('注册响应:', res)

      if (res.data.code === 200) {
        Taro.showToast({ title: '注册成功', icon: 'success' })

        setTimeout(() => {
          Taro.setStorageSync('token', res.data.data.token)
          Taro.setStorageSync('userInfo', res.data.data.user)

          Taro.showToast({ title: '登录成功', icon: 'success' })

          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/index/index' })
          }, 1000)
        }, 1000)
      } else {
        Taro.showToast({ title: res.data.msg || '注册失败', icon: 'none' })
      }
    } catch (error: any) {
      console.error('注册错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    Taro.navigateBack()
  }

  return (
    <View className="register-page min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center">
      <View className="mb-10">
        <Text className="block text-7xl mb-4">🧧</Text>
        <Text className="block text-3xl font-bold text-white">用户注册</Text>
        <Text className="block text-base text-red-100 mt-3">注册成为客户，参与抽奖赢大奖</Text>
      </View>

      <View className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-lg">
        <View className="mb-5">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">用户名 *</Text>
          <View className={`bg-gray-50 rounded-xl px-5 py-4 ${errors.username ? 'border-2 border-red-500' : ''}`}>
            <Input
              className="w-full bg-transparent text-lg outline-none"
              placeholder="请输入用户名（至少3个字符）"
              value={formData.username}
              onInput={(e) => handleInputChange('username', e.detail.value)}
              disabled={loading}
            />
          </View>
          {errors.username && (
            <Text className="block text-sm text-red-500 mt-2">{errors.username}</Text>
          )}
        </View>

        <View className="mb-5">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">姓名 *</Text>
          <View className={`bg-gray-50 rounded-xl px-5 py-4 ${errors.name ? 'border-2 border-red-500' : ''}`}>
            <Input
              className="w-full bg-transparent text-lg outline-none"
              placeholder="请输入真实姓名"
              value={formData.name}
              onInput={(e) => handleInputChange('name', e.detail.value)}
              disabled={loading}
            />
          </View>
          {errors.name && (
            <Text className="block text-sm text-red-500 mt-2">{errors.name}</Text>
          )}
        </View>

        <View className="mb-5">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">手机号</Text>
          <View className={`bg-gray-50 rounded-xl px-5 py-4 ${errors.phone ? 'border-2 border-red-500' : ''}`}>
            <Input
              className="w-full bg-transparent text-lg outline-none"
              type="number"
              placeholder="请输入手机号（选填）"
              value={formData.phone}
              onInput={(e) => handleInputChange('phone', e.detail.value)}
              disabled={loading}
            />
          </View>
          {errors.phone && (
            <Text className="block text-sm text-red-500 mt-2">{errors.phone}</Text>
          )}
        </View>

        <View className="mb-5">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">密码 *</Text>
          <View className={`bg-gray-50 rounded-xl px-5 py-4 ${errors.password ? 'border-2 border-red-500' : ''}`}>
            <Input
              className="w-full bg-transparent text-lg outline-none"
              password
              placeholder="请输入密码（至少6个字符）"
              value={formData.password}
              onInput={(e) => handleInputChange('password', e.detail.value)}
              disabled={loading}
            />
          </View>
          {errors.password && (
            <Text className="block text-sm text-red-500 mt-2">{errors.password}</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">确认密码 *</Text>
          <View className={`bg-gray-50 rounded-xl px-5 py-4 ${errors.confirmPassword ? 'border-2 border-red-500' : ''}`}>
            <Input
              className="w-full bg-transparent text-lg outline-none"
              password
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onInput={(e) => handleInputChange('confirmPassword', e.detail.value)}
              disabled={loading}
            />
          </View>
          {errors.confirmPassword && (
            <Text className="block text-sm text-red-500 mt-2">{errors.confirmPassword}</Text>
          )}
        </View>

        <Button
          className={`w-full rounded-xl py-4 text-lg font-semibold ${
            loading ? 'bg-gray-400 text-gray-200' : 'bg-red-600 text-white active:bg-red-700'
          }`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? '注册中...' : '注册'}
        </Button>

        <View className="mt-6 flex justify-between items-center">
          <Text className="text-sm text-gray-400">注册即表示同意用户协议</Text>
          <Text
            className="text-sm text-red-600"
            onClick={handleBackToLogin}
          >
            已有账号？去登录
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-sm text-red-200">春节快乐 · 万事如意</Text>
      </View>
    </View>
  )
}
