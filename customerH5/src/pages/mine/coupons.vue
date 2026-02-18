<template>
  <view class="coupons-container">
    <view v-if="!userStore.user" class="empty">
      <text class="empty-text">请先登录查看优惠券</text>
      <button class="login-btn" @click="goToLogin">去登录</button>
    </view>
    
    <view v-else-if="coupons.length === 0" class="empty">
      <text class="empty-text">暂无优惠券</text>
    </view>
    
    <view v-else class="coupon-list">
      <view class="coupon-item" v-for="coupon in coupons" :key="coupon.customerCouponId">
        <view class="coupon-left">
          <view class="coupon-value">
            <text class="value">¥{{ coupon.value }}</text>
            <text class="unit">元</text>
          </view>
          <text class="coupon-name">{{ coupon.couponName }}</text>
        </view>
        
        <view class="coupon-right">
          <text class="coupon-code">券码: {{ coupon.couponCode }}</text>
          <text class="coupon-expiry">有效期至: {{ formatDate(coupon.endTime) }}</text>
          <view class="coupon-status" :class="getStatusClass(coupon.status)">
            {{ coupon.status }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { couponAPI } from '@/api/index.js'
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
const coupons = ref([])

onMounted(async () => {
  userStore.initUser()
  if (userStore.user) {
    await loadCoupons()
  }
})

const loadCoupons = async () => {
  if (!userStore.user) return
  
  try {
    const res = await couponAPI.getCoupons()
    coupons.value = res || []
  } catch (error) {
    console.error('加载优惠券失败', error)
    uni.showToast({
      title: '加载优惠券失败',
      icon: 'none'
    })
  }
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

const getStatusClass = (status) => {
  const statusMap = {
    '未开始': 'status-pending',
    '进行中': 'status-active',
    '已结束': 'status-expired'
  }
  return statusMap[status] || ''
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.coupons-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 600rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.login-btn {
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.coupon-item {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 15rpx rgba(255, 107, 107, 0.3);
}

.coupon-left {
  flex: 1;
}

.coupon-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 10rpx;
}

.value {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
}

.unit {
  font-size: 28rpx;
  color: #fff;
  margin-left: 5rpx;
}

.coupon-name {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.coupon-right {
  text-align: right;
}

.coupon-code {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5rpx;
}

.coupon-expiry {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10rpx;
}

.coupon-status {
  display: inline-block;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.3);
}

.status-active {
  background: rgba(76, 175, 80, 0.8);
}

.status-pending {
  background: rgba(255, 152, 0, 0.8);
}

.status-expired {
  background: rgba(158, 158, 158, 0.8);
}
</style>