<template>
  <view class="activity-detail-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">{{ activityInfo.activityName }}</text>
    </view>

    <view class="activity-info">
      <text class="desc">{{ activityInfo.description }}</text>
      <view class="meta-info">
        <text class="meta-item">⏰ {{ formatDate(activityInfo.startTime) }} - {{ formatDate(activityInfo.endTime) }}</text>
      </view>
    </view>

    <view class="user-stats" v-if="userStore.user">
      <view class="stat-item">
        <text class="stat-icon">💰</text>
        <text class="stat-label">我的积分</text>
        <text class="stat-value">{{ userPoints }}</text>
      </view>
      <view class="stat-item" v-if="selectedGame">
        <text class="stat-icon">🎯</text>
        <text class="stat-label">剩余次数</text>
        <text class="stat-value">{{ getRemainingDrawText() }}</text>
      </view>
    </view>

    <view class="game-selector" v-if="availableGameTypes.length > 0">
      <text class="selector-title">选择游戏</text>
      <view class="game-list">
        <view 
          class="game-item" 
          :class="{ active: selectedGameId === game.gameTypeId }"
          v-for="game in availableGameTypes" 
          :key="game.gameTypeId"
          @click="selectGame(game)"
        >
          <text class="game-icon">{{ game.config?.icon || '🎮' }}</text>
          <view class="game-info">
            <text class="game-name">{{ game.gameTypeName }}</text>
            <text class="game-cost" v-if="game.costPoints > 0">消耗 {{ game.costPoints }} 积分</text>
            <text class="game-cost" v-else>免费</text>
          </view>
        </view>
      </view>
    </view>

    <view class="game-area" v-if="selectedGame && currentGameConfig">
      <view class="game-title">
        <text class="game-name-text">{{ currentGameConfig.name }}</text>
        <text class="game-status">{{ selectedGame.remainingDrawCount }}/{{ selectedGame.maxDrawCount }}</text>
      </view>

      <view class="game-canvas">
        <Wheel
          v-if="selectedGame.gameTypeCode === 'wheel'"
          ref="wheelRef"
          :items="currentGameItems"
          :remaining-count="selectedGame.remainingDrawCount"
          :cost-points="selectedGame.costPoints"
          :user-points="userPoints"
          @spin="handleGameSpin"
          @result="handleGameResult"
        />
        <SlotMachine
          v-else-if="selectedGame.gameTypeCode === 'slot-machine'"
          ref="slotMachineRef"
          :items="currentGameItems"
          :remaining-count="selectedGame.remainingDrawCount"
          :cost-points="selectedGame.costPoints"
          :user-points="userPoints"
          @spin="handleGameSpin"
          @result="handleGameResult"
        />
        <BlindBox
          v-else-if="selectedGame.gameTypeCode === 'blind-box'"
          ref="blindBoxRef"
          :items="currentGameItems"
          :remaining-count="selectedGame.remainingDrawCount"
          :cost-points="selectedGame.costPoints"
          :user-points="userPoints"
          @open="handleGameSpin"
          @result="handleGameResult"
        />
        <NineGrid
          v-else-if="selectedGame.gameTypeCode === 'nine-grid'"
          ref="nineGridRef"
          :items="currentGameItems"
          :remaining-count="selectedGame.remainingDrawCount"
          :cost-points="selectedGame.costPoints"
          :user-points="userPoints"
          @spin="handleGameSpin"
          @result="handleGameResult"
        />
        <ScratchCard
          v-else-if="selectedGame.gameTypeCode === 'scratch-card'"
          ref="scratchCardRef"
          :items="currentGameItems"
          :remaining-count="selectedGame.remainingDrawCount"
          :cost-points="selectedGame.costPoints"
          :user-points="userPoints"
          @scratch="handleGameSpin"
          @result="handleGameResult"
        />
      </view>
    </view>

    <view class="result-modal" v-if="showResult">
      <view class="result-content">
        <view class="result-icon">
          <text v-if="drawResult.prize">🎉</text>
          <text v-else>😔</text>
        </view>
        <text class="result-title">{{ drawResult.prize ? '恭喜中奖！' : '很遗憾，未中奖' }}</text>
        <text class="result-text" v-if="drawResult.prize">{{ drawResult.prize.prizeName }}</text>
        <text class="result-text" v-else>再接再厉，下次好运！</text>
        <button class="result-btn" @click="closeResult">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/store/user.js'
import { lotteryAPI } from '@/api/index.js'
import gameConfigService from '@/services/gameConfig.js'
import Wheel from '@/components/Wheel.vue'
import SlotMachine from '@/components/SlotMachine.vue'
import BlindBox from '@/components/BlindBox.vue'
import NineGrid from '@/components/NineGrid.vue'
import ScratchCard from '@/components/ScratchCard.vue'

const userStore = useUserStore()
const wheelRef = ref(null)
const slotMachineRef = ref(null)
const blindBoxRef = ref(null)
const nineGridRef = ref(null)
const scratchCardRef = ref(null)

