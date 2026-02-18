<template>
  <view class="edit-profile-page">
    <view class="form">
      <view class="form-item">
        <view class="label">姓名</view>
        <input class="input" v-model="formData.name" placeholder="请输入姓名" />
      </view>
      <view class="form-item">
        <view class="label">手机号</view>
        <input class="input" v-model="formData.phone" placeholder="请输入手机号" type="number" />
      </view>
      <view class="form-item">
        <view class="label">邮箱</view>
        <input class="input" v-model="formData.email" placeholder="请输入邮箱" />
      </view>
      <button class="submit-btn" @click="handleSubmit" :disabled="loading">{{ loading ? '保存中...' : '保存' }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

const formData = ref({
  name: '',
  phone: '',
  email: ''
});
const loading = ref(false);

const loadUserInfo = async () => {
  try {
    const user = uni.getStorageSync('user');
    if (user) {
      formData.value = {
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

const handleSubmit = async () => {
  if (!formData.value.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    await api.auth.updateProfile(formData.value);
    uni.showToast({ title: '保存成功', icon: 'success' });
    
    // 更新本地存储的用户信息
    const user = uni.getStorageSync('user');
    uni.setStorageSync('user', {
      ...user,
      ...formData.value
    });
    
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error: any) {
    uni.showToast({ title: error.message || '保存失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style lang="scss" scoped>
.edit-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.form {
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
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
</style>
