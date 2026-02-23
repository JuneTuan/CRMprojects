<template>
  <view class="activity-container">
    <view class="header">
      <text class="title">精彩活动</text>
      <text class="subtitle">参与活动赢取丰厚奖品</text>
    </view>

    <view class="user-info" v-if="userStore.user">
      <view class="info-card">
        <view class="info-item">
          <text class="info-icon">💰</text>
          <text class="info-label">我的积分</text>
          <text class="info-value">{{ userPoints }}</text>
        </view>
        <view class="info-item">
          <text class="info-icon">⭐</text>
          <text class="info-label">会员等级</text>
          <view class="level-display">
            <text class="level-icon">{{ getLevelIcon(userStore.user?.levelIcon) }}</text>
            <text class="info-value">{{ userStore.user?.level || '普通会员' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="login-tip">
      <text class="tip-text">请先登录查看活动</text>
      <navigator url="/pages/login/login" class="login-btn">
        <text>去登录</text>
      </navigator>
    </view>

    <view class="activity-list" v-if="userStore.user">
      <view 
        class="activity-item" 
        v-for="activity in filteredActivities" 
        :key="activity.activityId"
        @click="handleActivityClick(activity)"
      >
        <view class="activity-image" v-if="activity.imageUrl">
          <image :src="activity.imageUrl" mode="aspectFill" class="activity-img" />
        </view>
        <view class="activity-content">
          <view class="activity-header">
            <text class="activity-name">{{ activity.activityName }}</text>
            <view class="activity-type" :class="getActivityTypeClass(activity.activityType)">
              {{ activity.activityType }}
            </view>
          </view>
          <text class="activity-desc">{{ activity.description || '暂无描述' }}</text>
          <view class="activity-meta">
            <text class="meta-item">📅 {{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</text>
          </view>
          <view class="activity-games" v-if="activity.gameTypes && activity.gameTypes.length > 0">
            <text class="games-label">游戏类型：</text>
            <view class="game-tags">
              <text 
                class="game-tag" 
                v-for="game in activity.gameTypes" 
                :key="game.gameTypeId"
              >
                {{ game.gameTypeName }} ({{ game.gameTypeCode }})
              </text>
            </view>
          </view>
          <view class="activity-games" v-else-if="activity.gameType">
            <text class="games-label">游戏类型：</text>
            <view class="game-tags">
              <text class="game-tag">
                {{ activity.gameType }}
              </text>
            </view>
          </view>
          <view class="activity-requirement" v-if="activity.minPoints > 0">
            <text class="requirement-text">⚠️ 需要积分：{{ activity.minPoints }}</text>
          </view>
          <view class="activity-draw-info" v-if="activity.activityType === '游戏活动'">
            <text class="draw-info-text">🎁 免费抽奖：{{ activity.freeDraws }}次</text>
            <text class="draw-info-text">💰 积分消耗：{{ activity.pointsCost }}积分/次</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="filteredActivities.length === 0">
        <text class="empty-icon">🎉</text>
        <text class="empty-text">暂无可用活动</text>
      </view>
    </view>

    <view class="empty-state" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user.js'
import { lotteryAPI } from '@/api/index.js'

const userStore = useUserStore()
const activities = ref([])
const userPoints = ref(0)
const loading = ref(true)

const iconMap = {
  'User': '👤',
  'UserFilled': '👤',
  'Avatar': '👤',
  'Medal': '🏅',
  'Trophy': '🏆',
  'Star': '⭐',
  'StarFilled': '⭐',
  'Crown': '👑',
  'Diamond': '💎',
  'Sunny': '☀️',
  'Moon': '🌙',
  'CircleCheck': '✅',
  'CircleCheckFilled': '✅',
  'SuccessFilled': '✅',
  'Warning': '⚠️',
  'WarningFilled': '⚠️',
  'CirclePlus': '➕',
  'CirclePlusFilled': '➕',
  'Promotion': '📈',
  'TrendCharts': '📊',
  'DataAnalysis': '📈',
  'PieChart': '📊',
  'Histogram': '📊',
}

const getLevelIcon = (iconCode) => {
  return iconMap[iconCode] || '👤'
}

const filteredActivities = computed(() => {
  if (!userStore.user) return []
  
  return activities.value.filter(activity => {
    const userPointsValue = Number(userPoints.value) || 0
    
    if (activity.minPoints > 0 && userPointsValue < activity.minPoints) {
      return false
    }
    
    if (activity.status !== '进行中') {
      return false
    }
    
    return true
  })
})

onMounted(async () => {
  console.log('活动页面已挂载')
  userStore.initUser()
  console.log('用户信息:', userStore.user)
  if (userStore.user) {
    await loadActivities()
    await loadUserPoints()
  } else {
    loading.value = false
  }
})

const loadActivities = async () => {
  try {
    loading.value = true
    const data = await lotteryAPI.getActivities()
    console.log('获取到的活动数据:', data)
    activities.value = data || []
    console.log('活动列表赋值后:', activities.value)
  } catch (error) {
    console.error('加载活动失败', error)
    uni.showToast({
      title: '加载活动失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const loadUserPoints = async () => {
  try {
    const data = await lotteryAPI.getDrawInfo(activities.value[0]?.activityId)
    if (data && data.customerPoints) {
      userPoints.value = data.customerPoints
    }
  } catch (error) {
    console.error('加载用户积分失败', error)
  }
}

const handleActivityClick = (activity) => {
  if (activity.activityType === '游戏活动') {
    uni.navigateTo({
      url: `/pages/activity/detail?activityId=${activity.activityId}`
    })
  } else {
    uni.showToast({
      title: '该活动类型暂未开放',
      icon: 'none'
    })
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const getActivityTypeClass = (type) => {
  const typeMap = {
    '游戏活动': 'type-game',
    '积分活动': 'type-points',
    '优惠券活动': 'type-coupon',
    '混合活动': 'type-mix'
  }
  return typeMap[type] || 'type-default'
}
</script>

<style scoped>
.activity-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40rpx;
}

.header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.user-info {
  padding: 0 20rpx 30rpx;
}

.info-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.info-icon {
  font-size: 48rpx;
}

.info-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.info-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.level-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.level-icon {
  font-size: 28rpx;
}

.login-tip {
  padding: 40rpx;
  text-align: center;
}

.tip-text {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30rpx;
}

.login-btn {
  display: inline-block;
  background: #fff;
  color: #667eea;
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.activity-list {
  padding: 0 20rpx;
}

.activity-item {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.activity-image {
  width: 100%;
  height: 300rpx;
  overflow: hidden;
}

.activity-img {
  width: 100%;
  height: 100%;
}

.activity-content {
  padding: 30rpx;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.activity-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 16rpx;
}

.activity-type {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: bold;
  white-space: nowrap;
}

.type-game {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.type-points {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.type-coupon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.type-mix {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

.type-default {
  background: #999;
  color: #fff;
}

.activity-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.activity-meta {
  margin-bottom: 16rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.activity-games {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.games-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 16rpx;
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.game-tag {
  background: #f5f5f5;
  color: #666;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.activity-requirement {
  background: #fff3cd;
  border-left: 4rpx solid #ffc107;
  padding: 16rpx;
  margin-top: 16rpx;
}

.requirement-text {
  font-size: 24rpx;
  color: #856404;
}

.activity-draw-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: #d1ecf1;
  border-left: 4rpx solid #17a2b8;
  padding: 16rpx;
  margin-top: 16rpx;
}

.draw-info-text {
  font-size: 24rpx;
  color: #0c5460;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  display: block;
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.loading-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>