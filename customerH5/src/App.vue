<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 全局变量定义 */
:root {
  /* 主色调 */
  --primary-color: #e74c3c;
  --primary-dark: #c0392b;
  --primary-light: #f1948a;
  
  /* 辅助色 */
  --secondary-color: #f1c40f;
  --secondary-dark: #f39c12;
  --secondary-light: #f9e79f;
  
  /* 背景色 */
  --background-color: #fef5f5;
  --card-background: #ffffff;
  
  /* 文字颜色 */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-light: #ffffff;
  
  /* 边框颜色 */
  --border-color: #e0e0e0;
  
  /* 阴影 */
  --shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
  
  /* 圆角 */
  --border-radius-sm: 8rpx;
  --border-radius-md: 16rpx;
  --border-radius-lg: 24rpx;
  --border-radius-full: 9999rpx;
}

/* 全局页面样式 */
page {
  background-color: var(--background-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-primary);
  line-height: 1.5;
}

/* 通用容器样式 */
.container {
  width: 100%;
  padding: 20rpx;
  box-sizing: border-box;
}

/* 通用标题样式 */
h1, h2, h3, h4, h5, h6 {
  color: var(--primary-color);
  font-weight: bold;
}

/* 通用按钮样式 */
button {
  border: none;
  outline: none;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

button.primary {
  background-color: var(--primary-color);
  color: var(--text-light);
  box-shadow: var(--shadow-md);
}

button.primary:active {
  background-color: var(--primary-dark);
  transform: scale(0.98);
}

button.secondary {
  background-color: var(--secondary-color);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}

button.secondary:active {
  background-color: var(--secondary-dark);
  transform: scale(0.98);
}

button.disabled {
  background-color: #cccccc;
  color: #999999;
  box-shadow: none;
  cursor: not-allowed;
}

/* 通用卡片样式 */
.card {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: 24rpx;
  margin-bottom: 20rpx;
}

/* 通用徽章样式 */
.badge {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: var(--border-radius-full);
  font-size: 24rpx;
  font-weight: bold;
}

.badge-primary {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.badge-secondary {
  background-color: var(--secondary-color);
  color: var(--text-primary);
}

/* 通用输入框样式 */
input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 32rpx;
  background-color: var(--card-background);
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4rpx rgba(231, 76, 60, 0.1);
}

/* 通用列表样式 */
.list {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 2rpx solid var(--border-color);
}

.list-item:last-child {
  border-bottom: none;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10rpx);
  }
  75% {
    transform: translateX(10rpx);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.shake {
  animation: shake 0.5s ease-in-out;
}

.pulse {
  animation: pulse 2s infinite;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .container {
    padding: 16rpx;
  }
  
  button {
    font-size: 28rpx;
  }
  
  input {
    font-size: 28rpx;
    padding: 16rpx;
  }
}

/* 禁用文本选择 */
.no-select {
  user-select: none;
  -webkit-user-select: none;
}

/* 隐藏滚动条但保留滚动功能 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: transparent;
}
</style>