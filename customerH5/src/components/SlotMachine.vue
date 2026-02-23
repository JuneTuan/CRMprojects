<template>
  <view class="slot-machine-container">
    <view class="slot-machine">
      <view class="slot-window">
        <view class="slot-column" v-for="(column, colIndex) in 3" :key="colIndex">
          <view class="slot-items" :style="{ transform: `translateY(${getTranslateY(colIndex)}rpx)` }">
            <view 
              class="slot-item" 
              v-for="(item, rowIndex) in displayItems[colIndex]" 
              :key="rowIndex"
            >
              <text class="slot-icon">{{ item.icon }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="slot-line"></view>
    </view>
    
    <button 
      class="spin-btn" 
      @click="handleSpin" 
      :disabled="!canDraw"
      :class="{ disabled: !canDraw }"
    >
      <text class="btn-text">{{ isSpinning ? '抽奖中...' : '开始抽奖' }}</text>
    </button>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

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

const emit = defineEmits(['spin', 'result'])

const isSpinning = ref(false)
const displayItems = ref([[], [], []])
const spinPositions = ref([0, 0, 0])
const itemHeight = 80
const targetResultIndex = ref(null)

const initItems = () => {
  const items = props.items || []
  if (items.length === 0) {
    const defaultItems = [
      { icon: '🎁' },
      { icon: '💎' },
      { icon: '🎉' },
      { icon: '⭐' },
      { icon: '🔥' },
      { icon: '💰' }
    ]
    displayItems.value = [
      [...defaultItems, ...defaultItems, ...defaultItems],
      [...defaultItems, ...defaultItems, ...defaultItems],
      [...defaultItems, ...defaultItems, ...defaultItems]
    ]
  } else {
    displayItems.value = [
      [...items, ...items, ...items],
      [...items, ...items, ...items],
      [...items, ...items, ...items]
    ]
  }
  spinPositions.value = [0, 0, 0]
}

const getTranslateY = (colIndex) => {
  return -(spinPositions.value[colIndex] * itemHeight)
}

const canDraw = computed(() => {
  if (isSpinning.value) return false
  
  const cost = props.actualCostPoints || props.costPoints
  if (cost > 0) {
    return props.userPoints >= cost
  } else {
    return props.remainingCount > 0 || props.userPoints >= 10
  }
})

const handleSpin = () => {
  if (!canDraw.value) return
  
  isSpinning.value = true
  emit('spin')
}

const spinWithResult = (resultIndex) => {
  console.log('老虎机开始旋转，结果索引:', resultIndex)
  targetResultIndex.value = resultIndex
  
  const items = props.items || []
  const actualItems = items.length > 0 ? items : [
    { icon: '🎁' },
    { icon: '💎' },
    { icon: '🎉' },
    { icon: '⭐' },
    { icon: '🔥' },
    { icon: '💰' }
  ]
  const results = []
  
  for (let i = 0; i < 3; i++) {
    results.push(resultIndex % actualItems.length)
  }
  
  console.log('旋转结果:', results)
  
  const baseSpins = 5
  const duration = 2000
  
  for (let i = 0; i < 3; i++) {
    const targetPosition = baseSpins * actualItems.length + results[i]
    
    setTimeout(() => {
      spinPositions.value[i] = targetPosition
      
      if (i === 2) {
        setTimeout(() => {
          console.log('旋转完成，最终位置:', spinPositions.value)
          isSpinning.value = false
          targetResultIndex.value = null
          emit('result', {
            prizeIndex: results[0],
            prize: actualItems[results[0]]
          })
        }, duration)
      }
    }, i * 100)
  }
}

watch(() => props.items, () => {
  initItems()
}, { immediate: true })

onMounted(() => {
  initItems()
})

defineExpose({
  spinWithResult
})
</script>

<style scoped>
.slot-machine-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

.slot-machine {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
  max-width: 100%;
}

.slot-window {
  display: flex;
  gap: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  overflow: hidden;
  max-width: 100%;
}

.slot-column {
  width: 160rpx;
  height: 240rpx;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.slot-items {
  transition: transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}

.slot-item {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slot-icon {
  font-size: 60rpx;
}

.slot-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #ff6b6b, transparent);
  transform: translateY(-50%);
  z-index: 10;
}

.spin-btn {
  width: 400rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
  transition: all 0.3s ease;
}

.spin-btn:active {
  transform: scale(0.98);
}

.spin-btn.disabled {
  background: #999;
  box-shadow: none;
}

.btn-text {
  color: #fff;
}
</style>