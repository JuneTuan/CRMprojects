<template>
  <view class="register-page">
    <view class="container">
      <view class="title">注册</view>
      <view class="form">
        <view class="form-item">
          <input class="input" v-model="name" placeholder="请输入姓名" />
        </view>
        <view class="form-item">
          <input class="input" v-model="username" placeholder="请输入用户名" type="text" />
        </view>
        <view class="form-item">
          <input class="input" v-model="password" placeholder="请输入密码" type="password" />
        </view>
        <view class="form-item">
          <input class="input" v-model="confirmPassword" placeholder="请确认密码" type="password" />
        </view>
        <button class="submit-btn" @click="handleRegister" :disabled="loading">{{ loading ? '注册中...' : '注册' }}</button>
        <view class="login-link" @click="goToLogin">已有账号？去登录</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../../services/api';

const name = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (!name.value || !username.value || !password.value || !confirmPassword.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }

  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' });
    return;
  }

  if (username.value.length < 2) {
    uni.showToast({ title: '用户名长度至少为2个字符', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    await api.auth.register({ 
      name: name.value, 
      username: username.value, 
      password: password.value 
    });
    uni.showToast({ title: '注册成功，请登录', icon: 'success' });
    uni.navigateBack();
  } catch (error: any) {
    uni.showToast({ title: error.message || '注册失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.container {
  width: 90%;
  padding: 40rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 60rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 30rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
}

.login-link {
  text-align: center;
  color: #dc2626;
  font-size: 28rpx;
  margin-top: 30rpx;
}
</style>
