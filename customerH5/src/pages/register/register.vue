<template>
  <view class="register-container">
    <view class="register-header">
      <text class="title">注册账号</text>
      <text class="subtitle">加入我们</text>
    </view>
    
    <view class="register-form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="formData.customerCode" 
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
      
      <view class="form-item">
        <text class="label">确认密码</text>
        <input 
          class="input" 
          v-model="formData.confirmPassword" 
          type="password"
          placeholder="请再次输入密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">手机号</text>
        <input 
          class="input" 
          v-model="formData.phone" 
          type="number"
          placeholder="请输入手机号"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">姓名</text>
        <input 
          class="input" 
          v-model="formData.customerName" 
          placeholder="请输入姓名"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="label">邮箱</text>
        <input 
          class="input" 
          v-model="formData.email" 
          type="email"
          placeholder="请输入邮箱"
          placeholder-class="placeholder"
        />
      </view>
      
      <button class="register-btn" @click="handleRegister" :loading="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      
      <view class="login-link">
        <text>已有账号？</text>
        <text class="link" @click="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user.js'

const formData = ref({
  customerCode: '',
  password: '',
  confirmPassword: '',
  phone: '',
  customerName: '',
  email: ''
})

const loading = ref(false)
const userStore = useUserStore()

const handleRegister = async () => {
  if (!formData.value.customerCode || !formData.value.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none'
    })
    return
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    uni.showToast({
      title: '两次密码不一致',
      icon: 'none'
    })
    return
  }
  
  if (!formData.value.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  try {
    const registerData = {
      username: formData.value.customerCode,
      password: formData.value.password,
      phone: formData.value.phone,
      name: formData.value.customerName || formData.value.customerCode,
      email: formData.value.email,
      roleId: 2
    }
    
    await userStore.register(registerData)
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/login/login?username=${encodeURIComponent(formData.value.customerCode)}&password=${encodeURIComponent(formData.value.password)}`
      })
    }, 1000)
  } catch (error) {
    console.error('注册失败:', error)
    let errorMessage = '注册失败'
    
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

const goToLogin = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.register-header {
  text-align: center;
  margin-bottom: 60rpx;
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

.register-form {
  width: 100%;
  max-width: 600rpx;
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  padding: 60rpx 40rpx;
  box-shadow: var(--shadow-lg);
  border: 2rpx solid var(--border-color);
}

.form-item {
  margin-bottom: 30rpx;
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

.register-btn {
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

.register-btn:active {
  background-color: var(--primary-dark);
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.register-btn:disabled {
  background-color: #666;
  border-color: #888;
  cursor: not-allowed;
}

.login-link {
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
  .register-container {
    padding: 40rpx 20rpx;
  }
  
  .register-form {
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
  
  .register-btn {
    height: 80rpx;
    font-size: 28rpx;
  }
}

/* 动画效果 */
.register-container {
  animation: fadeIn 0.6s ease-out;
}

.register-form {
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