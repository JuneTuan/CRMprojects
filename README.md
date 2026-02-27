# JunLite CRM V6.0

## 📋 项目概述

JunLite CRM V6.0 是一个完整的客户关系管理系统，采用现代化的前后端分离架构，提供管理端和H5前端双端支持。

### 核心特性

- 🎯 **完整的功能模块**：客户管理、产品管理、订单管理、优惠券管理、活动管理、抽奖系统、员工管理、统计分析、审计日志、会员等级系统、文件上传、**线索管理、字典管理**
- 🚀 **现代化技术栈**：Vue 3、NestJS、TypeScript、MySQL
- 📱 **双端支持**：Web管理端 + H5前端
- 🔐 **完善的权限系统**：基于角色的访问控制（RBAC）
- 🎁 **营销活动**：优惠券、抽奖活动、积分系统
- 📊 **数据统计**：仪表板、销售统计、客户分析
- 📋 **审计日志**：登录记录、操作记录、安全审计
- 🏆 **会员等级系统**：自动升级、等级权益、等级变更历史
- 📁 **文件上传**：图片上传、文件管理
- 🔄 **线索转化**：线索录入、分配、跟进、转化为客户和订单
- 📖 **字典管理**：可配置的枚举值管理，支持客户来源等动态配置

---

## 🆕 V6.0 新增功能

### 线索管理模块
- 线索录入与管理
- 线索分配给销售人员
- 线索跟进记录
- 线索评分系统
- 线索转化为客户和订单

### 字典管理模块
- 可配置的枚举值管理
- 客户来源动态配置
- 支持多类型字典

### 客户管理增强
- 支持表格排序
- 支持分页浏览
- 来源字段使用字典值

### H5注册优化
- 自动标注注册来源
- 支持字典来源配置

---

## 📁 目录结构

```
CRMprojects/
├── admin-web/              # Web管理端
│   ├── src/
│   │   ├── api/          # API请求配置
│   │   ├── assets/       # 静态资源
│   │   ├── components/   # 公共组件
│   │   ├── pages/        # 页面组件
│   │   │   ├── Activity/     # 活动管理
│   │   │   ├── AuditLog/     # 审计日志
│   │   │   ├── Coupon/       # 优惠券管理
│   │   │   ├── Customer/     # 客户管理
│   │   │   ├── Dashboard/    # 仪表板
│   │   │   ├── Dictionary/   # 字典管理 (V6.0新增)
│   │   │   ├── Leads/        # 线索管理 (V6.0新增)
│   │   │   ├── Login/        # 登录页
│   │   │   ├── Lottery/      # 抽奖管理
│   │   │   ├── MemberLevel/  # 会员等级
│   │   │   ├── Order/        # 订单管理
│   │   │   ├── Permission/   # 权限管理
│   │   │   ├── Product/      # 产品管理
│   │   │   ├── Staff/        # 员工管理
│   │   │   └── Statistics/   # 统计分析
│   │   ├── router/       # 路由配置
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── customerH5/             # H5前端（顾客移动端）
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   │   ├── coupon-verify/    # 优惠券核销
│   │   │   ├── edit-profile/     # 编辑资料
│   │   │   ├── game/            # 抽奖游戏
│   │   │   ├── index/           # 首页
│   │   │   ├── login/           # 登录页
│   │   │   ├── lottery-record/   # 抽奖记录
│   │   │   ├── my-coupon/       # 我的优惠券
│   │   │   ├── points-history/   # 积分记录
│   │   │   ├── profile/         # 个人中心
│   │   │   ├── purchase-record/  # 购买记录
│   │   │   └── register/        # 注册页
│   │   ├── services/     # API服务
│   │   ├── stores/       # 状态管理
│   │   ├── types/        # 类型定义
│   │   ├── utils/        # 工具函数
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── manifest.json
│   │   └── pages.json
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                 # 后端服务
│   ├── src/
│   │   ├── activity/     # 活动模块
│   │   ├── auth/         # 认证授权模块
│   │   ├── coupon/       # 优惠券模块
│   │   ├── audit/        # 审计日志模块
│   │   ├── customer/     # 客户模块
│   │   ├── dashboard/    # 仪表板模块
│   │   ├── dictionary/   # 字典模块 (V6.0新增)
│   │   ├── h5/           # H5接口模块
│   │   ├── leads/        # 线索模块 (V6.0新增)
│   │   ├── lottery/      # 抽奖模块
│   │   ├── member-level/ # 会员等级模块
│   │   ├── order/        # 订单模块
│   │   ├── prize/        # 奖品模块
│   │   ├── product/      # 产品模块
│   │   ├── staff/        # 员工模块
│   │   ├── statistics/   # 统计模块
│   │   ├── upload/       # 文件上传模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
│
├── database/               # 数据库脚本
│   └── init/
│       └── 01-init-v6.0.sql  # V6.0初始化脚本
│
├── docker-compose.yml      # Docker编排配置
├── .env.example            # 环境变量示例
├── V6.0_DEPLOYMENT_GUIDE.md # V6.0部署指南
├── V6.0_DATABASE_MIGRATION.sql # 数据库迁移脚本
└── README.md               # 项目说明
```

