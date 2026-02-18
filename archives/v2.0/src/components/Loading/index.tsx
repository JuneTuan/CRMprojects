import { View, Text } from '@tarojs/components'
import './index.less'

export default function Loading({ text = '加载中...', size = 'medium' }: { text?: string, size?: 'small' | 'medium' | 'large' }) {
  const sizeClass = `loading-${size}`

  return (
    <View className="loading-container">
      <View className={`loading-spinner ${sizeClass}`}>
        <View className="loading-ring" />
        <View className="loading-ring" />
        <View className="loading-ring" />
      </View>
      {text && <Text className="loading-text">{text}</Text>}
    </View>
  )
}
