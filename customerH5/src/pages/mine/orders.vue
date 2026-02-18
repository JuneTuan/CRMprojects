<template>
  <view class="orders-container">
    <view v-if="!userStore.user" class="empty">
      <text class="empty-text">请先登录查看订单</text>
      <button class="login-btn" @click="goToLogin">去登录</button>
    </view>
    
    <view v-else-if="orders.length === 0" class="empty">
      <text class="empty-text">暂无订单</text>
    </view>
    
    <view v-else class="order-list">
      <view class="order-item" v-for="order in orders" :key="order.orderId" @click="viewOrderDetail(order.orderId)">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">{{ order.status }}</text>
        </view>
        
        <view class="order-content">
          <view class="order-product" v-for="item in order.items" :key="item.productName">
            <text class="product-name">{{ item.productName }}</text>
            <text class="product-info">x{{ item.quantity }}</text>
          </view>
        </view>
        
        <view class="order-footer">
          <text class="order-time">{{ formatDate(order.createdAt) }}</text>
          <text class="order-total">¥{{ order.totalAmount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { orderAPI } from '@/api/index.js'
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
const orders = ref([])

onMounted(async () => {
  userStore.initUser()
  if (userStore.user) {
    await loadOrders()
  }
})

const loadOrders = async () => {
  if (!userStore.user) return
  
  try {
    const res = await orderAPI.getOrders()
    orders.value = res || []
  } catch (error) {
    console.error('加载订单失败', error)
    uni.showToast({
      title: '加载订单失败',
      icon: 'none'
    })
  }
}

const viewOrderDetail = (id) => {
  uni.navigateTo({
    url: `/pages/mine/order-detail?id=${id}`
  })
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

const getStatusClass = (status) => {
  const statusMap = {
    '新建': 'status-pending',
    '已完成': 'status-completed',
    '已退款': 'status-refunded'
  }
  return statusMap[status] || ''
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 600rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.login-btn {
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
  font-size: 28rpx;
  color: #666;
}

.order-status {
  font-size: 28rpx;
  font-weight: bold;
}

.status-pending {
  color: #ff9800;
}

.status-completed {
  color: #4caf50;
}

.status-refunded {
  color: #f44336;
}

.order-content {
  margin-bottom: 20rpx;
}

.order-product {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.product-name {
  font-size: 30rpx;
  color: #333;
  flex: 1;
}

.product-info {
  font-size: 28rpx;
  color: #666;
  margin-left: 20rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff5722;
}
</style>