---

## 🛠️ 技术栈

### 后端服务

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| NestJS | 10.0.0 | 后端框架 |
| TypeScript | 5.x | 类型安全 |
| TypeORM | 0.3.0 | ORM框架 |
| MySQL | 8.0+ | 数据库 |
| Passport | 0.6.0 | 认证中间件 |
| JWT | 10.0.0 | Token认证 |
| bcrypt | 5.0.0 | 密码加密 |

### Web管理端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4.21 | 前端框架 |
| Vite | 5.4.21 | 构建工具 |
| TypeScript | 5.4.5 | 类型安全 |
| Element Plus | 2.13.2 | UI组件库 |
| Vue Router | 4.6.4 | 路由管理 |
| Pinia | 2.3.1 | 状态管理 |
| Axios | 1.13.5 | HTTP客户端 |

### H5前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4.21 | 前端框架 |
| UniApp | 3.0.0 | 跨平台框架 |
| TypeScript | 5.4.5 | 类型安全 |
| Pinia | 2.1.7 | 状态管理 |
| Vite | 5.2.8 | 构建工具 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    JunLite CRM V6.0                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
│  Admin Web   │    │   Server    │    │  Customer   │
│  (Vue 3)     │    │  (NestJS)   │    │  H5(UniApp) │
└───────┬──────┘    └──────┬──────┘    └──────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                      ┌───────▼────────┐
                      │    MySQL DB    │
                      │   (20 Tables)  │
                      └────────────────┘
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 pnpm

### 1. 克隆代码

```bash
git clone https://github.com/JuneTuan/CRMprojects.git
cd CRMprojects
git checkout v6-release
```

### 2. 数据库初始化

```bash
mysql -u root -p < V6.0_DATABASE_MIGRATION.sql
```

### 3. 后端服务启动

```bash
cd server
npm install
cp .env.example .env
# 配置数据库连接信息
npm run start:dev
```

后端服务将在 `http://localhost:3001` 启动

### 4. Web管理端启动

```bash
cd admin-web
npm install
npm run dev
```

管理端将在 `http://localhost:5173` 启动

### 5. H5前端启动

```bash
cd customerH5
npm install
npm run dev:h5
```

---

## 📦 功能模块

### 管理端功能

| 模块 | 功能 |
|------|------|
| 仪表板 | 数据概览、统计图表 |
| 客户管理 | 客户CRUD、积分管理、积分历史、排序分页 |
| 产品管理 | 产品CRUD、库存管理 |
| 订单管理 | 订单CRUD、支付、取消、订单项管理 |
| 优惠券管理 | 优惠券CRUD、核销 |
| 活动管理 | 活动CRUD、游戏配置 |
| 抽奖管理 | 奖品管理、抽奖记录 |
| 员工管理 | 员工CRUD、角色权限 |
| 统计分析 | 销售统计、客户分析 |
| 审计日志 | 登录记录、操作记录、安全审计 |
| 会员等级 | 等级配置、自动升级、等级变更历史 |
| **线索管理** | **线索录入、分配、跟进、转化** (V6.0新增) |
| **字典管理** | **枚举值配置、客户来源管理** (V6.0新增) |

### H5前端功能

| 模块 | 功能 |
|------|------|
| 登录注册 | 用户认证、自动标注来源 |
| 首页 | 活动列表、游戏入口 |
| 抽奖游戏 | 参与抽奖活动 |
| 我的优惠券 | 优惠券列表、使用 |
| 积分记录 | 积分余额、积分历史 |
| 购买记录 | 订单列表、订单详情 |
| 抽奖记录 | 抽奖历史、奖品领取 |
| 个人中心 | 用户信息、设置 |

