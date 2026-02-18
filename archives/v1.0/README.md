# CRM系统 v1.0 归档

## 版本信息
- **版本号**: v1.0
- **归档日期**: 2026-02-12
- **状态**: 稳定版本

## 包含内容

### 前端代码
- 源代码目录: `src/`
- 技术栈: Taro 4.1.9 + React 18 + TypeScript + TailwindCSS
- 主要功能页面:
  - 登录/注册
  - 客户管理
  - 产品管理
  - 订单管理
  - 活动管理
  - 抽奖系统
  - 奖品管理
  - 优惠券管理
  - 积分规则管理
  - 个人中心

### 后端代码
- 源代码目录: `server/src/`
- 技术栈: NestJS 10.4.15 + TypeScript + JSON文件存储
- 主要模块:
  - 用户认证 (auth)
  - 客户管理 (customer)
  - 产品管理 (product)
  - 订单管理 (order)
  - 活动管理 (activity)
  - 抽奖系统 (lottery)
  - 奖品管理 (prize)
  - 优惠券管理 (coupon)
  - 积分规则 (points-rule)
  - 抽奖设置 (lottery-setting)

### 数据文件
- 数据目录: `server/data/`
- 包含文件:
  - users.json (用户数据)
  - customers.json (客户数据)
  - products.json (产品数据)
  - orders.json (订单数据)
  - prizes.json (奖品数据)
  - coupons.json (优惠券数据)
  - activities.json (活动数据)
  - lotterySettings.json (抽奖设置)
  - pointsRules.json (积分规则)
  - lotteryRecords.json (抽奖记录)

### 配置文件
- package.json (依赖配置)
- pnpm-workspace.yaml (工作区配置)
- tsconfig.json (TypeScript配置)
- project.config.json (Taro项目配置)

## 如何使用

### 安装依赖
```bash
cd archives/v1.0
pnpm install
```

### 启动后端服务
```bash
cd server
pnpm install
pnpm run build
node dist/main.js
```

### 启动前端服务
```bash
cd ..
pnpm run dev:web
```

### 访问地址
- 前端: http://localhost:5001
- 后端: http://localhost:3001

## 默认账号
- 管理员账号: admin / 123456

## 已知问题
- 无

## 功能特性
- ✅ 用户认证和权限管理
- ✅ 客户管理（增删改查）
- ✅ 产品管理（增删改查）
- ✅ 订单管理（增删改查）
- ✅ 活动管理（增删改查）
- ✅ 抽奖系统（100%中奖率）
- ✅ 奖品管理（增删改查）
- ✅ 优惠券管理（增删改查）
- ✅ 积分规则管理（增删改查）
- ✅ 订单自动关联客户
- ✅ 订单完成后自动增加积分
- ✅ 前后台用户注册联动
- ✅ 订单状态自动设置为已完成

## 技术栈
- 前端: Taro 4.1.9, React 18, TypeScript, TailwindCSS, Zustand
- 后端: NestJS 10.4.15, TypeScript, JSON文件存储
- 构建工具: Vite, pnpm, ESLint, TypeScript编译器
- API架构: RESTful API设计，全局API前缀
- 安全: 密码哈希存储，类型安全

## 注意事项
1. 本版本使用JSON文件存储数据，适合小型应用
2. 数据文件位于 `server/data/` 目录
3. 建议定期备份数据文件
4. 生产环境建议使用数据库（MySQL/PostgreSQL）

## 版本历史
- v1.0 (2026-02-12): 初始稳定版本
