<template>
  <view class="order-detail-container" v-if="order">
    <view class="order-header">
      <text class="order-no">订单号: {{ order.orderNo }}</text>
      <text class="order-status" :class="getStatusClass(order.status)">
        {{ order.status }}
      </text>
    </view>
    
    <view class="order-info">
      <view class="info-item">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ formatDateTime(order.createdAt) }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">订单金额</text>
        <text class="info-value price">¥{{ order.totalAmount }}</text>
      </view>
    </view>
    
    <view class="order-products">
      <text class="section-title">商品信息</text>
      <view class="product-item" v-for="item in order.items" :key="item.productName">
        <view class="product-info">
          <text class="product-name">{{ item.productName }}</text>
          <text class="product-price">¥{{ item.price }}</text>
        </view>
        <view class="product-quantity">
          <text class="quantity-label">数量</text>
          <text class="quantity-value">x{{ item.quantity }}</text>
        </view>
        <view class="product-subtotal">
          <text class="subtotal-label">小计</text>
          <text class="subtotal-value">¥{{ (item.price * item.quantity).toFixed(2) }}</text>
        </view>
      </view>
    </view>
    
    <view class="order-actions">
      <button class="action-btn" @click="goBack">返回</button>
    </view>
  </view>
  
  <view class="empty" v-else>
    <text class="empty-text">订单不存在</text>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue'
import { orderAPI } from '@/api/index.js'

const order = ref(null)

onLoad(async (options) => {
  if (options.id) {
    await loadOrderDetail(options.id)
  }
})

const loadOrderDetail = async (id) => {
  try {
    const res = await orderAPI.getOrderDetail(id)
    order.value = res
  } catch (error) {
    console.error('加载订单详情失败', error)
    uni.showToast({
      title: '加载订单详情失败',
      icon: 'none'
    })
  }
}

const getStatusClass = (status) => {
  const statusMap = {
    '新建': 'status-pending',
    '已完成': 'status-completed',
    '已退款': 'status-refunded'
  }
  return statusMap[status] || ''
}

const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.order-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.order-header {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-no {
  font-size: 28rpx;
  color: #666;
}

.order-status {
  font-size: 28rpx;
  font-weight: bold;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.status-pending {
  background: #fff3e0;
  color: #ff9800;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-refunded {
  background: #ffebee;
  color: #f44336;
}

.order-info {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.info-value.price {
  color: #ff5722;
  font-size: 32rpx;
}

.info-value.points {
  color: #667eea;
  font-size: 32rpx;
}

.order-products {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.product-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.product-name {
  font-size: 30rpx;
  color: #333;
  flex: 1;
}

.product-price {
  font-size: 28rpx;
  color: #ff5722;
  font-weight: bold;
}

.product-quantity {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.quantity-label {
  font-size: 24rpx;
  color: #999;
}

.quantity-value {
  font-size: 24rpx;
  color: #666;
}

.product-subtotal {
  display: flex;
  justify-content: space-between;
}

.subtotal-label {
  font-size: 24rpx;
  color: #999;
}

.subtotal-value {
  font-size: 28rpx;
  color: #ff5722;
  font-weight: bold;
}

.order-actions {
  padding: 30rpx 0;
}

.action-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
}
</style>