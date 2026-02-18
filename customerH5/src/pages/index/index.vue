<template>
  <view class="home-container">
    <!-- 活动信息 -->
    <view class="activity-info">
      <text class="activity-title">{{ currentActivity?.activityName || '幸运抽奖' }}</text>
      <text class="activity-desc">{{ currentActivity?.description || '参与抽奖赢取丰厚奖品' }}</text>
    </view>

    <!-- 用户信息 -->
    <view class="user-info" v-if="userStore.user">
      <view class="info-item">
        <text class="info-icon">🎯</text>
        <text class="info-text">免费次数: {{ drawInfo.remainingFreeDraws }}</text>
      </view>
      <view class="info-item" v-if="drawInfo.remainingFreeDraws === 0">
        <text class="info-icon">🪙</text>
        <text class="info-text">消耗积分: {{ drawInfo.pointsCost }}</text>
      </view>
      <view class="info-item">
        <text class="info-icon">💰</text>
        <text class="info-text">我的积分: {{ drawInfo.customerPoints }}</text>
      </view>
    </view>

    <!-- 游戏选择 -->
    <view class="game-selector" v-if="activityGames.length > 0">
      <view 
        class="game-option" 
        :class="{ active: selectedGameId === game.gameTypeId }"
        v-for="game in activityGames" 
        :key="game.gameTypeId"
        @click="selectGame(game)"
      >
        <text class="game-icon">{{ getGameIcon(game.gameTypeName) }}</text>
        <text class="game-name">{{ game.gameTypeName }}</text>
      </view>
    </view>

    <!-- 游戏容器 -->
    <view class="game-container">
      <!-- 老虎机游戏 -->
      <slot-machine 
        v-if="selectedGameId === 1" 
        :activity="currentActivity"
        :game="currentGame"
        @update:draw-info="updateDrawInfo"
      />
      
      <!-- 大转盘游戏 -->
      <wheel-game 
        v-if="selectedGameId === 2" 
        :activity="currentActivity"
        :game="currentGame"
        @update:draw-info="updateDrawInfo"
      />
      
      <!-- 游戏选择提示 -->
      <view class="game-tip" v-if="activityGames.length === 0">
        <text class="tip-icon">🎮</text>
        <text class="tip-text">暂无可参与的游戏</text>
      </view>
    </view>

    <!-- 活动规则 -->
    <view class="activity-rules">
      <view class="rules-header">
        <text class="rules-icon">📜</text>
        <text class="rules-title">活动规则</text>
      </view>
      <view class="rules-content">
        <text class="rule-item">1. 每个活动默认3次免费抽奖机会</text>
        <text class="rule-item">2. 免费次数用完后，每次抽奖将消耗相应积分</text>
        <text class="rule-item">3. 积分不足时无法参与抽奖</text>
        <text class="rule-item">4. 中奖后请及时查看"我的奖品"</text>
        <text class="rule-item">5. 活动最终解释权归主办方所有</text>
      </view>
    </view>

    <!-- 未登录提示 -->
    <view class="login-tip" v-if="!userStore.user">
      <text class="tip-text">请先登录后参与抽奖</text>
      <navigator url="/pages/login/login" class="login-button">
        <text class="login-icon">🔑</text>
        <text class="login-text">去登录</text>
      </navigator>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/store/user.js'
import { lotteryAPI } from '@/api/index.js'
import SlotMachine from './slot.vue'
import WheelGame from './wheel.vue'

const userStore = useUserStore()
const currentActivity = ref(null)
const currentGame = ref(null)
const activityGames = ref([])
const selectedGameId = ref(0)
const drawInfo = ref({
  remainingFreeDraws: 0,
  pointsCost: 0,
  customerPoints: 0,
  canUsePoints: false,
  canDraw: false
})

const getGameIcon = (gameName) => {
  const iconMap = {
    '老虎机': '🎰',
    '大转盘': '🎡',
    '刮刮乐': '🎟'
  }
  return iconMap[gameName] || '🎮'
}

const selectGame = (game) => {
  selectedGameId.value = game.gameTypeId
  currentGame.value = game
}

