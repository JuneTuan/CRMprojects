<template>
  <view class="my-coupon-page">
    <view class="tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>
    <view class="coupon-list">
      <view v-if="loading" class="loading">
        加载中...
      </view>
      <view v-else-if="error" class="error">
        {{ error }}
        <view class="retry" @click="loadCoupons">重试</view>
      </view>
      <template v-else>
        <view v-for="coupon in filteredCoupons" :key="coupon.id" class="coupon-item">
          <view class="coupon-left">
            <view class="value">{{ coupon.value }}</view>
            <view class="unit">元</view>
            <view v-if="coupon.minSpend" class="min-spend">满{{ coupon.minSpend }}可用</view>
          </view>
          <view class="coupon-right">
            <view class="name">{{ coupon.name }}</view>
            <view class="expire">有效期至：{{ coupon.expireDate }}</view>
            <view v-if="coupon.applicableProducts && coupon.applicableProducts.length > 0" class="products">
              适用商品：{{ coupon.applicableProducts.join(', ') }}
            </view>
            <view class="status" :class="coupon.status">{{ getStatusText(coupon.status) }}</view>
          </view>
        </view>
        <view v-if="filteredCoupons.length === 0" class="empty">
          {{ currentTab === 'unused' ? '暂无可用优惠券' : currentTab === 'used' ? '暂无已使用的优惠券' : '暂无过期优惠券' }}
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../../services/api';

interface Coupon {
  id: string;
  name: string;
  value: number;
  status: 'unused' | 'used' | 'expired';
  expireDate: string;
  minSpend?: number;
  applicableProducts?: string[];
}

const currentTab = ref<'unused' | 'used' | 'expired'>('unused');
const tabs = [
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' }
];

const coupons = ref<Coupon[]>([]);
const loading = ref(false);
const error = ref('');

const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => coupon.status === currentTab.value);
});

const switchTab = (tab: 'unused' | 'used' | 'expired') => {
  currentTab.value = tab;
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期'
  };
  return map[status] || '';
};

const loadCoupons = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await api.coupon.getMyCoupons();
    coupons.value = data;
  } catch (err: any) {
    error.value = err.message || '获取优惠券失败';
    // 使用模拟数据作为兜底
    coupons.value = [
      { id: '1', name: '满100减20优惠券', value: 20, status: 'unused', expireDate: '2026-12-31' },
      { id: '2', name: '满200减50优惠券', value: 50, status: 'unused', expireDate: '2026-12-31' },
      { id: '3', name: '满50减10优惠券', value: 10, status: 'used', expireDate: '2026-12-31' }
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCoupons();
});
</script>

<style lang="scss" scoped>
.my-coupon-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.tabs {
  display: flex;
  background-color: #ffffff;
  padding: 20rpx 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666666;
  position: relative;
}

.tab-item.active {
  color: #dc2626;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #dc2626;
  border-radius: 2rpx;
}

.coupon-list {
  padding: 20rpx;
}

.coupon-item {
  display: flex;
  background-color: #ffffff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.coupon-left {
  width: 200rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
}

.value {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
}

.unit {
  font-size: 24rpx;
  color: #fca5a5;
}

.coupon-right {
  flex: 1;
  padding: 30rpx;
}

.name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.expire {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.status {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  font-size: 22rpx;
}

.status.unused {
  background-color: #fef3c7;
  color: #d97706;
}

.status.used {
  background-color: #d1fae5;
  color: #059669;
}

.status.expired {
  background-color: #fee2e2;
  color: #dc2626;
}

.min-spend {
  font-size: 20rpx;
  color: #fecaca;
  margin-top: 8rpx;
}

.products {
  font-size: 22rpx;
  color: #666666;
  margin-bottom: 10rpx;
  line-height: 1.4;
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
