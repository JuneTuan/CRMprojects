<template>
  <view class="wheel-container">
    <view class="wheel-wrapper">
      <canvas 
        id="wheelCanvas" 
        canvas-id="wheelCanvas"
        :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
        class="wheel-canvas"
      ></canvas>
      
      <canvas 
        id="lightCanvas" 
        canvas-id="lightCanvas"
        :style="{ width: lightSize + 'px', height: lightSize + 'px' }"
        class="light-canvas"
      ></canvas>
      
      <view class="wheel-pointer"></view>
      
      <view class="wheel-center">
        <button 
          class="spin-btn" 
          @click="handleSpin" 
          :disabled="!canDraw"
          :class="{ disabled: !canDraw }"
          hover-class="none"
        >
          <text class="btn-text">{{ isSpinning ? '抽奖中...' : '开始' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const canvasSize = ref(300)
const lightSize = ref(330)

const isSpinning = ref(false)
const currentRotation = ref(0)
const lightTimer = ref(null)

const wheelCtx = ref(null)
const lightCtx = ref(null)

const itemsNum = computed(() => props.items.length || 1)
const itemsArc = computed(() => 360 / itemsNum.value)
const text = computed(() => props.items.map(item => item.text || ''))
const color = computed(() => ['#ff6b6b', '#feca57'])

const canDraw = computed(() => {
  if (isSpinning.value) return false
  const cost = props.actualCostPoints || props.costPoints
  if (cost > 0) {
    return props.userPoints >= cost
  } else {
    return props.remainingCount > 0 || props.userPoints >= 10
  }
})

const initCanvas = () => {
  const wheelCanvas = uni.createCanvasContext('wheelCanvas')
  const lightCanvas = uni.createCanvasContext('lightCanvas')
  
  wheelCtx.value = wheelCanvas
  lightCtx.value = lightCanvas
  
  drawWheel(0)
  drawLight()
  lightTimer.value = setInterval(drawLight, 1000)
}

const drawWheel = (rotation = 0) => {
  if (!wheelCtx.value) return
  
  const ctx = wheelCtx.value
  const size = canvasSize.value
  const w1 = size / 2
  const h1 = size / 2
  const arc = itemsArc.value
  const num = itemsNum.value
  
  ctx.clearRect(0, 0, size, size)
  
  ctx.save()
  ctx.translate(w1, h1)
  ctx.rotate(rotation * Math.PI / 180)
  ctx.translate(-w1, -h1)
  
  for (let i = 0; i < num; i++) {
    ctx.beginPath()
    ctx.moveTo(w1, h1)
    ctx.arc(w1, h1, w1 - 5, arc * i * Math.PI / 180, (arc + arc * i) * Math.PI / 180)
    ctx.closePath()
    
    if (i % 2 === 0) {
      ctx.fillStyle = color.value[0]
    } else {
      ctx.fillStyle = color.value[1]
    }
    ctx.fill()
    
    ctx.save()
    ctx.beginPath()
    ctx.setFontSize(14)
    ctx.fillStyle = '#000'
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.translate(w1, h1)
    ctx.rotate((arc * (i + 0.5)) * Math.PI / 180)
    ctx.fillText(text.value[i], 0, -(h1 * 0.8))
    ctx.restore()
  }
  
  ctx.restore()
  ctx.draw()
}

let lampIndex = 0
const drawLight = () => {
  if (!lightCtx.value) return
  
  const ctx = lightCtx.value
  const size = lightSize.value
  const w2 = size / 2
  const h2 = size / 2
  const num = itemsNum.value
  
  lampIndex++
  if (lampIndex >= 2) {
    lampIndex = 0
  }
  
  ctx.clearRect(0, 0, size, size)
  
  ctx.beginPath()
  ctx.arc(w2, h2, w2, 0, 2 * Math.PI)
  ctx.fillStyle = '#FA7471'
  ctx.fill()
  
  for (let i = 0; i < num * 2; i++) {
    ctx.save()
    ctx.beginPath()
    ctx.translate(w2, h2)
    ctx.rotate(30 * i * Math.PI / 180)
    ctx.arc(0, h2 - 10, 5, 0, 2 * Math.PI)
    
    if (lampIndex === 0) {
      if (i % 2 === 0) {
        ctx.fillStyle = '#FBF1A9'
      } else {
        ctx.fillStyle = '#fbb936'
      }
    } else {
      if (i % 2 === 0) {
        ctx.fillStyle = '#fbb936'
      } else {
        ctx.fillStyle = '#FBF1A9'
      }
    }
    ctx.fill()
    ctx.restore()
  }
  
  ctx.draw()
}

const handleSpin = () => {
  if (!canDraw.value) return
  isSpinning.value = true
  emit('spin')
}

const spinWithResult = (resultIndex) => {
  if (!wheelCtx.value) return
  
  const arc = itemsArc.value
  const baseSpins = 360 * 5
  const targetAngle = 360 - (resultIndex * arc)
  const randomOffset = (Math.random() - 0.5) * (arc * 0.8)
  
  const totalRotation = currentRotation.value + baseSpins + targetAngle + randomOffset
  
  const duration = 4000
  const startTime = Date.now()
  const startRotation = currentRotation.value
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const ease = 1 - Math.pow(1 - progress, 3)
    const currentRot = startRotation + (totalRotation - startRotation) * ease
    
    currentRotation.value = currentRot
    drawWheel(currentRot)
    
    if (progress < 1) {
      setTimeout(() => requestAnimationFrame(animate), 16)
    } else {
      isSpinning.value = false
      emit('result', {
        prizeIndex: resultIndex,
        prize: props.items[resultIndex]
      })
    }
  }
  
  animate()
}

onMounted(() => {
  setTimeout(() => {
    initCanvas()
  }, 100)
})

onUnmounted(() => {
  if (lightTimer.value) {
    clearInterval(lightTimer.value)
  }
})

defineExpose({
  spinWithResult
})
</script>

<style scoped>
.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.wheel-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  max-width: 90vw;
  max-height: 90vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-canvas {
  position: absolute;
  z-index: 2;
  border-radius: 50%;
}

.light-canvas {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
}

.wheel-pointer {
  position: absolute;
  top: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 20rpx solid transparent;
  border-right: 20rpx solid transparent;
  border-top: 40rpx solid #ff4757;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #ff9ff3 0%, #feca57 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.2);
  z-index: 5;
  border: 4rpx solid #fff;
}

.spin-btn {
  width: 100%;
  height: 100%;
  background: transparent;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.spin-btn::after {
  border: none;
}

.spin-btn.disabled {
  opacity: 0.6;
}

.btn-text {
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}
</style>
