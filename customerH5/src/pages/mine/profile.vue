<template>
  <view class="profile-container">
    <view class="profile-header">
      <view class="avatar-section" @click="handleAvatarClick">
        <view class="avatar">
          <text class="avatar-text">{{ formData.customerName?.charAt(0) || 'U' }}</text>
        </view>
        <text class="avatar-tip">点击更换头像</text>
      </view>
    </view>
    
    <view class="profile-form">
      <view class="form-section">
        <text class="section-title">基本信息</text>
        
        <view class="form-item">
          <text class="label">用户名</text>
          <view class="input-wrapper">
            <input 
              class="input" 
              v-model="formData.customerCode" 
              disabled
              placeholder-class="placeholder"
            />
            <text class="disabled-icon">🔒</text>
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">姓名</text>
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              class="input" 
              v-model="formData.customerName" 
              placeholder="请输入姓名"
              placeholder-class="placeholder"
            />
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">手机号</text>
          <view class="input-wrapper">
            <text class="input-icon">📱</text>
            <input 
              class="input" 
              v-model="formData.phone" 
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              placeholder-class="placeholder"
            />
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">邮箱</text>
          <view class="input-wrapper">
            <text class="input-icon">📧</text>
            <input 
              class="input" 
              v-model="formData.email" 
              type="email"
              placeholder="请输入邮箱"
              placeholder-class="placeholder"
            />
          </view>
        </view>
      </view>
      
      <view class="form-section">
        <text class="section-title">工作信息</text>
        
        <view class="form-item">
          <text class="label">职位</text>
          <view class="input-wrapper">
            <text class="input-icon">💼</text>
            <input 
              class="input" 
              v-model="formData.position" 
              placeholder="请输入职位"
              placeholder-class="placeholder"
            />
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">地址</text>
          <view class="input-wrapper">
            <text class="input-icon">📍</text>
            <input 
              class="input" 
              v-model="formData.address" 
              placeholder="请输入地址"
              placeholder-class="placeholder"
            />
          </view>
        </view>
      </view>
      
      <view class="form-section">
        <text class="section-title">会员信息</text>
        
        <view class="info-item">
          <text class="info-label">会员等级</text>
          <view class="level-badge">
            <text class="level-icon">{{ getLevelIcon(formData.levelIcon) }}</text>
            <text class="level-text">{{ formData.level || '普通会员' }}</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="info-label">当前积分</text>
          <text class="info-value">{{ formData.points || 0 }}</text>
        </view>
      </view>
      
      <button class="save-btn" @click="handleSave" :loading="loading">
        <text class="save-icon">💾</text>
        <text>{{ loading ? '保存中...' : '保存资料' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user.js'
import { userAPI } from '@/api/index.js'

const userStore = useUserStore()
const formData = ref({
  customerCode: '',
  customerName: '',
  phone: '',
  email: '',
  position: '',
  address: '',
  level: '',
  points: 0
})

const loading = ref(false)

const iconMap = {
  'User': '👤',
  'UserFilled': '👤',
  'Avatar': '👤',
  'Medal': '🏅',
  'Trophy': '🏆',
  'Star': '⭐',
  'StarFilled': '⭐',
  'Crown': '👑',
  'Diamond': '💎',
  'Sunny': '☀️',
  'Moon': '🌙',
  'CircleCheck': '✅',
  'CircleCheckFilled': '✅',
  'SuccessFilled': '✅',
  'Warning': '⚠️',
  'WarningFilled': '⚠️',
  'CirclePlus': '➕',
  'CirclePlusFilled': '➕',
  'Promotion': '📈',
  'TrendCharts': '📊',
  'DataAnalysis': '📈',
  'PieChart': '📊',
  'Histogram': '📊',
}

const getLevelIcon = (iconCode) => {
  return iconMap[iconCode] || '👤'
}

onMounted(() => {
  console.log('个人资料页面已挂载')
  userStore.initUser()
  loadProfile()
})

const loadProfile = async () => {
  if (!userStore.user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  try {
    const profile = await userAPI.getProfile()
    console.log('获取到的用户资料:', profile)
    
    formData.value = {
      customerCode: profile.customerCode || '',
      customerName: profile.customerName || '',
      phone: profile.phone || '',
      email: profile.email || '',
      position: profile.position || '',
      address: profile.address || '',
      level: profile.level || '普通会员',
      points: profile.points || 0
    }
  } catch (error) {
    console.error('加载用户资料失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

const handleAvatarClick = () => {
  uni.showToast({
    title: '头像功能开发中',
    icon: 'none'
  })
}

const handleSave = async () => {
  if (!userStore.user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  if (!formData.value.customerName) {
    uni.showToast({
      title: '请输入姓名',
      icon: 'none'
    })
    return
  }
  
  if (!formData.value.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    uni.showToast({
      title: '请输入正确的邮箱格式',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  try {
    const updateData = {
      customerName: formData.value.customerName,
      phone: formData.value.phone,
      email: formData.value.email,
      position: formData.value.position,
      address: formData.value.address
    }
    
    console.log('更新用户资料:', updateData)
    const result = await userAPI.updateProfile(updateData)
    console.log('保存成功，返回结果:', result)
    
    // 更新用户信息，确保保留id字段
    userStore.user.customerName = formData.value.customerName
    userStore.user.phone = formData.value.phone
    userStore.user.email = formData.value.email
    userStore.user.position = formData.value.position
    userStore.user.address = formData.value.address
    
    // 如果后端返回了完整的用户信息，使用后端返回的数据
    if (result && result.id) {
      userStore.user = {
        ...userStore.user,
        id: result.id,
        customerCode: result.customerCode,
        customerName: result.customerName,
        phone: result.phone,
        email: result.email,
        position: result.position,
        address: result.address,
        level: result.level,
        points: result.points
      }
    }
    
    console.log('更新后的用户信息:', userStore.user)
    console.log('用户ID:', userStore.user.id)
    console.log('用户ID类型:', typeof userStore.user.id)
    
    uni.setStorageSync('user', userStore.user)
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: error.data?.message || '保存失败',
      icon: 'none',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-bottom: 40rpx;
  padding-top: 20rpx;
}

.profile-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 40rpx;
  text-align: center;
  box-shadow: var(--shadow-lg);
  margin: 0 20rpx;
  border-radius: var(--border-radius-lg);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  box-shadow: var(--shadow-md);
}

.avatar-text {
  font-size: 56rpx;
  font-weight: bold;
  color: var(--text-light);
}

.avatar-tip {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.profile-form {
  padding: 20rpx;
  margin-top: 20rpx;
}

.form-section {
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--shadow-sm);
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 30rpx;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid var(--border-color);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-size: 28rpx;
  color: var(--text-primary);
  margin-bottom: 12rpx;
  font-weight: bold;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 60rpx 0 70rpx;
  border: 2rpx solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: var(--card-background);
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4rpx rgba(231, 76, 60, 0.1);
}

.input[disabled] {
  background: #f5f5f5;
  color: #999;
  padding-right: 60rpx;
  padding-left: 20rpx;
}

.input-icon {
  position: absolute;
  left: 20rpx;
  font-size: 32rpx;
  z-index: 1;
}

.disabled-icon {
  position: absolute;
  right: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.placeholder {
  color: var(--text-secondary);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.info-value {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--primary-color);
}

.level-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.level-icon {
  font-size: 28rpx;
}

.level-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #fff;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 30rpx;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 4rpx solid var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.save-btn:active {
  background-color: var(--primary-dark);
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.save-btn:disabled {
  background: #999;
  border-color: #888;
  cursor: not-allowed;
}

.save-icon {
  font-size: 32rpx;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .avatar {
    width: 140rpx;
    height: 140rpx;
  }
  
  .avatar-text {
    font-size: 56rpx;
  }
  
  .form-section {
    padding: 24rpx;
  }
  
  .section-title {
    font-size: 28rpx;
  }
  
  .input {
    height: 80rpx;
    font-size: 26rpx;
  }
  
  .save-btn {
    height: 80rpx;
    font-size: 28rpx;
  }
}

/* 动画效果 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-container {
  animation: slideInUp 0.6s ease-out;
}

.form-section {
  animation: slideInUp 0.8s ease-out;
}

.form-section:nth-child(2) {
  animation-delay: 0.1s;
}

.form-section:nth-child(3) {
  animation-delay: 0.2s;
}
</style>