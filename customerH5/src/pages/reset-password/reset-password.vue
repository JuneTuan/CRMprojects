<template>
  <view class="reset-password-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">修改密码</text>
    </view>

    <view class="content">
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">原密码</text>
          <input 
            class="form-input" 
            v-model="oldPassword" 
            placeholder="请输入原密码" 
            type="password"
          />
        </view>

        <view class="form-item">
          <text class="form-label">新密码</text>
          <input 
            class="form-input" 
            v-model="newPassword" 
            placeholder="请输入新密码（6-20位）" 
            type="password"
            maxlength="20"
          />
        </view>

        <view class="form-item">
          <text class="form-label">确认新密码</text>
          <input 
            class="form-input" 
            v-model="confirmPassword" 
            placeholder="请再次输入新密码" 
            type="password"
            maxlength="20"
          />
        </view>

        <button class="submit-btn" @click="handleResetPassword" :disabled="loading">
          {{ loading ? '提交中...' : '确认修改' }}
        </button>
      </view>

      <view class="tips-section">
        <text class="tips-title">密码要求：</text>
        <text class="tips-item">1. 密码长度为6-20位</text>
        <text class="tips-item">2. 建议使用字母、数字、符号组合</text>
        <text class="tips-item">3. 不要使用过于简单的密码</text>
        <text class="tips-item">4. 定期更换密码更安全</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { authAPI } from '@/api/index.js'
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const handleResetPassword = async () => {
  if (!oldPassword.value) {
    uni.showToast({
      title: '请输入原密码',
      icon: 'none'
    })
    return
  }

  if (!newPassword.value) {
    uni.showToast({
      title: '请输入新密码',
      icon: 'none'
    })
    return
  }

  if (newPassword.value.length < 6 || newPassword.value.length > 20) {
    uni.showToast({
      title: '密码长度为6-20位',
      icon: 'none'
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none'
    })
    return
  }

  if (oldPassword.value === newPassword.value) {
    uni.showToast({
      title: '新密码不能与原密码相同',
      icon: 'none'
    })
    return
  }

  loading.value = true
  
  try {
    const phone = userStore.user?.phone || ''
    if (!phone) {
      uni.showToast({
        title: '用户信息异常',
        icon: 'none'
      })
      return
    }

    await authAPI.resetPassword(phone, oldPassword.value, newPassword.value)
    
    uni.showToast({
      title: '密码修改成功',
      icon: 'success',
      duration: 2000
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  } catch (error) {
    console.error('修改密码失败', error)
    uni.showToast({
      title: error.data?.message || '修改失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 20rpx 30rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  margin-right: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  flex: 1;
}

.content {
  padding: 0 20rpx;
}

.form-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
  font-weight: bold;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #fff;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.submit-btn:disabled {
  opacity: 0.6;
}

.tips-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
}

.tips-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.tips-item {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin-bottom: 12rpx;
  padding-left: 20rpx;
}
</style>