<template>
  <view class="index-page">
    <view class="container">
      <view class="title">春节幸运大转盘</view>
      <view class="subtitle">欢迎参与抽奖活动</view>
      <template v-if="isLoggedIn">
        <view v-if="loading" class="loading-container">
          <text class="loading-text">加载中...</text>
        </view>
        <view v-else-if="activeGames.length === 0" class="empty-container">
          <text class="empty-text">暂无可用游戏</text>
        </view>
        <template v-else>
          <view class="game-list">
            <view class="game-item" v-for="game in activeGames" :key="game.type" @click="goToGame(game.type)">
              <view class="game-icon">{{ game.icon }}</view>
              <view class="game-name">{{ game.name }}</view>
            </view>
          </view>
          <view class="user-info">
            <view class="info-item">
              <text>剩余抽奖次数: {{ lotteryInfo.freeDraws }}</text>
            </view>
            <view class="info-item">
              <text>积分: {{ lotteryInfo.points }}</text>
            </view>
          </view>
        </template>
      </template>
      <template v-else>
        <button class="login-btn" @click="goToLogin">立即参与</button>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

const isLoggedIn = ref(false);
const loading = ref(false);
const activeGames = ref<any[]>([]);
const lotteryInfo = ref({
  freeDraws: 3,
  points: 0
});
const userInfo = ref<any>(null);

const checkLoginStatus = () => {
  const token = uni.getStorageSync('token');
  const user = uni.getStorageSync('user');
  isLoggedIn.value = !!token;
  userInfo.value = user;
};

const loadLotteryInfo = async () => {
  if (!userInfo.value?.id) {
    console.error('用户信息不存在');
    return;
  }
  
  try {
    // 获取今天的抽奖次数
    const countRes = await api.lottery.getInfo(userInfo.value.id);
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

const loadActiveGames = async () => {
  loading.value = true;
  try {
    // 尝试从后台获取当前活动
    const configRes = await api.activity.getActive();
    if (configRes && configRes.games) {
      activeGames.value = configRes.games;
    } else {
      // 如果后台没有配置，使用默认游戏
      activeGames.value = [
        { type: 'wheel', name: '大转盘', icon: '🎡' },
        { type: 'slot', name: '老虎机', icon: '🎰' },
        { type: 'blindbox', name: '盲盒', icon: '🎁' },
        { type: 'scratch', name: '刮刮乐', icon: '🎫' },
        { type: 'lottery', name: '九宫格', icon: '🎯' }
      ];
    }
  } catch (error) {
    console.error('获取活动配置失败:', error);
    // 出错时使用默认游戏
    activeGames.value = [
      { type: 'wheel', name: '大转盘', icon: '🎡' },
      { type: 'slot', name: '老虎机', icon: '🎰' },
      { type: 'blindbox', name: '盲盒', icon: '🎁' },
      { type: 'scratch', name: '刮刮乐', icon: '🎫' },
      { type: 'lottery', name: '九宫格', icon: '🎯' }
    ];
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' });
};

const goToGame = (gameType: string) => {
  if (!userInfo.value?.id) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  uni.navigateTo({ url: `/pages/game/index?type=${gameType}&userId=${userInfo.value.id}` });
};

onMounted(() => {
  checkLoginStatus();
  if (isLoggedIn.value) {
    loadLotteryInfo();
    loadActiveGames();
  } else {
    // 即使未登录也加载游戏配置，以便显示游戏列表
    loadActiveGames();
  }
});
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 40rpx;
}

.container {
  text-align: center;
  width: 100%;
  max-width: 600rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 32rpx;
  color: #fca5a5;
  margin-bottom: 60rpx;
}

.login-btn {
  background-color: #ffffff;
  color: #dc2626;
  border: none;
  border-radius: 50rpx;
  padding: 30rpx 80rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.game-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-bottom: 40rpx;
}

.game-item {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5rpx);
    box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.2);
  }
}

.game-item image {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.game-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.game-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.user-info {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-top: 20rpx;
}

.info-item {
  font-size: 28rpx;
  color: #ffffff;
  margin-bottom: 10rpx;
  &:last-child {
    margin-bottom: 0;
  }
}

.loading-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-text {
  font-size: 32rpx;
  color: #ffffff;
}

.empty-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-text {
  font-size: 32rpx;
  color: #ffffff;
}
</style>
