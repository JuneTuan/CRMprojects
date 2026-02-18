# CRM系统 v4.0 开发计划

## 版本目标
基于小店实际需求，打造轻量级、易用、高效的CRM系统，专注于客户营销和销售管理。

## 开发时间线
- **开始日期**: 2026-02-13
- **预计完成日期**: 待定

## 核心设计原则

### 1. 简单易用
- 客户端操作流程简化，减少页面跳转
- 管理端界面直观，一键操作
- 减少不必要的配置和选项

### 2. 移动优先
- 优化小程序用户体验
- 管理端适配iPad大屏
- 支持横竖屏切换

### 3. 成本可控
- 使用SQLite替代复杂数据库
- 优化服务器资源使用
- 减少第三方服务依赖

### 4. 快速迭代
- 模块化设计，便于功能扩展
- 数据结构灵活，支持快速调整
- 充分收集用户反馈

---

## 架构优化

### 1. 数据库迁移
**目标**: 从JSON文件存储迁移到SQLite数据库

**优势**:
- ✅ 数据持久化更可靠
- ✅ 支持并发访问
- ✅ 查询性能更好
- ✅ 支持事务操作
- ✅ 数据备份和恢复更简单

**实施步骤**:
- [ ] 设计SQLite数据库表结构
- [ ] 创建数据迁移脚本（JSON → SQLite）
- [ ] 更新所有Manager类使用SQLite
- [ ] 测试数据迁移的完整性
- [ ] 性能测试和优化

**技术方案**:
```typescript
// 使用 better-sqlite3 + Drizzle ORM
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

const db = drizzle(new Database('crm.db'))
```

### 2. 系统架构简化
**目标**: 移除不必要的复杂度

**简化内容**:
- ❌ 移除复杂的权限管理系统（只保留店主和店员角色）
- ❌ 简化报表导出功能（只保留常用统计）
- ❌ 移除会员等级体系（初期不需要）
- ❌ 简化推荐奖励系统

**保留核心功能**:
- ✅ 抽奖活动管理
- ✅ 积分系统
- ✅ 卡券管理
- ✅ 客户管理
- ✅ 订单管理
- ✅ 产品管理
- ✅ 员工管理

---

## 功能模块规划

### 第一阶段：核心功能优化 (高优先级)

#### 1.1 用户端体验优化

**首页重构**
```
┌─────────────────────┐
│   🎪 春节幸运大转盘   │
├─────────────────────┤
│   [大转盘抽奖区域]    │
│   今日可抽：3次       │
├─────────────────────┤
│   🎁 我的奖品         │
│   🧧 我的卡券         │
│   💰 我的积分         │
├─────────────────────┤
│   👤 个人中心         │
└─────────────────────┘
```

**优化内容**:
- [ ] 简化首页布局，突出抽奖功能
- [ ] 一键领取奖品和卡券
- [ ] 减少页面跳转，使用弹窗和模态框
- [ ] 优化加载速度，实现离线缓存
- [ ] 添加骨架屏和加载动画
- [ ] 优化错误提示和重试机制

**签到功能**
- [ ] 每日签到获得积分
- [ ] 连续签到奖励递增
- [ ] 签到记录展示
- [ ] 签到日历视图

**分享奖励**
- [ ] 分享活动给好友获得额外抽奖次数
- [ ] 好友注册后双方获得奖励
- [ ] 分享记录追踪

#### 1.2 管理端体验优化

**首页重构（iPad优化）**
```
┌─────────────────────────────────────┐
│  今日数据：销售额 ¥2,580  订单 15单  │
├─────────────────────────────────────┤
│  📊 数据看板  👥 客户管理  📦 产品管理 │
│  🎪 活动管理  🎁 奖品管理  🧧 卡券管理 │
│  📝 订单管理  👔 员工管理  ⚙️ 系统设置 │
└─────────────────────────────────────┘
```

**优化内容**:
- [ ] iPad大屏适配，优化触摸操作
- [ ] 使用更大的按钮和字体
- [ ] 支持横屏模式
- [ ] 优化数据看板，展示关键指标
- [ ] 快捷操作入口
- [ ] 批量操作功能

**数据看板优化**
- [ ] 今日数据概览（销售额、订单数、新增客户）
- [ ] 最近7天销售趋势图
- [ ] 热销产品排行
- [ ] 活跃客户排行
- [ ] 抽奖数据统计
- [ ] 积分发放和消耗统计