---

## 🔌 API接口

### 认证接口

```
POST /auth/login        # 用户登录
POST /auth/register     # 用户注册
GET  /auth/profile      # 获取用户信息（需认证）
```

### 客户接口

```
GET    /api/v6/customers              # 获取客户列表（支持排序、分页）
GET    /api/v6/customers/:id          # 获取客户详情
POST   /api/v6/customers              # 创建客户
PUT    /api/v6/customers/:id          # 更新客户
DELETE /api/v6/customers/:id          # 删除客户
GET    /api/v6/customers/:id/points-history # 获取积分历史
```

### 线索接口 (V6.0新增)

```
GET    /api/v6/leads                  # 获取线索列表
GET    /api/v6/leads/:id              # 获取线索详情
POST   /api/v6/leads                  # 创建线索
PUT    /api/v6/leads/:id              # 更新线索
DELETE /api/v6/leads/:id              # 删除线索
POST   /api/v6/leads/:id/convert      # 转化线索为客户和订单
POST   /api/v6/leads/:id/assign       # 分配线索给销售人员
POST   /api/v6/leads/:id/followups    # 添加跟进记录
GET    /api/v6/leads/:id/followups    # 获取跟进记录
```

### 字典接口 (V6.0新增)

```
GET    /api/v6/dictionary             # 获取字典列表（需认证）
GET    /api/v6/dictionary/type/:type  # 按类型获取字典（公开）
GET    /api/v6/dictionary/types       # 获取所有字典类型（需认证）
POST   /api/v6/dictionary             # 创建字典项（需认证）
PUT    /api/v6/dictionary/:id         # 更新字典项（需认证）
DELETE /api/v6/dictionary/:id         # 删除字典项（需认证）
```

### 订单接口

```
GET    /orders                # 获取订单列表
GET    /orders/:id            # 获取订单详情
POST   /orders                # 创建订单（支持线索转化）
PUT    /orders/:id            # 更新订单
PUT    /orders/:id/pay        # 支付订单
PUT    /orders/:id/cancel     # 取消订单
DELETE /orders/:id            # 删除订单
```

---

## 🐳 Docker部署

### 快速部署

```bash
# 配置环境变量
cp .env.example .env

# 启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

### 服务访问

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:8080 |
| H5前端 | http://localhost:8081 |
| 后端API | http://localhost:3001 |
| MySQL | localhost:3306 |

详细部署指南请参考：[V6.0_DEPLOYMENT_GUIDE.md](./V6.0_DEPLOYMENT_GUIDE.md)

---

## 📊 数据库设计

系统包含20张核心数据表：

| 表名 | 用途 |
|------|------|
| roles | 角色管理 |
| permissions | 权限管理 |
| users | 用户管理 |
| customers | 客户管理 |
| products | 产品管理 |
| coupons | 优惠券管理 |
| orders | 订单管理 |
| order_items | 订单明细 |
| customer_coupons | 客户优惠券 |
| game_types | 游戏类型 |
| activities | 活动管理 |
| activity_games | 活动游戏 |
| prizes | 奖品管理 |
| game_prizes | 游戏奖品 |
| lottery_records | 抽奖记录 |
| points_records | 积分记录 |
| role_permissions | 角色权限 |
| member_levels | 会员等级 |
| **leads** | **线索管理** (V6.0新增) |
| **lead_followups** | **线索跟进** (V6.0新增) |
| **lead_assignments** | **线索分配** (V6.0新增) |
| **dictionary** | **字典管理** (V6.0新增) |

---

## 📝 更新日志

### V6.0 (2026-02-28)

**新增功能**:
- 线索管理模块：线索录入、分配、跟进、转化
- 字典管理模块：可配置枚举值管理
- 客户管理排序和分页功能
- H5注册自动标注来源

**优化改进**:
- 订单管理支持线索转化
- 后端API支持动态排序
- 字典接口支持匿名访问

---

## 📄 许可证

本项目仅供学习和研究使用。

---

## 📞 联系方式

- **GitHub**: https://github.com/JuneTuan/CRMprojects
- **Issues**: https://github.com/JuneTuan/CRMprojects/issues
