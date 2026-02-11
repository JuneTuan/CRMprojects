# 春节幸运大转盘设计指南

## 1. 品牌定位

### 1.1 应用定位
为小店客户打造的春节主题抽奖游戏系统，通过抽奖互动提升客户参与度和消费体验。

### 1.2 设计风格
- **关键词**: 喜庆、热烈、温馨、传统、幸运
- **视觉风格**: 现代简约 + 传统春节元素融合
- **目标用户**: 小店客户、会员用户

## 2. 配色方案

### 2.1 主色板
- **春节红（主色）**: `bg-red-600` / `text-red-600` / `border-red-600` (喜庆氛围)
- **喜庆橙（辅色）**: `bg-orange-500` / `text-orange-500` / `border-orange-500` (温暖感)
- **金色（强调色）**: `bg-yellow-500` / `text-yellow-500` / `border-yellow-500` (尊贵、幸运)

### 2.2 中性色
- **背景白**: `bg-white`
- **浅灰背景**: `bg-gray-50`
- **深灰文字**: `text-gray-800`
- **中灰文字**: `text-gray-600`
- **浅灰文字**: `text-gray-400`

### 2.3 语义色
- **成功**: `text-green-500` / `bg-green-50`
- **警告**: `text-yellow-500` / `bg-yellow-50`
- **错误**: `text-red-500` / `bg-red-50`
- **信息**: `text-blue-500` / `bg-blue-50`

## 3. 字体规范

### 3.1 字体层级
- **标题 H1**: `text-2xl font-bold` (24px)
- **标题 H2**: `text-xl font-bold` (20px)
- **标题 H3**: `text-lg font-semibold` (18px)
- **正文**: `text-base` (16px)
- **辅助文字**: `text-sm` (14px)
- **说明文字**: `text-xs` (12px)

### 3.2 字重规范
- **加粗**: `font-bold` (标题、重点强调)
- **半粗**: `font-semibold` (次级标题)
- **常规**: `font-normal` (正文)
- **细体**: `font-light` (辅助文字)

## 4. 间距系统

### 4.1 页面边距
- **手机端**: `p-4` (16px)
- **卡片内边距**: `p-4` (16px)
- **列表项间距**: `gap-3` (12px)

### 4.2 组件间距
- **小间距**: `gap-2` (8px)
- **中间距**: `gap-4` (16px)
- **大间距**: `gap-6` (24px)
- **超大间距**: `gap-8` (32px)

## 5. 组件规范

### 5.1 按钮

#### 主按钮（春节红）
```tsx
<View className="w-full">
  <Button className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold">
    主按钮
  </Button>
</View>
```

#### 次按钮（橙色）
```tsx
<View className="w-full">
  <Button className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold">
    次按钮
  </Button>
</View>
```

#### 禁用态
```tsx
<View className="w-full">
  <Button className="w-full bg-gray-300 text-gray-500 rounded-xl py-3 font-semibold" disabled>
    禁用按钮
  </Button>
</View>
```

### 5.2 卡片容器

#### 基础卡片
```tsx
<View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
  <Text className="block text-lg font-semibold text-gray-800 mb-2">卡片标题</Text>
  <Text className="block text-sm text-gray-600">卡片内容</Text>
</View>
```

#### 金色边框卡片（奖品展示）
```tsx
<View className="bg-white rounded-2xl p-4 shadow-sm border-2 border-yellow-500">
  <Text className="block text-lg font-semibold text-gray-800 mb-2">奖品名称</Text>
  <Text className="block text-sm text-red-600 font-semibold">¥10优惠券</Text>
</View>
```

### 5.3 输入框（跨端兼容）
```tsx
<View className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
  <Input
    className="w-full bg-transparent text-base"
    placeholder="请输入内容"
    placeholderClass="text-gray-400"
  />
</View>
```

### 5.4 列表项
```tsx
<View className="bg-white rounded-xl p-4 mb-3 flex items-center justify-between">
  <View>
    <Text className="block text-base font-semibold text-gray-800">项目名称</Text>
    <Text className="block text-sm text-gray-500">描述信息</Text>
  </View>
  <Text className="text-red-600 font-semibold">¥99.00</Text>
</View>
```

### 5.5 空状态
```tsx
<View className="flex flex-col items-center justify-center py-16">
  <Text className="block text-6xl mb-4">🧧</Text>
  <Text className="block text-lg font-semibold text-gray-600 mb-2">暂无数据</Text>
  <Text className="block text-sm text-gray-400">快去参与活动吧</Text>
</View>
```

### 5.6 加载状态
```tsx
<View className="flex flex-col items-center justify-center py-16">
  <Text className="block text-2xl mb-2">🎯</Text>
  <Text className="block text-sm text-gray-500">加载中...</Text>
</View>
```

## 6. 导航结构

### 6.1 TabBar 配置
```
首页 (index)    - 店铺首页
抽奖 (lottery)  - 大转盘抽奖
客户 (customer) - 客户管理
我的 (profile)  - 个人中心
```

### 6.2 页面跳转规范
- **TabBar 切换**: 使用 `Taro.switchTab()`
- **普通页面跳转**: 使用 `Taro.navigateTo()`
- **返回上一页**: 使用 `Taro.navigateBack()`

## 7. 小程序约束

### 7.1 包体积限制
- 主包大小限制: 2MB
- 分包大小限制: 2MB/包
- 整体包大小限制: 20MB

### 7.2 图片策略
- 优先使用 CDN 图片
- 图片格式: WebP / PNG / JPG
- 建议尺寸: 不超过 1MB
- 图片懒加载: 长列表使用

### 7.3 性能优化
- 避免频繁 setData
- 长列表使用虚拟列表
- 图片资源压缩
- 避免深层嵌套组件

### 7.4 跨端兼容
- **H5/小程序双端兼容**: 所有 Text 组件垂直排列时添加 `block` 类
- **Input 组件**: 必须用 View 包裹，样式放在外层
- **Fixed + Flex**: 必须使用 inline style
- **平台检测**: 使用 `Taro.getEnv() === Taro.ENV_TYPE.WEAPP`

## 8. 主题元素

### 8.1 图标使用
- 抽奖: 🎰 / 🎯
- 奖品: 🧧 / 🎁 / 🎉
- 春节: 🏮 / 🧨 / 🎊
- 成功: ✅
- 失败: ❌

### 8.2 动画效果
- 转盘旋转: 使用 CSS animation
- 中奖弹窗: 淡入淡出 + 缩放
- 按钮点击: 轻微缩放反馈
- 列表加载: 骨架屏

## 9. 特殊页面设计

### 9.1 大转盘抽奖页面
- 转盘: 圆形渐变背景 + 扇形奖品区域
- 指针: 三角形 + 动画旋转
- 中奖弹窗: 金色边框 + 粒子效果
- 次数显示: 显眼的位置提示

### 9.2 登录页面
- 简洁布局: 居中设计
- 春节元素: 红色背景 + 灯笼装饰
- 输入框: 大尺寸 + 清晰提示

### 9.3 卡券列表
- 卡券样式: 齿轮边缘设计
- 状态标识: 不同颜色区分
- 过期提示: 灰色 + 删除线