#### 1.3 数据库迁移
- [ ] 设计SQLite表结构
- [ ] 创建数据迁移脚本
- [ ] 迁移现有JSON数据
- [ ] 测试数据完整性
- [ ] 性能优化

---

### 第二阶段：营销功能增强 (高优先级)

#### 2.1 签到系统
**功能描述**: 客户每日签到获得积分，连续签到奖励递增

**实施内容**:
- [ ] 签到记录表设计
- [ ] 签到API接口
- [ ] 签到规则配置（基础积分、连续奖励）
- [ ] 签到日历展示
- [ ] 签到提醒功能

**数据结构**:
```typescript
interface SignInRecord {
  id: string
  customerId: string
  date: string
  points: number
  consecutiveDays: number
}
```

#### 2.2 分享奖励系统
**功能描述**: 客户分享活动给好友，双方获得奖励

**实施内容**:
- [ ] 分享记录表设计
- [ ] 分享API接口
- [ ] 分享规则配置（奖励类型、奖励数量）
- [ ] 分享记录追踪
- [ ] 防刷机制

**数据结构**:
```typescript
interface ShareRecord {
  id: string
  customerId: string
  shareType: 'activity' | 'coupon' | 'product'
  targetCustomerId?: string
  rewardPoints: number
  rewardLotteryCount: number
  status: 'pending' | 'completed'
}
```

#### 2.3 生日特权
**功能描述**: 客户生日当天获得额外奖励

**实施内容**:
- [ ] 生日字段添加到客户表
- [ ] 生日特权配置
- [ ] 生日提醒功能
- [ ] 生日专属卡券
- [ ] 生日额外抽奖机会

#### 2.4 限时活动
**功能描述**: 节日特别活动、限时抽奖、限时卡券

**实施内容**:
- [ ] 活动时间配置
- [ ] 活动类型管理（节日、周末、特殊日期）
- [ ] 活动规则配置（双倍抽奖、额外积分）
- [ ] 活动倒计时展示
- [ ] 活动历史记录

---

### 第三阶段：系统管理优化 (中优先级)

#### 3.1 权限管理简化
**目标**: 只保留店主和店员两个角色

**权限设计**:
```
店主权限：
- 所有功能完全访问
- 系统配置管理
- 数据导出和备份

店员权限：
- 客户管理（查看、编辑）
- 产品管理（查看库存）
- 订单管理（创建、编辑）
- 卡券核销
- 数据查看（无导出权限）
```

**实施内容**:
- [ ] 简化角色管理（只保留店主和店员）
- [ ] 权限配置表设计
- [ ] 权限验证中间件
- [ ] 前端权限控制

#### 3.2 数据备份和恢复
**功能描述**: 自动备份数据库，支持数据恢复

**实施内容**:
- [ ] 自动备份脚本（每天备份）
- [ ] 备份文件管理（保留最近7天）
- [ ] 手动备份功能
- [ ] 数据恢复功能
- [ ] 备份文件上传到云存储

**备份策略**:
```typescript
// 每天凌晨2点自动备份
// 保留最近7天的备份文件
// 备份文件命名：crm_backup_YYYYMMDD.db
```

#### 3.3 系统配置
**功能描述**: 集中管理系统参数

**实施内容**:
- [ ] 系统配置表设计
- [ ] 配置管理界面
- [ ] 积分规则配置
- [ ] 抽奖次数限制配置
- [ ] 营业时间设置
- [ ] 店铺信息设置

---

### 第四阶段：数据分析增强 (中优先级)

#### 4.1 数据看板优化
**目标**: 展示小店最关心的关键指标

**展示内容**:
- [ ] 今日数据概览
  - 今日销售额
  - 今日订单数
  - 今日新增客户
  - 今日抽奖次数
- [ ] 趋势数据
  - 最近7天销售趋势
  - 最近30天客户增长
  - 最近7天抽奖趋势
- [ ] 排行数据
  - 热销产品排行（Top 10）
  - 活跃客户排行（Top 10）
  - 高价值客户排行（Top 10）
- [ ] 客户分析
  - 客户分层（按消费金额）
  - 客户活跃度分析
  - 客户积分分布

#### 4.2 简化报表导出
**目标**: 只保留常用的报表导出功能

