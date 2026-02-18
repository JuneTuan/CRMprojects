# CRM系统 v3.0 归档

## 归档日期
2026-02-13

## 版本说明
v3.0是v2.0的改进版本，实现了用户端和管理端的分离，并优化了系统架构。

## 项目结构
```
v3.0/
├── apps/
│   ├── client/          # 用户端（Taro微信小程序）
│   └── admin/           # 管理端（React Web应用）
├── server/              # 后端服务（NestJS + JSON存储）
├── package.json         # 根项目配置
├── VERSION2_PLAN.md     # v2.0开发计划
└── VERSION4_PLAN.md     # v4.0开发计划
```

## 技术栈

### 用户端（小程序）
- **框架**: Taro 4.1.9
- **UI库**: React 18 + TailwindCSS
- **状态管理**: Zustand
- **网络请求**: Taro.request

### 管理端（Web）
- **框架**: React 18
- **路由**: React Router 6
- **UI库**: TailwindCSS
- **状态管理**: Zustand
- **构建工具**: Vite

### 后端服务
- **框架**: NestJS 10.4.15
- **数据库**: JSON文件存储
- **验证**: Zod
- **文件处理**: Multer + XLSX

## 核心功能

### 用户端功能
- ✅ 用户注册和登录
- ✅ 大转盘抽奖
- ✅ 个人中心
- ✅ 我的卡券
- ✅ 购买记录
- ✅ 抽奖记录
- ✅ 积分历史
- ✅ 编辑个人资料

### 管理端功能
- ✅ 数据看板
- ✅ 客户管理
- ✅ 员工管理
- ✅ 产品管理
- ✅ 订单管理
- ✅ 奖品管理
- ✅ 卡券管理
- ✅ 活动管理
- ✅ 批量导入
- ✅ 数据清理

## 运行方式

### 启动后端服务
```bash
cd server
pnpm install
pnpm run dev
```

### 启动用户端（小程序）
```bash
cd apps/client
pnpm install
pnpm run dev
```
然后在微信开发者工具中打开 `dist` 目录。

### 启动管理端（Web）
```bash
cd apps/admin
pnpm install
pnpm run dev
```
访问地址：http://localhost:5174

## 数据存储
- 客户数据：`server/data/customers.json`
- 员工数据：`server/data/users.json`
- 产品数据：`server/data/products.json`
- 订单数据：`server/data/orders.json`
- 活动数据：`server/data/activities.json`
- 奖品数据：`server/data/prizes.json`
- 卡券数据：`server/data/coupons.json`
- 抽奖记录：`server/data/lottery_records.json`
- 抽奖设置：`server/data/lottery_settings.json`

## 已知问题
1. JSON文件存储在并发访问时可能存在性能问题
2. 数据备份和恢复需要手动操作
3. 缺少数据统计分析功能
4. 用户体验有待优化

## 下一步计划
详见 [VERSION4_PLAN.md](VERSION4_PLAN.md)

## 注意事项
- 此版本已归档，不建议继续使用
- 请使用最新版本进行开发和部署
- 如需恢复此版本，请参考项目根目录的README
