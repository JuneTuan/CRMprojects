<template>
  <view class="points-history-page">
    <view class="header">
      <view class="total-label">当前积分</view>
      <view class="total-value">{{ totalPoints }}</view>
      <view class="refresh-btn" @click="loadPointsData">
        <text>刷新</text>
      </view>
    </view>
    <view class="rules-section">
      <view class="section-title">积分规则</view>
      <view class="rules-list">
        <view class="rule-item">
          <view class="rule-icon earn">+</view>
          <view class="rule-content">
            <view class="rule-title">获取积分</view>
            <view class="rule-desc">购买商品、参与抽奖、每日签到</view>
          </view>
        </view>
        <view class="rule-item">
          <view class="rule-icon redeem">-</view>
          <view class="rule-content">
            <view class="rule-title">使用积分</view>
            <view class="rule-desc">兑换优惠券、参与特殊活动</view>
          </view>
        </view>
      </view>
    </view>
    <view class="history-section">
      <view class="section-title">积分历史</view>
      <view v-if="loading" class="loading">
        加载中...
      </view>
      <view v-else-if="error" class="error">
        {{ error }}
        <view class="retry" @click="loadPointsData">重试</view>
      </view>
      <template v-else>
        <view v-for="record in records" :key="record.id" class="record-item">
          <view class="record-left">
            <view class="reason">{{ record.reason }}</view>
            <view class="date">{{ record.createdAt }}</view>
          </view>
          <view class="record-right" :class="record.type">
            {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
          </view>
        </view>
        <view v-if="records.length === 0" class="empty">
          暂无积分记录
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

interface PointsRecord {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  reason: string;
  createdAt: string;
}

const records = ref<PointsRecord[]>([]);
const totalPoints = ref(0);
const loading = ref(false);
const error = ref('');

const loadPointsData = async () => {
  loading.value = true;
  error.value = '';
  try {
    // 并行请求积分余额和积分历史
    const [balanceData, historyData] = await Promise.all([
      api.points.getBalance(),
      api.points.getHistory()
    ]);
    totalPoints.value = balanceData;
    records.value = historyData;
  } catch (err: any) {
    error.value = err.message || '获取积分数据失败';
    // 使用模拟数据作为兜底
    totalPoints.value = 500;
    records.value = [
      { id: '1', type: 'earn', amount: 100, reason: '购买商品获得', createdAt: '2026-02-13 10:00' },
      { id: '2', type: 'redeem', amount: 50, reason: '兑换优惠券', createdAt: '2026-02-13 11:00' }
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPointsData();
});
</script>

<style lang="scss" scoped>
.points-history-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 60rpx 40rpx;
  text-align: center;
  position: relative;
}

.total-label {
  font-size: 28rpx;
  color: #fca5a5;
  margin-bottom: 20rpx;
}

.total-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.refresh-btn {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  padding: 12rpx 24rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  color: #ffffff;
  font-size: 24rpx;
}

.rules-section {
  background-color: #ffffff;
  margin: 20rpx;
  border-radius: 10rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.history-section {
  background-color: #ffffff;
  margin: 20rpx;
  border-radius: 10rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.rule-icon {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.rule-icon.earn {
  background-color: #d1fae5;
  color: #059669;
}

.rule-icon.redeem {
  background-color: #fee2e2;
  color: #dc2626;
}

.rule-content {
  flex: 1;
}

.rule-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 5rpx;
}

.rule-desc {
  font-size: 24rpx;
  color: #666666;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  flex: 1;
}

.reason {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.date {
  font-size: 24rpx;
  color: #999999;
}

.record-right {
  font-size: 36rpx;
  font-weight: bold;
}

.record-right.earn {
  color: #059669;
}

.record-right.redeem {
  color: #dc2626;
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
</style>