**实施内容**:
- [ ] 订单报表导出（Excel格式）
- [ ] 客户报表导出（Excel格式）
- [ ] 积分记录导出（Excel格式）
- [ ] 自定义日期范围筛选

---

### 第五阶段：用户体验优化 (中优先级)

#### 5.1 响应式设计优化
**目标**: 优化各种设备的显示效果

**实施内容**:
- [ ] 小程序端优化（微信小程序）
- [ ] 管理端移动端适配（手机、平板）
- [ ] 管理端iPad大屏优化
- [ ] 横竖屏切换支持

#### 5.2 性能优化
**目标**: 提升系统响应速度

**实施内容**:
- [ ] 前端代码分割和懒加载
- [ ] 图片压缩和CDN加速
- [ ] API响应缓存
- [ ] 数据库查询优化
- [ ] 离线数据缓存

#### 5.3 错误处理优化
**目标**: 提供友好的错误提示

**实施内容**:
- [ ] 统一错误处理机制
- [ ] 友好的错误提示文案
- [ ] 自动重试机制
- [ ] 错误日志记录

---

### 第六阶段：部署和运维优化 (低优先级)

#### 6.1 部署方案
**推荐方案**: 云服务器部署

**实施内容**:
- [ ] Docker容器化部署
- [ ] Nginx反向代理配置
- [ ] SSL证书配置（Let's Encrypt）
- [ ] 自动化部署脚本

**服务器配置**:
```
推荐配置：
- CPU: 2核
- 内存: 4GB
- 硬盘: 40GB SSD
- 带宽: 5Mbps

预估成本：100-200元/月
```

#### 6.2 监控和告警
**实施内容**:
- [ ] 系统监控（CPU、内存、磁盘）
- [ ] 应用监控（API响应时间、错误率）
- [ ] 数据库监控（查询性能、连接数）
- [ ] 异常告警（邮件、短信）

#### 6.3 日志管理
**实施内容**:
- [ ] 统一日志格式
- [ ] 日志分级（INFO、WARN、ERROR）
- [ ] 日志文件轮转
- [ ] 日志查询和分析

---

## 开发优先级

### 高优先级 (第一阶段和第二阶段)
1. ✅ 数据库迁移（JSON → SQLite）
2. ✅ 用户端首页重构
3. ✅ 管理端首页重构
4. ✅ 数据看板优化
5. ✅ 签到功能
6. ✅ 分享奖励功能
7. ✅ 生日特权
8. ✅ 限时活动

### 中优先级 (第三阶段和第四阶段)
1. ✅ 权限管理简化
2. ✅ 数据备份和恢复
3. ✅ 系统配置
4. ✅ 数据看板优化
5. ✅ 简化报表导出

### 低优先级 (第五阶段和第六阶段)
1. ✅ 响应式设计优化
2. ✅ 性能优化
3. ✅ 错误处理优化
4. ✅ 部署方案
5. ✅ 监控和告警
6. ✅ 日志管理

---

## 技术栈

### 后端
- **框架**: NestJS 10.x
- **数据库**: SQLite + better-sqlite3
- **ORM**: Drizzle ORM
- **验证**: Zod
- **文件处理**: Multer + XLSX

### 用户端
- **框架**: Taro 4.x
- **UI库**: React 18 + TailwindCSS
- **状态管理**: Zustand
- **网络请求**: Taro.request

### 管理端
- **框架**: React 18
- **路由**: React Router 6
- **UI库**: TailwindCSS
- **状态管理**: Zustand
- **构建工具**: Vite

---

## 数据库设计

### 核心表结构

#### 1. 客户表 (customers)
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  avatar TEXT,
  birthday TEXT,
  points INTEGER DEFAULT 0,
  totalSpent REAL DEFAULT 0,
  registerDate TEXT NOT NULL,
  lastActiveDate TEXT,
  status TEXT DEFAULT 'active',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

#### 2. 员工表 (staff)
```sql
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

#### 3. 产品表 (products)
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  pointsRatio INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

#### 4. 订单表 (orders)
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  staffId TEXT,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  totalPrice REAL NOT NULL,
  points INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  remark TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (staffId) REFERENCES staff(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

#### 5. 活动表 (activities)
```sql
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

#### 6. 奖品表 (prizes)
```sql
CREATE TABLE prizes (
  id TEXT PRIMARY KEY,
  activityId TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  probability REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (activityId) REFERENCES activities(id)
);
```

