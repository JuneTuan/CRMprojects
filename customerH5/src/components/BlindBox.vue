<template>
  <view class="blind-box-container">
    <view class="blind-box">
      <view 
        class="box-item" 
        v-for="(item, index) in items" 
        :key="index"
        @click="handleBoxClick(index)"
        :class="{ opened: openedBoxIndex === index, disabled: !canDraw && openedBoxIndex === null }"
      >
        <view class="box-content">
          <text class="box-icon" v-if="openedBoxIndex !== index">🎁</text>
          <text class="box-icon" v-else>{{ item.icon }}</text>
          <text class="box-label" v-if="openedBoxIndex === index">{{ item.text }}</text>
        </view>
      </view>
    </view>
    
    <view class="info-text" v-if="!canDraw && openedBoxIndex === null">
      <text>{{ costPoints > 0 ? '积分不足' : '抽奖次数已用完' }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  remainingCount: {
    type: Number,
    default: 0
  },
  costPoints: {
    type: Number,
    default: 0
  },
  actualCostPoints: {
    type: Number,
    default: 0
  },
  userPoints: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['open', 'result'])

const isOpening = ref(false)
const openedBoxIndex = ref(null)

const canDraw = computed(() => {
  if (isOpening.value || openedBoxIndex.value !== null) return false
  
  const cost = props.actualCostPoints || props.costPoints
  if (cost > 0) {
    return props.userPoints >= cost
  } else {
    return props.remainingCount > 0 || props.userPoints >= 10
  }
})

const handleBoxClick = (index) => {
  if (openedBoxIndex.value !== null) return
  
  if (!canDraw.value) {
    uni.showToast({
      title: props.costPoints > 0 ? '积分不足' : '抽奖次数已用完',
      icon: 'none'
    })
    return
  }
  
  isOpening.value = true
  emit('open')
}

const openWithResult = (resultIndex) => {
  openedBoxIndex.value = resultIndex
  isOpening.value = false
  
  setTimeout(() => {
    emit('result', {
      prizeIndex: resultIndex,
      prize: props.items[resultIndex]
    })
  }, 500)
}

defineExpose({
  openWithResult
})
</script>

<style scoped>
.blind-box-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

.blind-box {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 600rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
  box-sizing: border-box;
}

.box-item {
  width: calc(33.33% - 20rpx);
  height: 180rpx;
  margin: 10rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3rpx solid transparent;
  box-sizing: border-box;
}

.box-item.opened {
  background: rgba(255, 255, 255, 0.4);
  border-color: #fff;
}

.box-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.box-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.box-icon {
  font-size: 80rpx;
}

.box-label {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

.info-text {
  text-align: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
}

.info-text text {
  color: #fff;
  font-size: 28rpx;
}
</style>