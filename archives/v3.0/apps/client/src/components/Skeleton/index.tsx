import { View, Text } from '@tarojs/components'
import './index.less'

export default function Skeleton({ type = 'card', count = 1 }: { type?: 'card' | 'list' | 'text', count?: number }) {
  if (type === 'card') {
    return (
      <View className="skeleton-container">
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} className="skeleton-card">
            <View className="skeleton-header">
              <View className="skeleton-title" />
              <View className="skeleton-subtitle" />
            </View>
            <View className="skeleton-content">
              <View className="skeleton-line" />
              <View className="skeleton-line" />
              <View className="skeleton-line short" />
            </View>
          </View>
        ))}
      </View>
    )
  }

  if (type === 'list') {
    return (
      <View className="skeleton-container">
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} className="skeleton-list-item">
            <View className="skeleton-avatar" />
            <View className="skeleton-list-content">
              <View className="skeleton-line" />
              <View className="skeleton-line short" />
            </View>
          </View>
        ))}
      </View>
    )
  }

  if (type === 'text') {
    return (
      <View className="skeleton-container">
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} className="skeleton-text">
            <View className="skeleton-line" />
          </View>
        ))}
      </View>
    )
  }

  return null
}
