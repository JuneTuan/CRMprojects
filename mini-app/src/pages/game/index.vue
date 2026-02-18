<template>
  <view class="game-page">
    <view class="container">
      <view class="game-header">
        <view class="game-title">{{ gameTitle }}</view>
        <view class="game-info">
          <text>剩余抽奖次数: {{ lotteryInfo.freeDraws }}</text>
          <text>积分: {{ lotteryInfo.points }}</text>
        </view>
      </view>
      
      <view v-if="prizesLoading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 大转盘游戏 -->
      <view v-else-if="gameType === 'wheel'" class="game-content">
        <view class="wheel-container">
          <view class="wheel" :class="{ 'spinning': isSpinning }" :style="{ transform: `rotate(${rotation}deg)` }">
            <view class="wheel-sector" v-for="(prize, index) in prizes" :key="index" :style="{ transform: `rotate(${index * (360 / prizes.length)}deg)` }">
              <view class="sector-content">
                <text class="prize-name">{{ prize.name }}</text>
                <text class="prize-value">{{ prize.value }}</text>
              </view>
            </view>
          </view>
          <view class="wheel-center" @click="spinWheel">
            <text class="spin-text">{{ isSpinning ? '抽奖中...' : '点击抽奖' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 老虎机游戏 -->
      <view v-else-if="gameType === 'slot'" class="game-content">
        <view class="slot-container">
          <view class="slot-reels">
            <view class="reel" v-for="(reel, index) in reels" :key="index" :class="{ 'spinning': isSpinning }" :style="{ transform: `translateY(-${reel.position * 100}%)` }">
              <view class="reel-item" v-for="(item, idx) in reel.items" :key="idx">
                <text>{{ item }}</text>
              </view>
            </view>
          </view>
          <button class="spin-btn" @click="spinSlot" :disabled="isSpinning">{{ isSpinning ? '抽奖中...' : '点击抽奖' }}</button>
        </view>
      </view>
      
      <!-- 盲盒游戏 -->
      <view v-else-if="gameType === 'blindbox'" class="game-content">
        <view class="blindbox-container">
          <view class="blindbox" :class="{ 'opening': isOpening }" @click="openBlindbox">
            <view class="blindbox-icon">🎁</view>
            <view v-if="isOpening" class="opening-effect">
              <view class="confetti" v-for="i in 20" :key="i" :style="{ left: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }"></view>
            </view>
          </view>
          <view v-if="prizeResult" class="prize-result">
            <view class="result-title">恭喜您获得</view>
            <view class="result-prize">{{ prizeResult.name }}</view>
            <view class="result-value">{{ prizeResult.value }}</view>
            <button class="result-btn" @click="resetGame">再来一次</button>
          </view>
        </view>
      </view>
      
      <!-- 刮刮乐游戏 -->
      <view v-else-if="gameType === 'scratch'" class="game-content">
        <view class="scratch-container">
          <view class="scratch-card" :class="{ 'scratched': isScratched }">
            <view class="card-content">
              <text class="prize-text" v-if="prizeResult">{{ prizeResult.name }}</text>
              <text class="prize-value" v-if="prizeResult">{{ prizeResult.value }}</text>
            </view>
            <view class="scratch-layer" @touchstart="startScratch" @touchmove="scratch"></view>
          </view>
          <button class="scratch-btn" @click="resetScratch" v-if="isScratched">再来一次</button>
        </view>
      </view>
      
      <!-- 九宫格游戏 -->
      <view v-else-if="gameType === 'lottery'" class="game-content">
        <view class="lottery-grid">
          <view class="grid-item" v-for="(item, index) in gridItems" :key="index" :class="{ 'active': activeIndex === index, 'selected': selectedIndex === index }" @click="selectItem(index)">
            <text v-if="selectedIndex === index">{{ item.prize.name }}</text>
            <text v-else>?</text>
          </view>
        </view>
        <button class="lottery-btn" @click="startLottery" :disabled="isSpinning">
          {{ isSpinning ? '抽奖中...' : '开始抽奖' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../../services/api';

// 游戏类型和参数
const gameType = ref('wheel');
const gameTitle = ref('大转盘');
const lotteryInfo = ref({ freeDraws: 3, points: 0 });
const userId = ref('');

// 游戏状态
const isSpinning = ref(false);
const rotation = ref(0);
const prizes = ref<any[]>([]);
const prizesLoading = ref(true);

// 老虎机相关
const reels = ref([
  { items: ['🎁', '💰', '🎯', '🎉', '🎈', '🔔'], position: 0 },
  { items: ['🎁', '💰', '🎯', '🎉', '🎈', '🔔'], position: 0 },
  { items: ['🎁', '💰', '🎯', '🎉', '🎈', '🔔'], position: 0 }
]);

// 盲盒相关
const isOpening = ref(false);
const prizeResult = ref<any>(null);

// 刮刮乐相关
const isScratched = ref(false);

// 九宫格相关
const gridItems = ref([
  { prize: { name: '10元优惠券', value: '满100减10' } },
  { prize: { name: '谢谢参与', value: '' } },
  { prize: { name: '20元优惠券', value: '满200减20' } },
  { prize: { name: '5元优惠券', value: '满50减5' } },
  { prize: { name: '50元优惠券', value: '满500减50' } },
  { prize: { name: '谢谢参与', value: '' } },
  { prize: { name: '100元优惠券', value: '满1000减100' } },
  { prize: { name: '谢谢参与', value: '' } },
  { prize: { name: '20元优惠券', value: '满200减20' } }
]);
const activeIndex = ref(-1);
const selectedIndex = ref(-1);

// 计算属性
const getGameTitle = () => {
  const titles = {
    wheel: '大转盘',
    slot: '老虎机',
    blindbox: '盲盒',
    scratch: '刮刮乐',
    lottery: '九宫格'
  };
  return titles[gameType.value as keyof typeof titles] || '抽奖游戏';
};

// 方法
const loadLotteryInfo = async () => {
  if (!userId.value) {
    console.error('用户ID不存在');
    return;
  }
  
  try {
    const countRes = await api.lottery.getInfo(userId.value);
    const todayCount = countRes.count || 0;
    const freeDraws = Math.max(0, 3 - todayCount); // 每天3次免费抽奖
    
    // 暂时使用固定积分，后续可以从API获取
    const points = 100;
    
    lotteryInfo.value = {
      freeDraws,
      points
    };
  } catch (error) {
    console.error('获取抽奖信息失败:', error);
    // 使用默认值作为兜底
    lotteryInfo.value = {
      freeDraws: 3,
      points: 100
    };
  }
};

const loadPrizes = async () => {
  prizesLoading.value = true;
  try {
    // 暂时使用默认奖品配置
    // 后续可以从后端获取奖品配置
    prizes.value = [
      { name: '10元优惠券', value: '满100减10' },
      { name: '20元优惠券', value: '满200减20' },
      { name: '50元优惠券', value: '满500减50' },
      { name: '100元优惠券', value: '满1000减100' },
      { name: '谢谢参与', value: '' },
      { name: '5元优惠券', value: '满50减5' }
    ];
  } catch (error) {
    console.error('获取奖品配置失败:', error);
    // 出错时使用默认奖品
    prizes.value = [
      { name: '10元优惠券', value: '满100减10' },
      { name: '20元优惠券', value: '满200减20' },
      { name: '50元优惠券', value: '满500减50' },
      { name: '100元优惠券', value: '满1000减100' },
      { name: '谢谢参与', value: '' },
      { name: '5元优惠券', value: '满50减5' }
    ];
  } finally {
    prizesLoading.value = false;
  }
};

const handleDraw = async () => {
  if (!userId.value) {
    uni.showToast({ title: '用户信息不存在', icon: 'none' });
    return null;
  }
  
  try {
    const res = await api.lottery.draw(userId.value);
    return res;
  } catch (error: any) {
    uni.showToast({ title: error.message || '抽奖失败', icon: 'none' });
    return null;
  }
};

// 大转盘方法
const spinWheel = async () => {
  if (isSpinning.value || lotteryInfo.value.freeDraws <= 0) {
    return;
  }
  
  isSpinning.value = true;
  const result = await handleDraw();
  
  if (result) {
    // 计算旋转角度
    const prizeIndex = prizes.value.findIndex(prize => prize.name === result.prize.name);
    const angle = 360 * 5 + (360 - (prizeIndex * (360 / prizes.value.length)) - 30);
    rotation.value = angle;
    
    setTimeout(() => {
      isSpinning.value = false;
      uni.showModal({
        title: '恭喜',
        content: `您获得了${result.prize.name}\n${result.prize.value}`,
        showCancel: false
      });
      loadLotteryInfo();
    }, 3000);
  } else {
    isSpinning.value = false;
  }
};

// 老虎机方法
const spinSlot = async () => {
  if (isSpinning.value || lotteryInfo.value.freeDraws <= 0) {
    return;
  }
  
  isSpinning.value = true;
  const result = await handleDraw();
  
  if (result) {
    // 随机生成老虎机结果
    reels.value.forEach(reel => {
      reel.position = Math.floor(Math.random() * reel.items.length);
    });
    
    setTimeout(() => {
      isSpinning.value = false;
      uni.showModal({
        title: '恭喜',
        content: `您获得了${result.prize.name}\n${result.prize.value}`,
        showCancel: false
      });
      loadLotteryInfo();
    }, 2000);
  } else {
    isSpinning.value = false;
  }
};

// 盲盒方法
const openBlindbox = async () => {
  if (isOpening.value || lotteryInfo.value.freeDraws <= 0) {
    return;
  }
  
  isOpening.value = true;
  const result = await handleDraw();
  
  if (result) {
    setTimeout(() => {
      prizeResult.value = result.prize;
      loadLotteryInfo();
    }, 1500);
  } else {
    isOpening.value = false;
  }
};

// 刮刮乐方法
const startScratch = () => {
  if (isScratched.value || lotteryInfo.value.freeDraws <= 0) {
    return;
  }
};

const scratch = async (e: any) => {
  if (isScratched.value || lotteryInfo.value.freeDraws <= 0) {
    return;
  }
  
  if (!isScratched.value) {
    isScratched.value = true;
    const result = await handleDraw();
    if (result) {
      prizeResult.value = result.prize;
      loadLotteryInfo();
    }
  }
};

// 九宫格方法
const startLottery = async () => {
  if (isSpinning.value || lotteryInfo.value.freeDraws <= 0) {
    return;
  }
  
  isSpinning.value = true;
  const result = await handleDraw();
  
  if (result) {
    // 模拟九宫格滚动
    let index = 0;
    const interval = setInterval(() => {
      activeIndex.value = index;
      index = (index + 1) % gridItems.value.length;
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      isSpinning.value = false;
      const prizeIndex = gridItems.value.findIndex(item => item.prize.name === result.prize.name);
      selectedIndex.value = prizeIndex >= 0 ? prizeIndex : Math.floor(Math.random() * gridItems.value.length);
      
      uni.showModal({
        title: '恭喜',
        content: `您获得了${result.prize.name}\n${result.prize.value}`,
        showCancel: false
      });
      loadLotteryInfo();
    }, 2000);
  } else {
    isSpinning.value = false;
  }
};

const selectItem = (index: number) => {
  if (selectedIndex.value >= 0) {
    resetGame();
  }
};

const resetGame = () => {
  isOpening.value = false;
  isScratched.value = false;
  prizeResult.value = null;
  selectedIndex.value = -1;
  activeIndex.value = -1;
};

const resetScratch = () => {
  resetGame();
};

// 生命周期
onMounted(async () => {
  // 获取游戏类型和用户ID
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage.options.type) {
    gameType.value = currentPage.options.type as string;
  }
  if (currentPage.options.userId) {
    userId.value = currentPage.options.userId as string;
  }
  gameTitle.value = getGameTitle();
  await loadLotteryInfo();
  await loadPrizes();
});

// 监听游戏类型变化
watch(gameType, async () => {
  gameTitle.value = getGameTitle();
  resetGame();
  await loadPrizes();
});
</script>

<style lang="scss" scoped>
.game-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  padding: 30rpx;
}

.game-header {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.game-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
  text-align: center;
}

.game-info {
  display: flex;
  justify-content: space-around;
  font-size: 24rpx;
  color: #fca5a5;
}

.game-content {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 500rpx;
}

/* 大转盘样式 */
.wheel-container {
  position: relative;
  width: 500rpx;
  height: 500rpx;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #ff6b6b;
  position: relative;
  transition: transform 3s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow: hidden;
}

.wheel-sector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center;
}

.sector-content {
  position: absolute;
  top: 10rpx;
  left: 50%;
  width: 50%;
  height: 50%;
  transform-origin: bottom left;
  transform: rotate(30deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24rpx;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.spin-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #dc2626;
}

/* 老虎机样式 */
.slot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slot-reels {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.reel {
  width: 120rpx;
  height: 200rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
  position: relative;
  transition: transform 2s ease;
}

.reel-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.spin-btn {
  width: 200rpx;
  height: 80rpx;
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 盲盒样式 */
.blindbox-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.blindbox {
  width: 300rpx;
  height: 300rpx;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    transform: scale(1.05);
  }
}

.blindbox-icon {
  font-size: 150rpx;
}

.blindbox image {
  width: 100%;
  height: 100%;
}

.opening-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: 50%;
  width: 10rpx;
  height: 10rpx;
  background-color: #ff6b6b;
  border-radius: 50%;
  animation: confetti 2s ease-out forwards;
}

@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-200rpx) rotate(720deg);
    opacity: 0;
  }
}

