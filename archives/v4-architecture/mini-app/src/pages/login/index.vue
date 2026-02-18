<template>
  <view class="login-page">
    <view class="container">
      <view class="title">登录</view>
      <view class="form">
        <view class="form-item">
          <input class="input" v-model="username" placeholder="请输入用户名" type="text" />
        </view>
        <view class="form-item">
          <input class="input" v-model="password" placeholder="请输入密码" type="password" />
        </view>
        <button class="submit-btn" @click="handleLogin" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
        <view class="register-link" @click="goToRegister">还没有账号？去注册</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../../services/api';

const username = ref('123456');
const password = ref('123456');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' });
    return;
  }

  if (username.value.length < 2) {
    uni.showToast({ title: '用户名长度至少为2个字符', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    console.log('登录请求参数:', { username: username.value, password: password.value });
    const res = await api.auth.login({ username: username.value, password: password.value });
    console.log('登录响应:', res);
    uni.setStorageSync('token', res.token);
    uni.setStorageSync('user', res.user);
    uni.showToast({ title: '登录成功', icon: 'success' });
    uni.switchTab({ url: '/pages/index/index' });
  } catch (error: any) {
    console.error('登录错误:', error);
    uni.showToast({ 
      title: error.message || '登录失败', 
      icon: 'none',
      duration: 2000
    });
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' });
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.container {
  width: 90%;
  max-width: 400px;
  padding: 40rpx;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #f9f9f9;
}

.input:focus {
  border-color: #dc2626;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 4rpx rgba(220, 38, 38, 0.1);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn::after {
  border: none;
}

.submit-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.register-link {
  text-align: center;
  color: #dc2626;
  font-size: 24rpx;
  margin-top: 24rpx;
  cursor: pointer;
  padding: 16rpx;
}

.register-link:active {
  color: #b91c1c;
}
</style>
