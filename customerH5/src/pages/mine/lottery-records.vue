<template>
  <view class="lottery-records-container">
    <view v-if="records.length === 0" class="empty">
      <text class="empty-text">暂无抽奖记录</text>
    </view>
    
    <view v-else class="record-list">
      <view class="record-item" v-for="record in records" :key="record.lotteryRecordId">
        <view class="record-header">
          <text class="record-game">{{ record.gameTypeName || '抽奖' }}</text>
          <text class="record-status" :class="getStatusClass(record.status)">
            {{ record.status }}
          </text>
        </view>
        
        <view class="record-content">
          <text class="record-prize" v-if="record.prize?.prizeName">
            🎁 {{ record.prize.prizeName }}
          </text>
          <text class="record-prize" v-else>
            😔 未中奖
          </text>
        </view>
        
        <view class="record-footer">
          <text class="record-time">{{ formatDate(record.drawTime) }}</text>
          <button 
            v-if="record.status === '未领取' && record.prize?.prizeName"
            class="claim-btn"
            @click="handleClaim(record)"
          >
            领取奖品
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user.js'
import { lotteryAPI } from '@/api/index.js'

const userStore = useUserStore()
const records = ref([])

onMounted(async () => {
  userStore.initUser()
  await loadRecords()
})

const loadRecords = async () => {
  if (!userStore.user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  try {
    const res = await lotteryAPI.getRecords()
    records.value = res || []
  } catch (error) {
    console.error('加载抽奖记录失败', error)
    uni.showToast({
      title: '加载抽奖记录失败',
      icon: 'none'
    })
  }
}

const handleClaim = async (record) => {
  uni.showModal({
    title: '确认领取',
    content: `确定要领取"${record.prize?.prizeName}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await lotteryAPI.claimPrize(record.lotteryRecordId)
          uni.showToast({
            title: '领取成功',
            icon: 'success'
          })
          await loadRecords()
        } catch (error) {
          console.error('领取失败', error)
          uni.showToast({
            title: error.data?.message || '领取失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const getStatusClass = (status) => {
  const statusMap = {
    '未领取': 'status-pending',
    '已领取': 'status-received',
    '未中奖': 'status-lost'
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
.lottery-records-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
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

.record-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.record-game {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.record-status {
  font-size: 24rpx;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.status-pending {
  background: #fff3e0;
  color: #ff9800;
}

.status-received {
  background: #e8f5e9;
  color: #4caf50;
}

.status-lost {
  background: #ffebee;
  color: #f44336;
}

.record-content {
  margin-bottom: 20rpx;
}

.record-prize {
  font-size: 32rpx;
  color: #667eea;
  font-weight: bold;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.claim-btn {
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
}
</style>