#### 7. 抽奖记录表 (lottery_records)
```sql
CREATE TABLE lottery_records (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  activityId TEXT NOT NULL,
  prizeId TEXT,
  isWin BOOLEAN DEFAULT false,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (activityId) REFERENCES activities(id),
  FOREIGN KEY (prizeId) REFERENCES prizes(id)
);
```

#### 8. 卡券表 (coupons)
```sql
CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  customerId TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value REAL NOT NULL,
  status TEXT DEFAULT 'unused',
  usedAt TEXT,
  verifiedBy TEXT,
  expiryDate TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (verifiedBy) REFERENCES staff(id)
);
```

#### 9. 积分历史表 (points_history)
```sql
CREATE TABLE points_history (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  description TEXT,
  relatedId TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id)
);
```

#### 10. 签到记录表 (sign_in_records)
```sql
CREATE TABLE sign_in_records (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  date TEXT NOT NULL,
  points INTEGER NOT NULL,
  consecutiveDays INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  UNIQUE(customerId, date)
);
```

#### 11. 分享记录表 (share_records)
```sql
CREATE TABLE share_records (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  shareType TEXT NOT NULL,
  targetCustomerId TEXT,
  rewardPoints INTEGER DEFAULT 0,
  rewardLotteryCount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (targetCustomerId) REFERENCES customers(id)
);
```

#### 12. 系统配置表 (system_config)
```sql
CREATE TABLE system_config (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updatedAt TEXT NOT NULL
);
```

---

## 数据迁移计划

### 迁移步骤

1. **准备工作**
   - [ ] 备份现有JSON数据
   - [ ] 创建SQLite数据库
   - [ ] 创建所有表结构

2. **数据迁移**
   - [ ] 迁移客户数据 (customers.json → customers表)
   - [ ] 迁移员工数据 (users.json → staff表)
   - [ ] 迁移产品数据 (products.json → products表)
   - [ ] 迁移订单数据 (orders.json → orders表)
   - [ ] 迁移活动数据 (activities.json → activities表)
   - [ ] 迁移奖品数据 (prizes.json → prizes表)
   - [ ] 迁移抽奖记录 (lottery_records.json → lottery_records表)
   - [ ] 迁移卡券数据 (coupons.json → coupons表)

3. **数据验证**
   - [ ] 验证数据完整性
   - [ ] 验证数据关联关系
   - [ ] 验证数据一致性

4. **系统切换**
   - [ ] 更新所有Manager类使用SQLite
   - [ ] 测试所有功能
   - [ ] 性能测试

---

## 成本估算

### 开发成本
- 开发时间：2-3个月
- 开发人员：1-2人

### 运营成本
- 服务器：100-200元/月
- 域名：50-100元/年
- SSL证书：免费（Let's Encrypt）
- 总计：约1500-2500元/年

---

## 风险和挑战

### 技术风险
- 数据迁移可能导致数据丢失
- SQLite性能在大数据量下可能不足
- 并发访问可能存在锁竞争

### 业务风险
- 功能简化可能影响用户体验
- 新功能可能不被客户接受
- 系统稳定性需要充分测试

### 应对措施
- 充分测试数据迁移流程
- 定期备份数据
- 逐步发布新功能
- 收集用户反馈及时调整

---

## 版本发布计划

- v4.0.0-alpha: 第一阶段功能完成（数据库迁移、核心功能优化）
- v4.0.0-beta: 第二阶段功能完成（营销功能增强）
- v4.0.0-rc: 所有功能完成，测试中
- v4.0.0: 正式发布

---

## 注意事项

1. 保持数据迁移的安全性
2. 确保系统稳定性
3. 充分测试新功能
4. 逐步发布，避免一次性改动过大
5. 收集用户反馈，持续改进

---

## 总结

版本4的核心目标是打造一个**轻量级、易用、高效**的CRM系统，专注于小店的客户营销和销售管理。通过简化架构、优化用户体验、增强营销功能，帮助小店提升客户粘性和销售业绩。

**核心优势**：
- 🎯 简单易用：客户和管理员都能快速上手
- 📱 移动优先：优化小程序和iPad体验
- 💰 成本可控：降低开发和运维成本
- 🚀 快速迭代：根据反馈快速调整功能
