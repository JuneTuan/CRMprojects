import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { FormValidator, commonRules } from '@/utils/validator'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validator = new FormValidator({
    username: [
      {
        required: true,
        message: '请输入用户名'
      },
      {
        minLength: 2,
        message: '用户名长度不能少于2位'
      }
    ],
    password: [
      {
        required: true,
        message: '请输入密码'
      },
      {
        minLength: 6,
        message: '密码长度不能少于6位'
      }
    ]
  })

  const validateUsername = (value: string) => {
    validator.setFieldValue('username', value)
    const isValid = validator.validateField('username')
    setUsernameError(validator.getFieldError('username') || '')
    return isValid
  }

  const validatePassword = (value: string) => {
    validator.setFieldValue('password', value)
    const isValid = validator.validateField('password')
    setPasswordError(validator.getFieldError('password') || '')
    return isValid
  }

  const handleUsernameChange = (e: any) => {
    const value = e.currentTarget.value
    setUsername(value)
    if (value) {
      validateUsername(value)
    } else {
      setUsernameError('')
    }
  }

  const handlePasswordChange = (e: any) => {
    const value = e.currentTarget.value
    setPassword(value)
    if (value) {
      validatePassword(value)
    } else {
      setPasswordError('')
    }
  }

  const handleLogin = async () => {
    const isUsernameValid = validateUsername(username)
    const isPasswordValid = validatePassword(password)

    if (!isUsernameValid || !isPasswordValid) {
      Taro.showToast({ title: '请检查输入信息', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      console.log('开始登录请求...')
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { username, password }
      })

      console.log('登录响应:', res)

      if (res.data.code === 200) {
        Taro.setStorageSync('token', res.data.data.token)
        Taro.setStorageSync('userInfo', res.data.data.user)

        const role = res.data.data.user.role

        Taro.showToast({ title: '登录成功', icon: 'success' })

        setTimeout(() => {
          if (role === 'customer') {
            Taro.reLaunch({ url: '/pages/index/index' })
          } else {
            Taro.reLaunch({ url: '/pages/customer/index' })
          }
        }, 1000)
      } else {
        Taro.showToast({ title: res.data.msg || '登录失败', icon: 'none' })
      }
    } catch (error: any) {
      console.error('登录错误:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center">
      <View className="mb-10">
        <Text className="block text-7xl mb-4">🧧</Text>
        <Text className="block text-3xl font-bold text-white">春节幸运大转盘</Text>
        <Text className="block text-base text-red-100 mt-3">小店客户管理系统</Text>
      </View>

      <View className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-lg">
        <View className="mb-5">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">用户名</Text>
          <View className={`bg-gray-50 rounded-xl px-5 py-4 ${usernameError ? 'border-2 border-red-500' : ''}`}>
            <input
              className="w-full bg-transparent text-lg outline-none"
              placeholder="请输入用户名"
              value={username}
              onInput={handleUsernameChange}
              disabled={loading}
            />
          </View>
          {usernameError && (
            <Text className="block text-sm text-red-500 mt-2">{usernameError}</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">密码</Text>
          <View className={`bg-gray-50 rounded-xl px-5 py-4 ${passwordError ? 'border-2 border-red-500' : ''}`}>
            <input
              className="w-full bg-transparent text-lg outline-none"
              type="password"
              placeholder="请输入密码"
              value={password}
              onInput={handlePasswordChange}
              disabled={loading}
            />
          </View>
          {passwordError && (
            <Text className="block text-sm text-red-500 mt-2">{passwordError}</Text>
          )}
        </View>

        <button
          className={`w-full rounded-xl py-4 text-lg font-semibold ${
            loading ? 'bg-gray-400 text-gray-200' : 'bg-red-600 text-white active:bg-red-700'
          }`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </button>

        <View className="mt-6 flex justify-between items-center">
          <Text className="text-sm text-gray-400">默认账号: admin / 密码: 123456</Text>
          <Text
            className="text-sm text-red-600 font-semibold"
            onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}
          >
            去注册
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-sm text-red-200">春节快乐 · 万事如意</Text>
      </View>
    </View>
  )
}
