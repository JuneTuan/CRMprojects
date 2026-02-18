<template>
  <view class="wheel-container">
    <!-- 游戏标题 -->
    <view class="game-header">
      <text class="game-title">{{ activity?.activityName || '幸运大转盘' }}</text>
      <text class="game-desc">{{ activity?.description || '转动转盘赢取大奖' }}</text>
    </view>

    <!-- 用户信息 -->
    <view class="user-info" v-if="userStore.user">
      <view class="info-item">
        <text class="info-icon">🎫</text>
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

    <!-- 大转盘主体 -->
    <view class="wheel-wrapper">
      <!-- 转盘指针 -->
      <view class="wheel-pointer" :class="{ spinning: isSpinning }">
        <text class="pointer-icon">🎯</text>
      </view>

      <!-- 转盘 -->
      <view class="wheel" :class="{ spinning: isSpinning }" :style="{ transform: `rotate(${wheelRotation}deg)` }">
        <view 
          class="wheel-sector" 
          v-for="(prize, index) in prizes" 
          :key="prize.id"
          :style="{ 
            transform: `rotate(${index * (360 / prizes.length)}deg)`,
            '--sector-color': index % 2 === 0 ? '#e74c3c' : '#c0392b'
          }"
        >
          <text class="sector-icon">{{ getPrizeIcon(prize.type) }}</text>
          <text class="sector-name">{{ prize.name }}</text>
        </view>
      </view>
    </view>

    <!-- 控制面板 -->
    <view class="control-panel">
      <button 
        class="spin-button" 
        @click="handleSpin" 
        :disabled="isSpinning || !canSpin"
        :class="{ disabled: isSpinning || !canSpin }"
      >
        <text class="spin-icon">{{ isSpinning ? '🔄' : '🎡' }}</text>
        <text class="spin-text">{{ isSpinning ? '抽奖中...' : '开始抽奖' }}</text>
      </button>
    </view>

    <!-- 抽奖结果 -->
    <view class="result-modal" v-if="showResult">
      <view class="result-content">
        <view class="result-icon-wrapper">
          <text class="result-icon">{{ resultIcon }}</text>
        </view>
        <text class="result-title">{{ resultTitle }}</text>
        <text class="result-text">{{ resultText }}</text>
        <button class="result-button" @click="closeResult">
          <text class="result-button-text">确定</text>
        </button>
      </view>
    </view>

    <!-- 奖品列表 -->
    <view class="prize-list">
      <text class="list-title">🎁 奖品列表</text>
      <view class="prize-items">
        <view 
          class="prize-item" 
          v-for="(prize, index) in prizes" 
          :key="prize.id"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <view class="prize-icon-wrapper">
            <text class="prize-icon">{{ getPrizeIcon(prize.type) }}</text>
          </view>
          <view class="prize-info">
            <text class="prize-name">{{ prize.name }}</text>
            <text class="prize-prob">概率: {{ prize.probability }}%</text>
          </view>
        </view>
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

const props = defineProps({
  activity: Object,
  game: Object
})

const emit = defineEmits(['update:draw-info'])

const userStore = useUserStore()
const isSpinning = ref(false)
const showResult = ref(false)
const wheelRotation = ref(0)
const resultIcon = ref('')
const resultTitle = ref('')
const resultText = ref('')
const prizes = ref([])
const drawInfo = ref({
  remainingFreeDraws: 0,
  pointsCost: 0,
  customerPoints: 0,
  canUsePoints: false,
  canDraw: false
})

const canSpin = computed(() => {
  return drawInfo.value.canDraw
})

const getPrizeIcon = (type) => {
  const iconMap = {
    '实物': '🎁',
    '虚拟': '💎',
    '积分': '🪙',
    '优惠券': '🎫',
    '谢谢参与': '😔'
  }
  return iconMap[type] || '🎁'
}

const loadGameData = async () => {
  if (!props.game) return
  
  const gamePrizes = props.game.gamePrizes || []
  prizes.value = gamePrizes.map(gp => gp.prize).filter(p => p)
}

const loadDrawInfo = async () => {
  if (!userStore.user || !props.activity) return
  
  try {
    const info = await lotteryAPI.getDrawInfo(userStore.user.id, props.activity.activityId)
    drawInfo.value = info
    emit('update:draw-info', info)
  } catch (error) {
    console.error('加载抽奖信息失败', error)
  }
}

const handleSpin = async () => {
  if (!userStore.user) {
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
  
  if (!canSpin.value) {
    uni.showToast({
      title: '无法抽奖，请检查积分',
      icon: 'none'
    })
    return
  }
  
  if (!props.activity || !props.game || prizes.value.length === 0) {
    uni.showToast({
      title: '游戏未配置',
      icon: 'none'
    })
    return
  }
  
  isSpinning.value = true
  showResult.value = false
  
  // 计算旋转角度和时间
  const spinDuration = 4000
  const extraRotations = 5
  const randomAngle = Math.random() * 360
  const totalAngle = extraRotations * 360 + randomAngle
  
  const startTime = Date.now()
  const startRotation = wheelRotation.value
  const targetRotation = startRotation + totalAngle
  
  // 动画旋转
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / spinDuration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    wheelRotation.value = startRotation + (targetRotation - startRotation) * easeOut
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      performDraw()
    }
  }
  
  animate()
}