const updateDrawInfo = (info) => {
  drawInfo.value = info
}

const loadGameData = async () => {
  try {
    const activities = await lotteryAPI.getActivities()
    if (activities && activities.length > 0) {
      currentActivity.value = activities[0]
      const games = activities[0].gameTypes || []
      activityGames.value = games
      
      if (games.length > 0) {
        selectGame(games[0])
      }
    }
  } catch (error) {
    console.error('加载游戏数据失败', error)
  }
}

const loadDrawInfo = async () => {
  if (!userStore.user || !currentActivity.value) {
    console.log('用户信息或活动信息不存在', { user: userStore.user, activity: currentActivity.value })
    return
  }
  
  const activityId = Number(currentActivity.value.activityId)
  
  console.log('准备加载抽奖信息:', {
    userId: userStore.user.id,
    userIdType: typeof userStore.user.id,
    activityId: currentActivity.value.activityId,
    activityIdType: typeof currentActivity.value.activityId
  })
  
  if (isNaN(activityId)) {
    console.error('活动ID无效:', activityId)
    return
  }
  
  try {
    const info = await lotteryAPI.getDrawInfo(activityId)
    drawInfo.value = info
  } catch (error) {
    console.error('加载抽奖信息失败', error)
  }
}

onMounted(async () => {
  userStore.initUser()
  await loadGameData()
  if (userStore.user) {
    await loadDrawInfo()
  }
})

watch(() => userStore.user, async (newUser) => {
  if (newUser) {
    await loadDrawInfo()
  }
})

watch(() => currentActivity.value, async (newActivity) => {
  if (newActivity && userStore.user) {
    await loadDrawInfo()
  }
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-bottom: 40rpx;
}

/* 活动信息 */
.activity-info {
  padding: 30rpx 20rpx;
  text-align: center;
}

.activity-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 10rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.activity-desc {
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 用户信息 */
.user-info {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  margin: 0 20rpx 20rpx;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.info-icon {
  font-size: 36rpx;
}

.info-text {
  font-size: 24rpx;
  font-weight: bold;
  color: var(--text-primary);
}

/* 游戏选择 */
.game-selector {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx 20rpx;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.game-selector::-webkit-scrollbar {
  display: none;
}

.game-option {
  flex: 1;
  min-width: 160rpx;
  padding: 20rpx;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.game-option.active {
  border-color: var(--primary-color);
  background-color: rgba(231, 76, 60, 0.05);
  box-shadow: var(--shadow-md);
}

.game-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.game-name {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-primary);
}

/* 游戏容器 */
.game-container {
  padding: 0 20rpx 30rpx;
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-tip {
  text-align: center;
  padding: 60rpx 20rpx;
}

.tip-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 20rpx;
}

.tip-text {
  font-size: 32rpx;
  color: var(--text-secondary);
  font-weight: bold;
}

/* 活动规则 */
.activity-rules {
  margin: 0 20rpx;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.rules-header {
  background-color: var(--primary-color);
  color: var(--text-light);
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.rules-icon {
  font-size: 32rpx;
}

.rules-title {
  font-size: 32rpx;
  font-weight: bold;
}

.rules-content {
  padding: 24rpx;
}

.rule-item {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12rpx;
}

.rule-item:last-child {
  margin-bottom: 0;
}

/* 未登录提示 */
.login-tip {
  margin: 40rpx 20rpx;
  padding: 40rpx 20rpx;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
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

/* 响应式设计 */
@media (max-width: 750rpx) {
  .activity-title {
    font-size: 36rpx;
  }
  
  .activity-desc {
    font-size: 24rpx;
  }
  
  .user-info {
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .info-item {
    flex: 1 1 45%;
  }
  
  .game-option {
    min-width: 140rpx;
    padding: 16rpx;
  }
  
  .game-name {
    font-size: 24rpx;
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

.home-container {
  animation: slideInUp 0.6s ease-out;
}

.game-option {
  transition: all 0.3s ease;
}

.game-option:hover {
  transform: translateY(-5rpx);
  box-shadow: var(--shadow-md);
}

.game-option.active {
  animation: pulse 2s infinite;
}
</style>