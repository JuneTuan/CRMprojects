<template>
  <view class="test-page">
    <view class="container">
      <view class="title">点击测试页面</view>
      <button class="test-btn" @click="handleClick1">测试按钮1</button>
      <button class="test-btn" @click="handleClick2">测试按钮2</button>
      <button class="test-btn" @click="handleClick3">测试按钮3</button>
      <view class="result">点击次数: {{ clickCount }}</view>
      <view class="result">最后点击: {{ lastClick }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const clickCount = ref(0);
const lastClick = ref('');

const handleClick1 = () => {
  clickCount.value++;
  lastClick.value = '按钮1';
  console.log('点击了按钮1');
  uni.showToast({ title: '点击了按钮1', icon: 'none' });
};

const handleClick2 = () => {
  clickCount.value++;
  lastClick.value = '按钮2';
  console.log('点击了按钮2');
  uni.showToast({ title: '点击了按钮2', icon: 'none' });
};

const handleClick3 = () => {
  clickCount.value++;
  lastClick.value = '按钮3';
  console.log('点击了按钮3');
  uni.showToast({ title: '点击了按钮3', icon: 'none' });
};
</script>

<style lang="scss" scoped>
.test-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 40rpx;
}

.container {
  width: 100%;
  max-width: 600rpx;
  text-align: center;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 60rpx;
}

.test-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.test-btn::after {
  border: none;
}

.result {
  font-size: 28rpx;
  color: #666666;
  margin-top: 20rpx;
}
</style>
