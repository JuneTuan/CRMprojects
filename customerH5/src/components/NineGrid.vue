<template>
  <view class="nine-grid-container">
    <view class="nine-grid">
      <view 
        class="grid-item" 
        v-for="(item, index) in gridItems" 
        :key="index"
        :style="{ 
          background: getGridBackground(index)
        }"
        :class="{ center: index === 4 }"
      >
        <text class="grid-icon" v-if="index !== 4">{{ item.icon }}</text>
        <button 
          v-else
          class="spin-btn" 
          @click="handleSpin" 
          :disabled="!canDraw"
          :class="{ disabled: !canDraw }"
          hover-class="none"
        >
          <text class="btn-text">{{ isSpinning ? '抽奖中...' : getButtonText() }}</text>
        </button>
      </view>
    </view>
    
    <view class="draw-info" v-if="!isSpinning">
      <text class="info-text">{{ getDrawInfo() }}</text>
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
  userPoints: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['spin', 'result'])

const isSpinning = ref(false)
const highlightedIndex = ref(-1)

const gridItems = computed(() => {
  const items = props.items || []
  const result = []
  
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      result.push(null)
    } else {
      let itemIndex
      if (i < 3) {
        itemIndex = i
      } else if (i === 3) {
        itemIndex = 3
      } else if (i === 5) {
        itemIndex = 4
      } else {
        itemIndex = i - 1
      }
      
      if (itemIndex < items.length && items[itemIndex]) {
        result.push(items[itemIndex])
      } else {
        result.push({ icon: '❓', text: '???' })
      }
    }
  }
  
  return result
})

const getGridBackground = (index) => {
  if (index === 4) return 'transparent'
  if (index === highlightedIndex.value) return '#ff6b6b'
  return index % 2 === 0 ? '#feca57' : '#48dbfb'
}

const canDraw = computed(() => {
  if (isSpinning.value) return false
  
  const canFreeDraw = props.remainingCount > 0
  const canPointsDraw = props.userPoints >= 10
  
  return canFreeDraw || canPointsDraw
})

const getButtonText = () => {
  if (props.remainingCount > 0) {
    return '开始'
  } else {
    return '消耗10积分抽奖'
  }
}

const getDrawInfo = () => {
  if (props.remainingCount > 0) {
    return `剩余免费次数: ${props.remainingCount}次`
  } else {
    return `免费次数已用完，消耗10积分抽奖`
  }
}

const handleSpin = () => {
  if (!canDraw.value) {
    if (props.remainingCount > 0) {
      uni.showToast({
        title: '积分不足',
        icon: 'none'
      })
    } else {
      uni.showToast({
        title: '免费次数已用完，积分不足',
        icon: 'none'
      })
    }
    return
  }
  
  isSpinning.value = true
  emit('spin')
}

const spinWithResult = (resultIndex) => {
  const items = props.items || []
  const gridOrder = [0, 1, 2, 3, 5, 6, 7, 8]
  
  const safeResultIndex = Math.max(0, Math.min(resultIndex, items.length - 1))
  
  let currentIndex = 0
  const duration = 3000
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const totalSteps = gridOrder.length * 3 + safeResultIndex
    const currentStep = Math.floor(progress * totalSteps)
    highlightedIndex.value = gridOrder[currentStep % gridOrder.length]
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isSpinning.value = false
      
      let finalGridIndex
      if (safeResultIndex < 3) {
        finalGridIndex = safeResultIndex
      } else if (safeResultIndex === 3) {
        finalGridIndex = 3
      } else if (safeResultIndex === 4) {
        finalGridIndex = 5
      } else {
        finalGridIndex = safeResultIndex + 1
      }
      
      highlightedIndex.value = finalGridIndex
      
      setTimeout(() => {
        emit('result', {
          prizeIndex: safeResultIndex,
          prize: items[safeResultIndex]
        })
      }, 500)
    }
  }
  
  animate()
}

defineExpose({
  spinWithResult
})
</script>

<style scoped>
.nine-grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
  padding: 40rpx;
}

.nine-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 600rpx;
  height: 600rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
  gap: 10rpx;
}

.grid-item {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s ease;
}

.grid-item.center {
  background: transparent !important;
  box-shadow: none;
}

.grid-icon {
  font-size: 80rpx;
}

.spin-btn {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.spin-btn::after {
  border: none;
}

.spin-btn:active {
  transform: scale(0.95);
}

.spin-btn.disabled {
  background: #999;
  box-shadow: none;
}

.btn-text {
  color: #fff;
}

.draw-info {
  text-align: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
}

.info-text {
  color: #fff;
  font-size: 28rpx;
}
</style>
