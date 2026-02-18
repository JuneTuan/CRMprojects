# CRM系统 v4.0

基于现代化技术栈的CRM客户关系管理系统，支持客户管理、订单管理、优惠券管理、抽奖功能等。

## 🏗️ 技术栈

### 后端
- **框架**: NestJS 10.4.15
- **数据库**: JSON / SQLite / PostgreSQL（可选）
- **认证**: JWT + Passport
- **ORM**: TypeORM
- **验证**: class-validator + class-transformer

### 管理端
- **框架**: Vue 3.4.21
- **构建工具**: Vite 5.2.8
- **UI组件库**: Element Plus 2.6.1
- **状态管理**: Pinia 2.1.7
- **路由**: Vue Router 4.3.0
- **HTTP客户端**: Axios 1.6.8

### 小程序端
- **框架**: UniApp + Vue 3
- **状态管理**: Pinia
- **构建工具**: Vite
- **多端支持**: 微信小程序、H5、支付宝小程序等

### 运维
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: PM2

## 📁 项目结构

```
v4-architecture/
├── server/              # 后端服务 (NestJS)
│   ├── src/
│   │   ├── admin/      # 管理端API模块
│   │   ├── client/     # 用户端API模块
│   │   ├── entities/   # 数据库实体
│   │   ├── database/   # 数据库配置
│   │   └── common/     # 公共模块
│   ├── Dockerfile
│   └── package.json
│
├── admin-web/           # 管理端 (Vue 3 + Element Plus)
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # 公共组件
│   │   ├── router/     # 路由配置
│   │   ├── api/        # API接口
│   │   ├── stores/     # 状态管理
│   │   └── assets/     # 静态资源
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── mini-app/            # 小程序端 (UniApp + Vue 3)
│   ├── src/
│   │   ├── pages/      # 页面
│   │   ├── components/ # 组件
│   │   ├── services/   # 服务
│   │   ├── stores/     # 状态管理
│   │   ├── utils/      # 工具函数
│   │   └── types/      # 类型定义
│   └── package.json
│
├── nginx/               # Nginx配置
│   └── nginx.conf
│
├── docker-compose.yml   # Docker编排配置
├── ecosystem.config.js  # PM2配置
└── package.json         # 根目录配置
```

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker >= 24.0.0（可选）
- Docker Compose >= 2.20.0（可选）

### 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装各模块依赖
pnpm install --filter server
pnpm install --filter admin-web
pnpm install --filter mini-app
```

### 环境配置

```bash
# 复制环境变量配置文件
cp server/.env.example server/.env

# 根据实际情况修改配置
# server/.env
NODE_ENV=development
PORT=3001

# 数据库类型：json（默认）、sqlite 或 postgres
DB_TYPE=json

# JSON存储配置（DB_TYPE=json时使用）
DATA_DIR=./data

# SQLite配置（DB_TYPE=sqlite时使用）
DB_PATH=./data/crm.db

# PostgreSQL配置（DB_TYPE=postgres时使用）
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crm_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 数据库选择

#### 1. JSON存储（推荐用于开发和测试）
- 优点：无需安装数据库，开箱即用，数据以JSON文件存储
- 缺点：性能较低，不适合生产环境
- 配置：`DB_TYPE=json`

#### 2. SQLite（推荐用于小型项目）
- 优点：轻量级，无需独立数据库服务，性能优于JSON
- 缺点：不适合高并发场景
- 配置：`DB_TYPE=sqlite`

#### 3. PostgreSQL（推荐用于生产环境）
- 优点：高性能，支持高并发，适合生产环境
- 缺点：需要安装PostgreSQL服务
- 配置：`DB_TYPE=postgres`

### 开发环境启动

```bash
# 使用JSON存储（默认，无需启动数据库）
pnpm --filter server dev

# 使用SQLite存储
DB_TYPE=sqlite pnpm --filter server dev

# 使用PostgreSQL存储（需要先启动PostgreSQL）
docker-compose up postgres -d
DB_TYPE=postgres pnpm --filter server dev

# 启动管理端
pnpm --filter admin-web dev

# 启动小程序端
pnpm --filter mini-app dev:mp-weixin
```

### 生产环境部署

#### 使用Docker Compose

```bash
# 使用JSON存储（默认）
docker-compose up -d

# 使用PostgreSQL存储
DB_TYPE=postgres docker-compose --profile postgres up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 使用PM2

```bash
# 构建项目
pnpm --filter server build
pnpm --filter admin-web build

# 启动服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart crm-server