const activityId = ref(null)
const activityInfo = ref({})
const userPoints = ref(0)
const selectedGameId = ref(null)
const selectedGame = ref(null)
const isDrawing = ref(false)
const showResult = ref(false)
const drawResult = ref({})

const availableGameTypes = computed(() => {
  return gameConfigService.availableGameTypes.value || []
})

const currentGameConfig = computed(() => {
  return gameConfigService.currentGameConfig.value
})

const currentGameItems = computed(() => {
  return gameConfigService.currentGameItems.value || []
})

onMounted(async () => {
  userStore.initUser()
  if (!userStore.user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }, 1500)
    return
  }

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.options && currentPage.options.activityId) {
    activityId.value = Number(currentPage.options.activityId)
    await loadActivityInfo()
  }
})

const loadActivityInfo = async () => {
  try {
    const data = await gameConfigService.loadActivityInfo(activityId.value)
    activityInfo.value = data
    userPoints.value = Number(data.customerPoints) || 0
    
    if (data.gameTypes && data.gameTypes.length > 0) {
      if (availableGameTypes.value && availableGameTypes.value.length > 0) {
        selectGame(availableGameTypes.value[0])
      }
    }
  } catch (error) {
    console.error('加载活动信息失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

const selectGame = (game) => {
  selectedGameId.value = game.gameTypeId
  selectedGame.value = {
    ...game,
    costPoints: Number(game.costPoints) || 0,
    remainingDrawCount: Number(game.remainingDrawCount) || 0,
    maxDrawCount: Number(game.maxDrawCount) || 1
  }
  gameConfigService.selectGameType(game.gameTypeId)
}

const handleDraw = async () => {
  if (isDrawing.value) return
  
  const costPoints = selectedGame.value.costPoints
  const remainingDrawCount = selectedGame.value.remainingDrawCount
  
  // 检查是否可以抽奖
  const canFreeDraw = remainingDrawCount > 0
  const canPointsDraw = userPoints.value >= 10
  
  if (!canFreeDraw && !canPointsDraw) {
    uni.showToast({
      title: '免费次数已用完，积分不足',
      icon: 'none'
    })
    return
  }
  
  // 如果需要消耗积分，检查积分是否足够
  if (costPoints > 0 && userPoints.value < costPoints) {
    uni.showToast({
      title: '积分不足',
      icon: 'none'
    })
    return
  }

  isDrawing.value = true
  
  try {
    const result = await lotteryAPI.draw(activityId.value, selectedGameId.value)
    drawResult.value = result
    
    const gameTypeCode = selectedGame.value.gameTypeCode
    if (gameTypeCode === 'wheel' && wheelRef.value) {
      wheelRef.value.spinWithResult(result.prizeIndex)
    } else if (gameTypeCode === 'slot-machine' && slotMachineRef.value) {
      slotMachineRef.value.spinWithResult(result.prizeIndex)
    } else if (gameTypeCode === 'blind-box' && blindBoxRef.value) {
      blindBoxRef.value.openWithResult(result.prizeIndex)
    } else if (gameTypeCode === 'nine-grid' && nineGridRef.value) {
      nineGridRef.value.spinWithResult(result.prizeIndex)
    } else if (gameTypeCode === 'scratch-card' && scratchCardRef.value) {
      scratchCardRef.value.scratchWithResult(result.prizeIndex)
    }
    
    setTimeout(() => {
      showResult.value = true
      userPoints.value = Number(result.remainingPoints) || 0
      selectedGame.value.remainingDrawCount = Math.max(0, selectedGame.value.remainingDrawCount - 1)
      isDrawing.value = false
    }, 3000)
  } catch (error) {
    console.error('抽奖失败', error)
    uni.showToast({
      title: error.data?.message || '抽奖失败',
      icon: 'none'
    })
    isDrawing.value = false
  }
}

const handleGameSpin = async () => {
  await handleDraw()
}

const handleGameResult = (result) => {
}

const closeResult = () => {
  showResult.value = false
}

const goBack = () => {
  uni.navigateBack()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getRemainingDrawText = () => {
  if (!selectedGame.value) return '0'
  
  const remainingCount = selectedGame.value.remainingDrawCount
  if (remainingCount > 0) {
    return `${remainingCount}次(免费)`
  } else {
    return '积分抽奖'
  }
}
</script>

<style scoped>
.activity-detail-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 20rpx 30rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  margin-right: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  flex: 1;
}

.activity-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 20rpx 30rpx;
}

.desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.meta-item {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 0 20rpx 30rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-icon {
  font-size: 48rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.game-selector {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 20rpx 30rpx;
}

.selector-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.game-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.game-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: #fff;
}

.game-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.game-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.game-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}

.game-cost {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.game-area {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 20rpx;
}

.game-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.game-name-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.game-status {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.game-canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.result-content {
  background: #fff;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  width: 80%;
  max-width: 600rpx;
}

.result-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.result-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.result-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.result-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  font-weight: bold;
}
</style>