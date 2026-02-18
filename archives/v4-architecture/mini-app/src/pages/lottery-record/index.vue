<template>
  <view class="lottery-record-page">
    <view class="records">
      <view class="title">抽奖记录</view>
      <view v-if="loading" class="loading">
        加载中...
      </view>
      <view v-else-if="error" class="error">
        {{ error }}
        <view class="retry" @click="loadRecords">重试</view>
      </view>
      <template v-else>
        <view v-for="record in records" :key="record.id" class="record-item">
          <view class="prize-name">{{ record.prizeName }}</view>
          <view class="record-info">
            <text class="date">{{ record.createdAt }}</text>
            <text class="value">{{ record.prizeValue }}{{ getValueType(record.prizeType) }}</text>
          </view>
          <view class="prize-type" :class="record.prizeType">
            {{ getTypeText(record.prizeType) }}
          </view>
        </view>
        <view v-if="records.length === 0" class="empty">
          暂无抽奖记录
        </view>
      </template>
    </view>
    <view class="action">
      <button class="draw-btn" @click="goToGame">去抽奖</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

interface LotteryRecord {
  id: string;
  prizeName: string;
  prizeValue: number;
  prizeType: 'coupon' | 'points' | 'gift';
  createdAt: string;
}

const records = ref<LotteryRecord[]>([]);
const loading = ref(false);
const error = ref('');

const getValueType = (type: string) => {
  const map: Record<string, string> = {
    coupon: '元',
    points: '积分',
    gift: ''
  };
  return map[type] || '';
};

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    coupon: '优惠券',
    points: '积分',
    gift: '实物奖品'
  };
  return map[type] || '';
};

const loadRecords = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await api.lottery.getRecords();
    records.value = data;
  } catch (err: any) {
    error.value = err.message || '获取抽奖记录失败';
    // 使用模拟数据作为兜底
    records.value = [
      { id: '1', prizeName: '10元优惠券', prizeValue: 10, prizeType: 'coupon', createdAt: '2026-02-13 10:00' },
      { id: '2', prizeName: '50积分', prizeValue: 50, prizeType: 'points', createdAt: '2026-02-13 11:00' }
    ];
  } finally {
    loading.value = false;
  }
};

const goToGame = () => {
  uni.navigateTo({ url: '/pages/game/index' });
};

onMounted(() => {
  loadRecords();
});
</script>

<style lang="scss" scoped>
.lottery-record-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.records {
  padding: 40rpx 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
}

.record-item {
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.record-item .prize-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.record-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.date {
  font-size: 24rpx;
  color: #999999;
}

.value {
  font-size: 28rpx;
  font-weight: bold;
  color: #dc2626;
}

.prize-type {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 22rpx;
}

.prize-type.coupon {
  background-color: #dbeafe;
  color: #1e40af;
}

.prize-type.points {
  background-color: #d1fae5;
  color: #065f46;
}

.prize-type.gift {
  background-color: #fef3c7;
  color: #92400e;
}

.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #666666;
  font-size: 28rpx;
}

.error {
  text-align: center;
  padding: 100rpx 40rpx;
  color: #dc2626;
  font-size: 28rpx;
}

.retry {
  display: inline-block;
  margin-top: 20rpx;
  padding: 12rpx 32rpx;
  background-color: #dc2626;
  color: #ffffff;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999999;
  font-size: 28rpx;
}

.action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 30rpx 40rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.draw-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.draw-btn::after {
  border: none;
}
</style>