# 停止服务
pm2 stop crm-server
```

## 📊 数据库设计

### 用户表 (users)
- id: 主键
- phone: 手机号（唯一）
- password: 密码（加密）
- name: 姓名
- email: 邮箱
- role: 角色（admin/staff/customer）
- points: 积分
- totalPurchases: 购买总额
- createdAt: 创建时间
- updatedAt: 更新时间

### 产品表 (products)
- id: 主键
- name: 产品名称
- price: 价格
- category: 分类
- stock: 库存
- description: 描述
- imageUrl: 图片URL
- createdAt: 创建时间
- updatedAt: 更新时间

### 订单表 (orders)
- id: 主键
- orderNo: 订单号（唯一）
- customerId: 客户ID
- productId: 产品ID
- quantity: 数量
- totalAmount: 总额
- status: 状态（pending/completed/cancelled）
- createdAt: 创建时间
- updatedAt: 更新时间

### 优惠券表 (coupons)
- id: 主键
- code: 优惠券码（唯一）
- customerId: 客户ID（可选）
- type: 类型（discount/gift）
- value: 金额
- status: 状态（unused/used/expired）
- expiresAt: 过期时间
- createdAt: 创建时间
- updatedAt: 更新时间

### 抽奖记录表 (lottery_records)
- id: 主键
- customerId: 客户ID
- prizeId: 奖品ID
- prizeName: 奖品名称
- prizeValue: 奖品价值
- prizeType: 奖品类型（coupon/points/gift）
- createdAt: 创建时间

## 🔐 API设计

### 管理端API (/api/admin)

#### 认证
- POST /api/admin/auth/login - 管理员登录

#### 客户管理
- GET /api/admin/customers - 获取客户列表
- POST /api/admin/customers - 创建客户
- PUT /api/admin/customers/:id - 更新客户
- DELETE /api/admin/customers/:id - 删除客户

#### 员工管理
- GET /api/admin/staff - 获取员工列表
- POST /api/admin/staff - 创建员工
- PUT /api/admin/staff/:id - 更新员工
- DELETE /api/admin/staff/:id - 删除员工

#### 产品管理
- GET /api/admin/products - 获取产品列表
- POST /api/admin/products - 创建产品
- PUT /api/admin/products/:id - 更新产品
- DELETE /api/admin/products/:id - 删除产品

#### 订单管理
- GET /api/admin/orders - 获取订单列表
- POST /api/admin/orders - 创建订单
- PUT /api/admin/orders/:id - 更新订单
- DELETE /api/admin/orders/:id - 删除订单

#### 优惠券管理
- GET /api/admin/coupons - 获取优惠券列表
- POST /api/admin/coupons - 创建优惠券
- PUT /api/admin/coupons/:id - 更新优惠券
- DELETE /api/admin/coupons/:id - 删除优惠券
- POST /api/admin/coupons/verify - 核销优惠券

#### 抽奖管理
- GET /api/admin/lottery/prizes - 获取奖品列表
- POST /api/admin/lottery/prizes - 创建奖品
- PUT /api/admin/lottery/prizes/:id - 更新奖品
- DELETE /api/admin/lottery/prizes/:id - 删除奖品
- GET /api/admin/lottery/records - 获取抽奖记录

#### 数据统计
- GET /api/admin/statistics/dashboard - 获取看板数据
- GET /api/admin/statistics/sales - 获取销售统计
- GET /api/admin/statistics/customers - 获取客户统计
- GET /api/admin/statistics/lottery - 获取抽奖统计
- GET /api/admin/statistics/points - 获取积分统计

### 用户端API (/api/client)

#### 认证
- POST /api/client/auth/register - 用户注册
- POST /api/client/auth/login - 用户登录

#### 用户信息
- GET /api/client/user/profile - 获取用户信息
- PUT /api/client/user/profile - 更新用户信息

#### 产品
- GET /api/client/products - 获取产品列表
- GET /api/client/products/:id - 获取产品详情

#### 订单
- GET /api/client/orders - 获取订单列表
- GET /api/client/orders/:id - 获取订单详情

#### 优惠券
- GET /api/client/coupons - 获取优惠券列表
- GET /api/client/coupons/:id - 获取优惠券详情

#### 抽奖
- POST /api/client/lottery/draw - 参与抽奖
- GET /api/client/lottery/records - 获取抽奖记录

#### 积分
- GET /api/client/points/history - 获取积分历史

## 🎯 功能特性

### 管理端
- ✅ 数据看板 - 实时展示关键指标
- ✅ 客户管理 - 完整的客户信息管理
- ✅ 员工管理 - 员工账号和权限管理
- ✅ 产品管理 - 产品信息和库存管理
- ✅ 订单管理 - 订单创建和状态跟踪
- ✅ 优惠券管理 - 优惠券发放和核销
- ✅ 抽奖管理 - 奖品配置和概率设置
- ✅ 数据统计 - 多维度数据分析

### 小程序端
- ✅ 用户注册登录
- ✅ 个人中心
- ✅ 产品浏览
- ✅ 订单查询
- ✅ 优惠券管理
- ✅ 抽奖功能
- ✅ 积分查询
- ✅ 优惠券核销

## 🔧 开发规范

### 代码风格
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循TypeScript严格模式

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

## 📝 版本历史

### v4.0 (2026-02-13)
- 架构重构
- 技术栈升级
  - 后端：NestJS + JSON/SQLite/PostgreSQL
  - 管理端：Vue 3 + Element Plus
  - 小程序端：UniApp + Vue 3
- 多数据库支持（JSON/SQLite/PostgreSQL）
- Docker容器化部署
- Nginx反向代理配置
- PM2进程管理配置

## 📄 许可证

MIT License
