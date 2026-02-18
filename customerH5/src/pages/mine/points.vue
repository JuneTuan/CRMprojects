<template>
  <view class="points-container">
    <view v-if="!userStore.user" class="empty">
      <text class="empty-text">请先登录查看积分</text>
      <button class="login-btn" @click="goToLogin">去登录</button>
    </view>
    
    <view v-else>
      <view class="points-header">
        <text class="points-label">我的积分</text>
        <text class="points-value">{{ userPoints || 0 }}</text>
      </view>
      
      <view class="points-info">
        <view class="info-item">
          <text class="info-label">积分说明</text>
          <text class="info-value">消费1元获得1积分</text>
        </view>
        <view class="info-item">
          <text class="info-label">积分用途</text>
          <text class="info-value">可用于兑换优惠券或参与活动</text>
        </view>
      </view>
      
      <view class="points-tips">
        <text class="tips-title">积分规则</text>
        <view class="tips-list">
          <text class="tip-item">• 每消费1元获得1积分</text>
          <text class="tip-item">• 积分可用于兑换优惠券</text>
          <text class="tip-item">• 积分可用于参与抽奖活动</text>
          <text class="tip-item">• 积分有效期为1年</text>
        </view>
      </view>
      
      <view class="points-history">
        <text class="history-title">积分明细</text>
        <view v-if="pointsHistory.length === 0" class="history-empty">
          <text>暂无积分记录</text>
        </view>
        <view v-else class="history-list">
          <view class="history-item" v-for="item in pointsHistory" :key="item.pointsRecordId">
            <view class="history-left">
              <text class="history-reason">{{ item.reason }}</text>
              <text class="history-time">{{ formatDate(item.createdAt) }}</text>
            </view>
            <text class="history-points" :class="item.points > 0 ? 'points-in' : 'points-out'">
              {{ item.points > 0 ? '+' : '' }}{{ item.points }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pointsAPI } from '@/api/index.js'
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
const userPoints = ref(0)
const pointsHistory = ref([])

onMounted(async () => {
  userStore.initUser()
  if (userStore.user) {
    await loadPoints()
    await loadPointsHistory()
  }
})

const loadPoints = async () => {
  if (!userStore.user) return
  
  try {
    const res = await pointsAPI.getCustomerInfo()
    userPoints.value = res.points || 0
  } catch (error) {
    console.error('加载积分失败', error)
    uni.showToast({
      title: '加载积分失败',
      icon: 'none'
    })
  }
}

const loadPointsHistory = async () => {
  if (!userStore.user) return
  
  try {
    const res = await pointsAPI.getPointsHistory()
    pointsHistory.value = res || []
  } catch (error) {
    console.error('加载积分明细失败', error)
  }
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.points-container {
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

.points-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.points-label {
  display: block;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20rpx;
}

.points-value {
  display: block;
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
}

.points-info {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.points-tips {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.tips-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.tip-item {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.points-history {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.history-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.history-empty {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-left {
  flex: 1;
}

.history-reason {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 5rpx;
}

.history-time {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.history-points {
  font-size: 32rpx;
  font-weight: bold;
}

.points-in {
  color: #4caf50;
}

.points-out {
  color: #f44336;
}
</style>