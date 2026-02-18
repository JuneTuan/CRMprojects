<template>
  <view class="scratch-card-container">
    <view class="scratch-card">
      <!-- 奖品内容层（底层） -->
      <view class="prize-layer">
        <text class="prize-icon">{{ currentPrize.icon }}</text>
        <text class="prize-text">{{ currentPrize.text }}</text>
      </view>
      
      <!-- 刮奖覆盖层（Canvas） -->
      <canvas
        v-if="showCanvas"
        id="scratchCanvas"
        type="2d"
        class="scratch-canvas"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      ></canvas>
      
      <!-- 未开始时的遮罩 -->
      <view v-if="!isScratching && !isScratched" class="start-mask">
        <text class="mask-text">点击开始刮奖</text>
      </view>
    </view>
    
    <button 
      class="scratch-btn" 
      @click="handleScratch" 
      :disabled="!canDraw"
      :class="{ disabled: !canDraw }"
      hover-class="none"
    >
      <text class="btn-text">{{ isScratching ? '刮奖中...' : '开始刮奖' }}</text>
    </button>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

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

const emit = defineEmits(['scratch', 'result'])

const isScratching = ref(false)
const isScratched = ref(false)
const showCanvas = ref(false)
const currentPrize = ref({ icon: '🎁', text: '???' })

const canvasNode = ref(null)
const ctx = ref(null)
const dpr = ref(1)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const progressTimer = ref(null)

const canDraw = computed(() => {
  if (isScratching.value || isScratched.value) return false
  
  if (props.costPoints > 0) {
    return props.userPoints >= props.costPoints
  } else {
    return props.remainingCount > 0
  }
})

// 初始化 Canvas
const initCanvas = async () => {
  await nextTick()
  
  const query = uni.createSelectorQuery()
  query.select('#scratchCanvas').fields({ node: true, size: true }).exec((res) => {
    if (res && res[0]) {
      const canvas = res[0].node
      canvasNode.value = canvas
      
      dpr.value = uni.getSystemInfoSync().pixelRatio || 1
      canvasWidth.value = res[0].width
      canvasHeight.value = res[0].height
      
      // 设置高清屏
      canvas.width = canvasWidth.value * dpr.value
      canvas.height = canvasHeight.value * dpr.value
      
      const context = canvas.getContext('2d')
      context.scale(dpr.value, dpr.value)
      ctx.value = context
      
      // 绘制灰色遮罩
      drawCover()
    }
  })
}

// 绘制覆盖层
const drawCover = () => {
  if (!ctx.value) return
  
  const ctx2d = ctx.value
  ctx2d.fillStyle = '#C0C0C0'
  ctx2d.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 添加纹理效果
  ctx2d.fillStyle = '#D3D3D3'
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvasWidth.value
    const y = Math.random() * canvasHeight.value
    const radius = Math.random() * 3 + 1
    ctx2d.beginPath()
    ctx2d.arc(x, y, radius, 0, 2 * Math.PI)
    ctx2d.fill()
  }
  
  // 添加文字
  ctx2d.fillStyle = '#999'
  ctx2d.font = `bold ${28 * dpr.value}px Arial`
  ctx2d.textAlign = 'center'
  ctx2d.textBaseline = 'middle'
  ctx2d.fillText('刮开有奖', canvasWidth.value / 2, canvasHeight.value / 2)
}

// 刮开效果
const scratch = (x, y) => {
  if (!ctx.value) return
  
  const ctx2d = ctx.value
  ctx2d.globalCompositeOperation = 'destination-out'
  ctx2d.beginPath()
  ctx2d.arc(x, y, 30 * dpr.value, 0, 2 * Math.PI)
  ctx2d.fill()
}

// 触摸开始
const handleTouchStart = (e) => {
  if (!isScratching.value) return
  
  const touch = e.touches[0]
  
  // 获取canvas的位置信息
  const query = uni.createSelectorQuery()
  query.select('#scratchCanvas').boundingClientRect((rect) => {
    if (rect) {
      const x = (touch.clientX - rect.left) * dpr.value
      const y = (touch.clientY - rect.top) * dpr.value
      scratch(x, y)
      checkScratchProgress()
    }
  }).exec()
}

// 触摸移动
const handleTouchMove = (e) => {
  if (!isScratching.value) return
  
  const touch = e.touches[0]
  
  // 获取canvas的位置信息
  const query = uni.createSelectorQuery()
  query.select('#scratchCanvas').boundingClientRect((rect) => {
    if (rect) {
      const x = (touch.clientX - rect.left) * dpr.value
      const y = (touch.clientY - rect.top) * dpr.value
      scratch(x, y)
      checkScratchProgress()
    }
  }).exec()
}

// 触摸结束
const handleTouchEnd = () => {
  if (!isScratching.value) return
  checkScratchProgress()
}

// 检查刮开进度
const checkScratchProgress = () => {
  if (!ctx.value || !isScratching.value) return
  
  // 清除之前的定时器
  if (progressTimer.value) {
    clearTimeout(progressTimer.value)
  }
  
  // 简化处理：刮动一定次数后自动完成
  // 实际项目中可以计算像素透明度比例
  progressTimer.value = setTimeout(() => {
    if (isScratching.value) {
      finishScratch()
    }
  }, 1500)
}

// 完成刮奖
const finishScratch = () => {
  if (!isScratching.value) return
  
  // 清除定时器
  if (progressTimer.value) {
    clearTimeout(progressTimer.value)
    progressTimer.value = null
  }
  
  isScratching.value = false
  isScratched.value = true
  showCanvas.value = false
  
  // 延迟 emit 结果，让用户看到奖品
  setTimeout(() => {
    const prizeIndex = props.items.findIndex(item => item.text === currentPrize.value.text)
    emit('result', {
      prizeIndex: prizeIndex >= 0 ? prizeIndex : 0,
      prize: currentPrize.value
    })
  }, 300)
}

// 开始刮奖
const handleScratch = () => {
  if (!canDraw.value) return
  
  isScratching.value = true
  showCanvas.value = true
  emit('scratch')
}

// 外部调用：设置中奖结果
const scratchWithResult = async (resultIndex) => {
  const items = props.items || []
  
  if (items.length > 0 && items[resultIndex]) {
    currentPrize.value = items[resultIndex]
  } else {
    currentPrize.value = { icon: '🎁', text: '谢谢参与' }
  }
  
  // 重置状态
  isScratched.value = false
  isScratching.value = false
  showCanvas.value = false
  
  // 清除定时器
  if (progressTimer.value) {
    clearTimeout(progressTimer.value)
    progressTimer.value = null
  }
  
  // 等待DOM更新后再初始化Canvas
  await nextTick()
  
  // 重新初始化 Canvas
  initCanvas()
}

defineExpose({
  scratchWithResult
})
</script>

<style scoped>
.scratch-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
  padding: 40rpx;
}

.scratch-card {
  position: relative;
  width: 600rpx;
  height: 400rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30rpx;
  padding: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.prize-layer {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 560rpx;
  height: 360rpx;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  z-index: 1;
}

.prize-icon {
  font-size: 100rpx;
}

.prize-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.scratch-canvas {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 560rpx;
  height: 360rpx;
  border-radius: 20rpx;
  z-index: 10;
}

.start-mask {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 560rpx;
  height: 360rpx;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.mask-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.scratch-btn {
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

.scratch-btn::after {
  border: none;
}

.scratch-btn:active {
  transform: scale(0.98);
}

.scratch-btn.disabled {
  background: #999;
  box-shadow: none;
}

.btn-text {
  color: #fff;
}
</style>