.prize-result {
  margin-top: 40rpx;
  text-align: center;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.result-prize {
  font-size: 48rpx;
  font-weight: bold;
  color: #dc2626;
  margin-bottom: 10rpx;
}

.result-value {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 30rpx;
}

.result-btn {
  width: 200rpx;
  height: 80rpx;
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 刮刮乐样式 */
.scratch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scratch-card {
  width: 400rpx;
  height: 200rpx;
  background-color: #f0f0f0;
  border-radius: 20rpx;
  position: relative;
  margin-bottom: 40rpx;
}

.card-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.prize-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #dc2626;
  margin-bottom: 10rpx;
}

.prize-value {
  font-size: 24rpx;
  color: #666666;
}

.scratch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #c0c0c0;
  border-radius: 20rpx;
  cursor: pointer;
}

.scratch-card.scratched .scratch-layer {
  opacity: 0;
}

.scratch-btn {
  width: 200rpx;
  height: 80rpx;
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 九宫格样式 */
.lottery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  width: 400rpx;
  margin-bottom: 40rpx;
}

.grid-item {
  width: 120rpx;
  height: 120rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: #e0e0e0;
  }
}

.grid-item.active {
  background-color: #ffd700;
}

.grid-item.selected {
  background-color: #4caf50;
  color: #ffffff;
}

.lottery-btn {
  width: 200rpx;
  height: 80rpx;
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.loading-text {
  font-size: 32rpx;
  color: #666666;
}
</style>