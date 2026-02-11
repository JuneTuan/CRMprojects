import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }
    // TODO: 实现登录逻辑
    Taro.showToast({ title: '登录功能开发中', icon: 'none' })
  }

  return (
    <View className="login-page min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center">
      <View className="mb-8">
        <Text className="block text-4xl mb-2">🧧</Text>
        <Text className="block text-2xl font-bold text-white">春节幸运大转盘</Text>
      </View>

      <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <View className="mb-4">
          <Text className="block text-base font-semibold text-gray-800 mb-2">用户名</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <input
              className="w-full bg-transparent text-base outline-none"
              placeholder="请输入用户名"
              value={username}
              onInput={(e) => setUsername(e.currentTarget.value)}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="block text-base font-semibold text-gray-800 mb-2">密码</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <input
              className="w-full bg-transparent text-base outline-none"
              type="password"
              placeholder="请输入密码"
              value={password}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
          </View>
        </View>

        <button
          className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold active:bg-red-700"
          onClick={handleLogin}
        >
          登录
        </button>
      </View>
    </View>
  )
}
