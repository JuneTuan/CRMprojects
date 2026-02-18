<template>
  <view class="coupon-verify-page">
    <view class="form">
      <view class="form-item">
        <view class="label">请输入优惠券码</view>
        <input class="input" v-model="couponCode" placeholder="请输入优惠券码" />
      </view>
      <button class="submit-btn" @click="handleVerify">核销</button>
    </view>
    <view v-if="verifiedCoupon" class="result">
      <view class="result-title">核销成功</view>
      <view class="coupon-info">
        <view class="info-item">
          <text class="label">优惠券名称：</text>
          <text class="value">{{ verifiedCoupon.name }}</text>
        </view>
        <view class="info-item">
          <text class="label">优惠券金额：</text>
          <text class="value">{{ verifiedCoupon.value }}元</text>
        </view>
        <view class="info-item">
          <text class="label">用户手机：</text>
          <text class="value">{{ verifiedCoupon.userPhone }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Coupon {
  name: string;
  value: number;
  userPhone: string;
}

const couponCode = ref('');
const verifiedCoupon = ref<Coupon | null>(null);

const handleVerify = () => {
  if (!couponCode.value) {
    uni.showToast({
      title: '请输入优惠券码',
      icon: 'none'
    });
    return;
  }
  
  console.log('核销优惠券', couponCode.value);
  
  verifiedCoupon.value = {
    name: '满100减20优惠券',
    value: 20,
    userPhone: '138****8888'
  };
  
  uni.showToast({
    title: '核销成功',
    icon: 'success'
  });
  
  setTimeout(() => {
    couponCode.value = '';
    verifiedCoupon.value = null;
  }, 3000);
};
</script>

<style lang="scss" scoped>
.coupon-verify-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40rpx;
}

.form {
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
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
}

.result {
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 40rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #059669;
  text-align: center;
  margin-bottom: 30rpx;
}

.coupon-info {
  padding: 20rpx 0;
}

.info-item {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.label {
  color: #666666;
  width: 180rpx;
}

.value {
  color: #333333;
  font-weight: bold;
}
</style>
