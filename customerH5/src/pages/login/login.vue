<template>
  <view class="login-container">
    <view class="login-header">
      <text class="title">欢迎登录</text>
      <text class="subtitle">客户中心</text>
    </view>
    
    <view class="login-form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="formData.username" 
          placeholder="请输入用户名"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          v-model="formData.password" 
          type="password"
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <button class="login-btn" @click="handleLogin" :loading="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
      <view class="register-link">
        <text>还没有账号？</text>
        <text class="link" @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user.js'

const formData = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const userStore = useUserStore()

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.options) {
    if (currentPage.options.username) {
      formData.value.username = decodeURIComponent(currentPage.options.username)
    }
    if (currentPage.options.password) {
      formData.value.password = decodeURIComponent(currentPage.options.password)
    }
  }
})

const handleLogin = async () => {
  if (!formData.value.username || !formData.value.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  try {
    await userStore.login(formData.value.username, formData.value.password)
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1000)
  } catch (error) {
    console.error('登录失败:', error)
    let errorMessage = '登录失败'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.data?.message) {
      errorMessage = error.data.message
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 20rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  display: block;
  font-size: 32rpx;
  color: var(--text-secondary);
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  padding: 60rpx 40rpx;
  box-shadow: var(--shadow-lg);
  border: 2rpx solid var(--border-color);
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: var(--text-primary);
  margin-bottom: 16rpx;
  font-weight: bold;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  border: 2rpx solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: var(--card-background);
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4rpx rgba(231, 76, 60, 0.1);
}

.placeholder {
  color: var(--text-secondary);
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background-color: var(--primary-color);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 4rpx solid var(--primary-dark);
}

.login-btn:active {
  background-color: var(--primary-dark);
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.login-btn:disabled {
  background-color: #666;
  border-color: #888;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: var(--text-secondary);
}

.link {
  color: var(--primary-color);
  margin-left: 10rpx;
  font-weight: bold;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .login-container {
    padding: 40rpx 20rpx;
  }
  
  .login-form {
    padding: 40rpx 30rpx;
  }
  
  .title {
    font-size: 40rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
  }
  
  .input {
    height: 80rpx;
    font-size: 26rpx;
  }
  
  .login-btn {
    height: 80rpx;
    font-size: 28rpx;
  }
}

/* 动画效果 */
.login-container {
  animation: fadeIn 0.6s ease-out;
}

.login-form {
  animation: slideInUp 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>