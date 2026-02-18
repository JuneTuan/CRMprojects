import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

interface ErrorProps {
  title: string
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
  showRetry?: boolean
}

export default function ErrorComponent({ title, message, onRetry, onDismiss, showRetry = false }: ErrorProps) {
  return (
    <View className="error-container">
      <View className="error-content">
        <View className="error-icon">⚠️</View>
        <View className="error-text">
          <Text className="error-title">{title}</Text>
          {message && <Text className="error-message">{message}</Text>}
        </View>
        <View className="error-actions">
          {showRetry && onRetry && (
            <Button className="error-retry-btn" onClick={onRetry}>
              重试
            </Button>
          )}
          <Button className="error-dismiss-btn" onClick={onDismiss || (() => Taro.navigateBack())}>
            {onDismiss ? '关闭' : '返回'}
          </Button>
        </View>
      </View>
    </View>
  )
}
