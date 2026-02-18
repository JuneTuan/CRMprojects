<template>
  <view class="purchase-record-page">
    <view class="list">
      <view v-if="loading" class="loading">
        加载中...
      </view>
      <view v-else-if="error" class="error">
        {{ error }}
        <view class="retry" @click="loadOrders">重试</view>
      </view>
      <template v-else>
        <view v-for="order in orders" :key="order.id" class="order-item">
          <view class="order-header">
            <view class="order-no">订单号：{{ order.orderNo }}</view>
            <view class="status" :class="order.status">{{ getStatusText(order.status) }}</view>
          </view>
          <view class="order-content">
            <view class="product-name">{{ order.productName }}</view>
            <view class="product-info">
              <text class="quantity">数量：{{ order.quantity }}</text>
              <text class="price">¥{{ order.totalAmount }}</text>
            </view>
            <view v-if="order.paymentMethod" class="payment-method">
              支付方式：{{ order.paymentMethod }}
            </view>
            <view v-if="order.shippingAddress" class="shipping-address">
              收货地址：{{ order.shippingAddress }}
            </view>
          </view>
          <view class="order-footer">
            <view class="date">{{ order.createdAt }}</view>
          </view>
        </view>
        <view v-if="orders.length === 0" class="empty">
          暂无购买记录
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

interface Order {
  id: string;
  orderNo: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  paymentMethod?: string;
  shippingAddress?: string;
}

const orders = ref<Order[]>([]);
const loading = ref(false);
const error = ref('');

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status] || '';
};

const loadOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await api.order.getMyOrders();
    orders.value = data;
  } catch (err: any) {
    error.value = err.message || '获取订单失败';
    // 使用模拟数据作为兜底
    orders.value = [
      { id: '1', orderNo: '20260213001', productName: '商品A', quantity: 2, totalAmount: 200, status: 'completed', createdAt: '2026-02-13 10:00' },
      { id: '2', orderNo: '20260213002', productName: '商品B', quantity: 1, totalAmount: 150, status: 'completed', createdAt: '2026-02-13 11:00' }
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style lang="scss" scoped>
.purchase-record-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.list {
  padding: 20rpx;
}

.order-item {
  background-color: #ffffff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-no {
  font-size: 26rpx;
  color: #666666;
}

.status {
  font-size: 26rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.status.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status.completed {
  background-color: #d1fae5;
  color: #059669;
}

.status.cancelled {
  background-color: #fee2e2;
  color: #dc2626;
}

.order-content {
  margin-bottom: 20rpx;
}

.product-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity {
  font-size: 26rpx;
  color: #666666;
}

.price {
  font-size: 32rpx;
  font-weight: bold;
  color: #dc2626;
}

.order-footer {
  text-align: right;
}

.date {
  font-size: 24rpx;
  color: #999999;
}

.payment-method,
.shipping-address {
  font-size: 24rpx;
  color: #666666;
  margin-top: 10rpx;
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
