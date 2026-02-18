<template>
  <view class="profile-page">
    <view class="header">
      <view class="avatar">
        <view class="avatar-icon">👤</view>
      </view>
      <view class="info">
        <view class="name">{{ userInfo.name || '未登录' }}</view>
        <view class="phone">{{ userInfo.phone || '' }}</view>
      </view>
    </view>
    <view class="stats">
      <view class="stat-item">
        <view class="value">{{ userInfo.points || 0 }}</view>
        <view class="label">积分</view>
      </view>
      <view class="stat-item">
        <view class="value">{{ userInfo.couponCount || 0 }}</view>
        <view class="label">优惠券</view>
      </view>
      <view class="stat-item">
        <view class="value">{{ userInfo.orderCount || 0 }}</view>
        <view class="label">订单</view>
      </view>
    </view>
    <view class="menu">
      <view class="menu-item" @click="goToEditProfile">
        <text class="label">编辑资料</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="goToPointsHistory">
        <text class="label">积分历史</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="goToPurchaseRecord">
        <text class="label">购买记录</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="handleLogout">
        <text class="label">退出登录</text>
        <text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

const userInfo = ref({
  name: '',
  phone: '',
  points: 0,
  couponCount: 0,
  orderCount: 0
});

const loadUserInfo = async () => {
  try {
    const user = uni.getStorageSync('user');
    if (user) {
      userInfo.value = {
        ...userInfo.value,
        name: user.name,
        phone: user.phone
      };
      
      // 获取积分信息
      const pointsRes = await api.points.getBalance();
      userInfo.value.points = pointsRes.balance || 0;
      
      // 获取优惠券数量
      const couponsRes = await api.coupon.getMyCoupons();
      userInfo.value.couponCount = couponsRes.length || 0;
      
      // 获取订单数量
      const ordersRes = await api.order.getMyOrders();
      userInfo.value.orderCount = ordersRes.length || 0;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

const goToEditProfile = () => {
  uni.navigateTo({ url: '/pages/edit-profile/index' });
};

const goToPointsHistory = () => {
  uni.navigateTo({ url: '/pages/points-history/index' });
};

const goToPurchaseRecord = () => {
  uni.navigateTo({ url: '/pages/purchase-record/index' });
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error('退出登录失败:', error);
        } finally {
          uni.removeStorageSync('token');
          uni.removeStorageSync('user');
          uni.reLaunch({ url: '/pages/login/index' });
        }
      }
    }
  });
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 60rpx 40rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 80rpx;
  line-height: 1;
}

.info {
  flex: 1;
}

.name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.phone {
  font-size: 28rpx;
  color: #fca5a5;
}

.stats {
  display: flex;
  background-color: #ffffff;
  padding: 40rpx 0;
  margin-bottom: 20rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.value {
  font-size: 40rpx;
  font-weight: bold;
  color: #dc2626;
  margin-bottom: 10rpx;
}

.label {
  font-size: 24rpx;
  color: #999999;
}

.menu {
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 30rpx;
  color: #333333;
}

.arrow {
  font-size: 30rpx;
  color: #999999;
}
</style>
