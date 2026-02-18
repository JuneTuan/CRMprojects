import { ref } from 'vue'
import { authAPI } from '@/api/index.js'

const user = ref(null)
const token = ref('')

export const useUserStore = () => {
  const login = async (username, password) => {
    try {
      const res = await authAPI.login({ username, password })
      token.value = res.access_token
      user.value = res.user
      
      console.log('登录成功，保存用户信息:', res.user)
      console.log('用户ID:', res.user.id, '类型:', typeof res.user.id)
      
      uni.setStorageSync('token', res.access_token)
      uni.setStorageSync('user', res.user)
      
      return res
    } catch (error) {
      throw error
    }
  }
  
  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData)
      return res
    } catch (error) {
      throw error
    }
  }
  
  const logout = () => {
    token.value = ''
    user.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('user')
  }
  
  const initUser = () => {
    const savedToken = uni.getStorageSync('token')
    const savedUser = uni.getStorageSync('user')
    console.log('初始化用户信息:', { savedToken, savedUser })
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = savedUser
      console.log('用户信息已加载:', user.value)
      console.log('用户ID:', user.value.id)
      console.log('用户ID类型:', typeof user.value.id)
      
      if (!user.value.id || isNaN(user.value.id)) {
        console.error('用户ID无效，清除存储')
        logout()
      }
    }
  }
  
  return {
    user,
    token,
    login,
    register,
    logout,
    initUser
  }
}