const performDraw = async () => {
  try {
    const gameTypeId = props.game.gameType ? props.game.gameType.id : props.game.gameTypeId
    
    console.log('开始抽奖:', {
      userId: userStore.user.id,
      activityId: props.activity.activityId,
      gameTypeId,
      game: props.game
    })
    
    const result = await lotteryAPI.draw(
      props.activity.activityId,
      gameTypeId
    )
    
    isSpinning.value = false
    showResult.value = true
    
    if (result.prizeId) {
      const prize = prizes.value.find(p => p.id === result.prizeId)
      resultIcon.value = getPrizeIcon(prize?.type)
      resultTitle.value = '🎉 恭喜中奖！'
      resultText.value = `您获得了：${prize?.name || '神秘奖品'}`
      
      uni.showToast({
        title: `恭喜获得: ${prize?.name}`,
        icon: 'success',
        duration: 2000
      })
    } else {
      resultIcon.value = '😔'
      resultTitle.value = '💨 很遗憾'
      resultText.value = '这次没有中奖，再试一次吧！'
      
      uni.showToast({
        title: '很遗憾，未中奖',
        icon: 'none',
        duration: 2000
      })
    }
    
    // 更新抽奖信息
    await loadDrawInfo()
  } catch (error) {
    isSpinning.value = false
    console.error('抽奖失败:', error)
    uni.showToast({
      title: error.data?.message || '抽奖失败',
      icon: 'none'
    })
  }
}

const closeResult = () => {
  showResult.value = false
}

onMounted(async () => {
  userStore.initUser()
  await loadGameData()
  await loadDrawInfo()
})

watch(() => props.game, async () => {
  await loadGameData()
})

watch(() => userStore.user, async (newUser) => {
  if (newUser) {
    await loadDrawInfo()
  }
})
</script>

<style scoped>
.wheel-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 20rpx;
  box-sizing: border-box;
  padding-bottom: 40rpx;
}

/* 游戏标题 */
.game-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.game-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 10rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.game-desc {
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 用户信息 */
.user-info {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  margin-bottom: 30rpx;
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

/* 大转盘主体 */
.wheel-wrapper {
  position: relative;
  width: 600rpx;
  height: 600rpx;
  margin: 0 auto 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 转盘指针 */
.wheel-pointer {
  position: absolute;
  top: -40rpx;
  z-index: 10;
  width: 80rpx;
  height: 80rpx;
  background-color: var(--secondary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  border: 4rpx solid var(--secondary-dark);
}

.wheel-pointer.spinning {
  animation: pointerShake 0.1s infinite;
}

@keyframes pointerShake {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.pointer-icon {
  font-size: 40rpx;
  animation: pulse 2s infinite;
}

/* 转盘 */
.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 10rpx solid var(--secondary-dark);
  transition: transform 0s linear;
}

.wheel.spinning {
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}

/* 转盘扇区 */
.wheel-sector {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 50%;
  transform-origin: 0 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background-color: var(--sector-color, var(--primary-color));
  color: var(--text-light);
}

.sector-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.sector-name {
  font-size: 24rpx;
  font-weight: bold;
  text-align: center;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

/* 控制面板 */
.control-panel {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.spin-button {
  background-color: var(--primary-color);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius-full);
  padding: 24rpx 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 15rpx;
  transition: all 0.3s ease;
  border: 4rpx solid var(--primary-dark);
}

.spin-button:active {
  background-color: var(--primary-dark);
  transform: scale(0.95);
  box-shadow: var(--shadow-sm);
}

.spin-button.disabled {
  background-color: #666;
  border-color: #888;
  cursor: not-allowed;
}

.spin-icon {
  font-size: 40rpx;
}

.spin-text {
  font-size: 32rpx;
  font-weight: bold;
}

/* 抽奖结果 */
.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.result-content {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  padding: 40rpx;
  text-align: center;
  box-shadow: var(--shadow-lg);
  max-width: 80%;
  border: 5rpx solid var(--primary-color);
  animation: slideInUp 0.5s ease-out;
}

.result-icon-wrapper {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 20rpx;
  box-shadow: var(--shadow-md);
}

.result-icon {
  font-size: 60rpx;
  color: var(--text-light);
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 10rpx;
}

.result-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  margin-bottom: 30rpx;
  line-height: 1.4;
}

.result-button {
  background-color: var(--primary-color);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius-full);
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.result-button:active {
  background-color: var(--primary-dark);
  transform: scale(0.98);
}

.result-button-text {
  font-size: 28rpx;
  font-weight: bold;
}

/* 奖品列表 */
.prize-list {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 20rpx;
  display: block;
  text-align: center;
}

.prize-items {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.prize-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: var(--background-color);
  border-radius: var(--border-radius-md);
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
  border: 2rpx solid var(--border-color);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20rpx); }
  to { opacity: 1; transform: translateX(0); }
}

.prize-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  border-radius: 50%;
  margin-right: 20rpx;
  box-shadow: var(--shadow-sm);
}

.prize-icon {
  font-size: 40rpx;
  color: var(--text-light);
}

.prize-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.prize-name {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: bold;
}

.prize-prob {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* 未登录提示 */
.login-tip {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: 40rpx 20rpx;
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
  .wheel-wrapper {
    width: 500rpx;
    height: 500rpx;
  }
  
  .wheel-pointer {
    width: 60rpx;
    height: 60rpx;
    top: -30rpx;
  }
  
  .pointer-icon {
    font-size: 32rpx;
  }
  
  .sector-icon {
    font-size: 40rpx;
  }
  
  .sector-name {
    font-size: 20rpx;
  }
  
  .spin-button {
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
  
  .user-info {
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .info-item {
    flex: 1 1 45%;
  }
  
  .game-title {
    font-size: 36rpx;
  }
  
  .game-desc {
    font-size: 24rpx;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.wheel-container {
  animation: fadeIn 0.6s ease-out;
}

/* 转盘灯光效果 */
.wheel {
  position: relative;
  overflow: hidden;
}

.wheel::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  animation: lightScan 3s infinite;
}

@keyframes lightScan {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>