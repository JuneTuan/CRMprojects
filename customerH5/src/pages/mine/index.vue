<template>
  <view class="mine-container">
    <view class="user-info">
      <view class="avatar">
        <text class="avatar-text">{{ userStore.user.value?.customerName?.charAt(0) || 'U' }}</text>
      </view>
      <view class="info">
        <text class="name">{{ userStore.user.value?.customerName }}</text>
        <text class="phone">{{ userStore.user.value?.phone || '' }}</text>
        <text class="level">{{ userStore.user.value?.level || '普通会员' }}</text>
      </view>
      <view class="logout" @click="handleLogout">
        <text>退出</text>
      </view>
    </view>
    
    <view class="stats">
      <view class="stat-item" @click="goToPoints">
        <text class="stat-icon">💰</text>
        <text class="stat-value">{{ userPoints || 0 }}</text>
        <text class="stat-label">积分</text>
      </view>
      <view class="stat-item" @click="goToCoupons">
        <text class="stat-icon">🎫</text>
        <text class="stat-value">{{ couponCount || 0 }}</text>
        <text class="stat-label">优惠券</text>
      </view>
      <view class="stat-item" @click="goToOrders">
        <text class="stat-icon">📦</text>
        <text class="stat-value">{{ orderCount || 0 }}</text>
        <text class="stat-label">订单</text>
      </view>
    </view>
    
    <view class="menu-list">
      <view class="menu-item" @click="goToOrders">
        <view class="menu-left">
          <text class="menu-icon">📦</text>
          <text class="menu-text">我的订单</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goToCoupons">
        <view class="menu-left">
          <text class="menu-icon">🎫</text>
          <text class="menu-text">我的券</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goToPoints">
        <view class="menu-left">
          <text class="menu-icon">💎</text>
          <text class="menu-text">我的积分</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goToLotteryRecords">
        <view class="menu-left">
          <text class="menu-icon">🎰</text>
          <text class="menu-text">抽奖记录</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goToProfile">
        <view class="menu-left">
          <text class="menu-icon">👤</text>
          <text class="menu-text">我的资料</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goToResetPassword">
        <view class="menu-left">
          <text class="menu-icon">🔐</text>
          <text class="menu-text">修改密码</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user.js'
import { orderAPI, couponAPI, pointsAPI, userAPI } from '@/api/index.js'

const userStore = useUserStore()
const userPoints = ref(0)
const couponCount = ref(0)
const orderCount = ref(0)

onMounted(async () => {
  console.log('我的中心页面已挂载')
  userStore.initUser()
  console.log('用户信息初始化完成:', userStore.user)
  
  if (userStore.user.value) {
    console.log('用户已登录，开始加载统计数据')
    await loadStats()
    await refreshUserInfo()
  } else {
    console.log('用户未登录，跳转到登录页面')
    uni.redirectTo({
      url: '/pages/login/login'
    })
  }
})

const refreshUserInfo = async () => {
  if (!userStore.user.value) return
  
  try {
    const profile = await userAPI.getProfile()
    console.log('获取到的最新用户信息:', profile)
    
    userStore.user.value = {
      ...userStore.user.value,
      id: profile.id,
      customerId: profile.customerId,
      customerCode: profile.customerCode,
      customerName: profile.customerName,
      phone: profile.phone,
      email: profile.email,
      points: profile.points,
      level: profile.level,
      levelCode: profile.levelCode,
      levelIcon: profile.levelIcon,
      avatar: profile.avatar,
      position: profile.position,
      address: profile.address,
      totalConsumption: profile.totalConsumption,
      memberLevelId: profile.memberLevelId
    }
    
    uni.setStorageSync('user', userStore.user.value)
    console.log('用户信息已更新:', userStore.user.value)
  } catch (error) {
    console.error('刷新用户信息失败:', error)
  }
}

const loadStats = async () => {
  if (!userStore.user.value) return
  
  try {
    const [customerInfo, coupons, orders] = await Promise.all([
      pointsAPI.getCustomerInfo(),
      couponAPI.getCoupons(),
      orderAPI.getOrders()
    ])
    
    userPoints.value = customerInfo.points || 0
    couponCount.value = coupons.length || 0
    orderCount.value = orders.length || 0
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/login'
          })
        }, 1000)
      }
    }
  })
}

const goToOrders = () => {
  if (!userStore.user.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  uni.navigateTo({
    url: '/pages/mine/orders'
  })
}

const goToCoupons = () => {
  if (!userStore.user.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  uni.navigateTo({
    url: '/pages/mine/coupons'
  })
}

const goToPoints = () => {
  if (!userStore.user.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  uni.navigateTo({
    url: '/pages/mine/points'
  })
}

const goToLotteryRecords = () => {
  if (!userStore.user.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  uni.navigateTo({
    url: '/pages/mine/lottery-records'
  })
}

const goToProfile = () => {
  if (!userStore.user.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  uni.navigateTo({
    url: '/pages/mine/profile'
  })
}

const goToResetPassword = () => {
  if (!userStore.user.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  uni.navigateTo({
    url: '/pages/reset-password/reset-password'
  })
}
</script>

<style scoped>
.mine-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-bottom: 40rpx;
}

.user-info {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: var(--shadow-lg);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--text-light);
}

.info {
  flex: 1;
}

.name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-light);
  margin-bottom: 10rpx;
}

.phone {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.level {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  display: inline-block;
}

.logout {
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-full);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.logout text {
  font-size: 24rpx;
  color: var(--text-light);
  font-weight: bold;
}

.login-tip {
  margin: 40rpx 20rpx;
  padding: 60rpx 40rpx;
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}

.tip-text {
  font-size: 32rpx;
  color: var(--text-secondary);
  font-weight: bold;
}

.login-button {
  background-color: var(--primary-color);
  color: var(--text-light);
  padding: 20rpx 40rpx;
  border-radius: var(--border-radius-full);
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10rpx;
  text-decoration: none;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 4rpx solid var(--primary-dark);
}

.login-button:active {
  background-color: var(--primary-dark);
  transform: scale(0.98);
}

.login-icon {
  font-size: 32rpx;
}

.login-text {
  font-size: 28rpx;
  font-weight: bold;
}

.stats {
  background-color: var(--card-background);
  display: flex;
  padding: 40rpx 20rpx;
  margin: 20rpx;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-item {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.stat-icon {
  font-size: 48rpx;
  margin-bottom: 5rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.menu-list {
  background-color: var(--card-background);
  margin: 20rpx;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 2rpx solid var(--border-color);
  transition: all 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: rgba(231, 76, 60, 0.05);
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 32rpx;
  color: var(--text-primary);
  font-weight: bold;
}

.menu-arrow {
  font-size: 32rpx;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .user-info {
    padding: 40rpx 30rpx;
  }
  
  .avatar {
    width: 100rpx;
    height: 100rpx;
  }
  
  .avatar-text {
    font-size: 40rpx;
  }
  
  .name {
    font-size: 32rpx;
  }
  
  .phone {
    font-size: 24rpx;
  }
  
  .stat-value {
    font-size: 36rpx;
  }
  
  .stat-label {
    font-size: 22rpx;
  }
  
  .menu-item {
    padding: 25rpx 30rpx;
  }
  
  .menu-text {
    font-size: 28rpx;
  }
}

/* 动画效果 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mine-container {
  animation: slideInUp 0.6s ease-out;
}

.menu-item {
  transition: all 0.3s ease;
}

.menu-item:active {
  transform: scale(0.98);
}
</style>