<template>
  <view class="forgot-password-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">忘记密码</text>
    </view>

    <view class="content">
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input 
            class="form-input" 
            v-model="phone" 
            placeholder="请输入注册手机号" 
            type="number"
            maxlength="11"
          />
        </view>

        <button class="submit-btn" @click="handleForgotPassword" :disabled="loading">
          {{ loading ? '发送中...' : '获取临时密码' }}
        </button>

        <view class="success-section" v-if="tempPassword">
          <text class="success-icon">✅</text>
          <text class="success-title">临时密码已发送</text>
          <text class="success-text">您的临时密码是：</text>
          <view class="temp-password">
            <text class="password-text">{{ tempPassword }}</text>
          </view>
          <text class="success-tip">请使用临时密码登录后及时修改密码</text>
        </view>
      </view>

      <view class="tips-section">
        <text class="tips-title">温馨提示：</text>
        <text class="tips-item">1. 临时密码将通过系统消息发送到您的手机</text>
        <text class="tips-item">2. 临时密码有效期为24小时</text>
        <text class="tips-item">3. 建议登录后立即修改密码</text>
        <text class="tips-item">4. 如有问题请联系客服</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { authAPI } from '@/api/index.js'

const phone = ref('')
const tempPassword = ref('')
const loading = ref(false)

const handleForgotPassword = async () => {
  if (!phone.value) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none'
    })
    return
  }

  loading.value = true
  
  try {
    const result = await authAPI.forgotPassword(phone.value)
    tempPassword.value = result.tempPassword
    
    uni.showToast({
      title: '临时密码已发送',
      icon: 'success'
    })
  } catch (error) {
    console.error('获取临时密码失败', error)
    uni.showToast({
      title: error.data?.message || '获取失败',
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
.forgot-password-container {
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

.success-section {
  text-align: center;
  padding: 40rpx 20rpx;
  margin-top: 40rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
}

.success-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.success-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.success-text {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20rpx;
}

.temp-password {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx 0;
}

.password-text {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 8rpx;
}

.success-tip {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 20rpx;
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