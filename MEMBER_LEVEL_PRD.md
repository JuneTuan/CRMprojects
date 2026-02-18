# 会员等级系统产品需求文档 (PRD)

| 文档版本 | 修改日期 | 修改人 | 修改描述 |
| :--- | :--- | :--- | :--- |
| V1.0 | 2026-02-18 | 开发团队 | 轻量级会员等级管理系统 |

---

## 1. 项目概述

### 1.1 项目背景
当前系统缺乏用户分层机制，无法识别高价值用户，导致运营活动缺乏针对性。需要建立一套轻量级的会员等级体系，通过身份标识提升用户粘性。

### 1.2 产品目标
- **核心目标**：建立基于消费额的会员等级体系，实现用户自动升级。
- **运营目标**：提供后台手动调整能力，便于VIP管理及客诉处理。
- **技术目标**：架构轻量，支持未来扩展（积分、抽奖等）而无需修改数据库结构。
- **体验目标**：用户清晰感知等级身份，升级时有明确反馈。

### 1.3 适用范围
- **前端**：用户中心、个人中心、升级通知。
- **后端**：订单系统（消费累计）、会员系统（等级计算）、管理后台。
- **阶段**：轻量级MVP版本，不包含折扣计算、等级过期降级逻辑。

---

## 2. 用户角色

| 角色 | 描述 | 核心诉求 |
| :--- | :--- | :--- |
| **普通用户** | 系统注册用户 | 查看当前等级，了解升级条件，享受等级权益 |
| **运营人员** | 后台管理员 | 配置等级门槛，手动调整用户等级，查看升级日志 |
| **系统** | 后台服务 | 自动计算消费额，触发等级变更，记录日志 |

---

## 3. 功能需求详情

### 3.1 会员等级配置（后台）
**优先级：P0**

| 功能点 | 描述 | 备注 |
| :--- | :--- | :--- |
| **等级列表** | 展示所有等级配置，支持启用/禁用 | 默认启用 |
| **新增/编辑等级** | 配置等级名称、图标、消费门槛、权益配置 | 门槛需唯一递增 |
| **权益配置** | 采用JSON格式存储，支持扩展 | 见数据结构设计 |
| **排序管理** | 支持输入排序值 | 决定前端展示顺序 |

### 3.2 用户等级展示（前端）
**优先级：P0**

| 功能点 | 描述 | 备注 |
| :--- | :--- | :--- |
| **等级图标展示** | 在用户中心头部展示当前等级图标及名称 | 显著位置 |
| **权益展示** | 展示当前等级享有的权益文案 | 读取配置中的`display_text` |
| **升级提示** | 若未达最高等级，显示"再消费XX元升级" | 计算下一等级门槛 - 当前消费 |

### 3.3 等级变更逻辑（系统）
**优先级：P0**

| 功能点 | 描述 | 备注 |
| :--- | :--- | :--- |
| **自动升级** | 订单支付成功后，累计消费达标自动升级 | 只升不降（MVP） |
| **手动调整** | 后台可强制修改用户等级 | 需填写原因 |
| **变更日志** | 记录所有等级变更历史 | 包含自动/手动类型 |

### 3.4 统计分析（后台）
**优先级：P1**

| 功能点 | 描述 | 备注 |
| :--- | :--- | :--- |
| **等级分布** | 各等级用户数量及占比 | 饼图展示 |
| **升级记录** | 查看近期升级用户列表 | 支持筛选 |

---

## 4. 数据结构设计

### 4.1 会员等级配置表（`member_level`）
*核心扩展点：`benefits_config`使用JSON类型*

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| level_id | INT | - | Y | - | 主键 |
| level_name | VARCHAR | 20 | Y | - | 等级名称（如：金卡会员） |
| level_code | VARCHAR | 20 | Y | - | 等级代码（normal, silver, gold, diamond） |
| min_consumption | DECIMAL | 10,2 | Y | 0.00 | 升级最低消费额 |
| icon_url | VARCHAR | 255 | N | - | 等级图标URL |
| **benefits_config** | **JSON** | - | N | - | **权益配置（扩展核心）** |
| sort_order | INT | - | Y | 0 | 排序值（越小越前） |
| is_active | TINYINT | 1 | Y | 1 | 是否启用（1:是 0:否） |
| created_at | TIMESTAMP | - | Y | NOW | 创建时间 |
| updated_at | TIMESTAMP | - | Y | NOW | 更新时间 |

**`benefits_config`JSON示例（MVP版本）：**
```json
{
  "display_text": "专属客服 | 生日礼包",
  "point_multiplier": 1.0,
  "lottery_times": 0,
  "discount_rate": 1.00
}
```

### 4.2 用户表扩展（`customer`）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| customer_id | INT | - | Y | - | 用户ID（主键） |
| member_level_id | INT | - | N | NULL | 当前等级ID（关联member_level） |
| total_consumption | DECIMAL | 10,2 | Y | 0.00 | 累计消费金额（已支付） |

### 4.3 等级变更日志表（`member_level_log`）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| log_id | INT | - | Y | - | 主键 |
| customer_id | INT | - | Y | - | 用户ID |
| old_level_id | INT | - | N | - | 原等级ID |
| new_level_id | INT | - | Y | - | 新等级ID |
| change_type | ENUM | - | Y | 'auto_upgrade' | 变更类型（auto_upgrade:自动，manual_adjust:手动调整，manual_downgrade:手动降级） |
| old_consumption | DECIMAL | 10,2 | N | - | 变更前消费额 |
| new_consumption | DECIMAL | 10,2 | N | - | 变更后消费额 |
| remark | VARCHAR | 255 | N | - | 备注（手动调整时必填） |
| operator_id | INT | - | N | - | 操作人ID（手动调整时记录） |
| ip_address | VARCHAR | 45 | N | - | 操作IP地址 |
| created_at | TIMESTAMP | - | Y | NOW | 变更时间 |

---

## 5. 核心业务逻辑

### 5.1 自动升级流程
1. **触发点**：订单状态变更为"已支付"或"已完成"。
2. **累计消费更新**：`customer.total_consumption = total_consumption + order.actualAmount`。
3. **等级匹配**：
   - 查询`member_level`表中`is_active=1`的所有等级。
   - 按`min_consumption`**从高到低**排序。
   - 找到第一个`min_consumption <= user.total_consumption`的等级。
4. **变更判断**：
   - 若匹配等级ID与用户当前等级ID不一致 → 执行升级。
   - 若一致 → 无操作。
5. **记录日志**：写入`member_level_log`，类型`auto_upgrade`。
6. **通知**：发送站内信/短信通知用户升级（待实现）。

### 5.2 手动调整流程
1. **入口**：管理后台 → 用户管理 → 调整等级。
2. **权限**：仅限"运营主管"及以上角色（待实现）。
3. **校验**：必须填写调整原因（`remark`）。
4. **执行**：
   - 更新`customer.member_level_id`。
   - **不改变**`customer.total_consumption`（手动调整仅改身份，不改消费数据）。
   - 写入`member_level_log`，类型`manual_adjust`或`manual_downgrade`，记录`operator_id`和`ip_address`。

### 5.3 退款处理（MVP简化版）
- **策略**：MVP阶段**不自动降级**。
- **逻辑**：用户退款后，`total_consumption`不回扣，等级保留。
- **例外**：若发生恶意刷单，由运营通过"手动调整"功能降级，并记录原因。
- **理由**：降低开发复杂度，避免并发冲突，首期以用户体验为主。

### 5.4 权益读取逻辑（扩展性设计）
系统其他模块（积分、抽奖）通过统一接口读取权益：

```typescript
function getBenefit(levelId, key, defaultValue) {
  level = db.query("SELECT benefits_config FROM member_level WHERE id=?", levelId);
  return level.benefits_config[key] ?? defaultValue;
}

// 示例：积分系统调用
points = orderAmount * getBenefit(user.levelId, 'point_multiplier', 1.0);
```

---

## 6. API接口文档

### 6.1 会员等级管理接口

#### 获取所有等级
```
GET /member-level
```

**响应示例：**
```json
[
  {
    "levelId": 1,
    "levelName": "普通会员",
    "levelCode": "normal",
    "minConsumption": 0,
    "iconUrl": "/uploads/level/normal.png",
    "benefitsConfig": {
      "display_text": "新用户专享",
      "point_multiplier": 1.0,
      "lottery_times": 0,
      "discount_rate": 1.00
    },
    "sortOrder": 1,
    "isActive": true
  }
]
```

#### 获取单个等级
```
GET /member-level/:id
```

#### 创建等级
```
POST /member-level
Content-Type: application/json

{
  "levelName": "铂金会员",
  "levelCode": "platinum",
  "minConsumption": 20000,
  "iconUrl": "/uploads/level/platinum.png",
  "benefitsConfig": {
    "display_text": "专属客服 | 生日礼包 | 优先发货 | 专属折扣",
    "point_multiplier": 2.5,
    "lottery_times": 10,
    "discount_rate": 0.85
  },
  "sortOrder": 5,
  "isActive": true
}
```

#### 更新等级
```
PUT /member-level/:id
Content-Type: application/json

{
  "levelName": "铂金会员",
  "minConsumption": 25000
}
```

#### 删除等级（软删除）
```
DELETE /member-level/:id
```

### 6.2 客户等级查询接口

#### 获取客户等级信息
```
GET /member-level/customer/:customerId
```

**响应示例：**
```json
{
  "customerId": 1,
  "customerName": "张三",
  "totalConsumption": 4500.00,
  "currentLevel": {
    "levelId": 2,
    "levelName": "白银会员",
    "levelCode": "silver",
    "iconUrl": "/uploads/level/silver.png",
    "benefitsConfig": {
      "display_text": "专属客服 | 生日礼包",
      "point_multiplier": 1.2,
      "lottery_times": 1,
      "discount_rate": 0.98
    }
  },
  "nextLevel": {
    "levelId": 3,
    "levelName": "黄金会员",
    "levelCode": "gold",
    "minConsumption": 5000
  },
  "needConsumption": 500.00,
  "progressPercent": 90.00
}
```

#### 手动调整客户等级
```
POST /member-level/customer/:customerId/adjust
Content-Type: application/json

{
  "newLevelId": 3,
  "remark": "VIP客户特殊处理"
}
```

### 6.3 等级变更日志接口

#### 获取等级变更日志
```
GET /member-level/logs/list?customerId=1&limit=50
```

**响应示例：**
```json
[
  {
    "logId": 1,
    "customerId": 1,
    "oldLevelId": 1,
    "newLevelId": 2,
    "changeType": "auto_upgrade",
    "oldConsumption": 950.00,
    "newConsumption": 1200.00,
    "remark": "自动升级",
    "operatorId": null,
    "ipAddress": null,
    "createdAt": "2026-02-18T10:00:00Z",
    "customer": {
      "customerId": 1,
      "customerName": "张三"
    },
    "oldLevel": {
      "levelId": 1,
      "levelName": "普通会员"
    },
    "newLevel": {
      "levelId": 2,
      "levelName": "白银会员"
    }
  }
]
```

### 6.4 权益查询接口

#### 获取等级权益
```
GET /member-level/benefit/:levelId/:key?defaultValue=1.0
```

**响应示例：**
```json
1.2
```

#### 获取客户权益
```
GET /member-level/customer/:customerId/benefit/:key?defaultValue=0
```

**响应示例：**
```json
3
```

---

## 7. 非功能性需求

### 7.1 性能要求
- **等级查询**：用户中心加载等级信息耗时 < 100ms（建议缓存用户等级信息至Redis）。
- **升级计算**：订单支付后升级逻辑异步处理，不影响主订单流程耗时。

### 7.2 数据一致性
- **消费累计**：需保证订单支付与消费累计的事务一致性，防止多算/少算。
- **并发控制**：同一用户并发订单支付时，`total_consumption`更新需加锁或使用乐观锁。

### 7.3 安全性
- **后台权限**：手动调整等级接口需严格校验管理员权限。
- **日志审计**：所有手动调整记录永久保存，不可删除。

---

## 8. 界面原型建议（Wireframe）

### 8.1 用户中心（App/H5）
```
+----------------------------------+
|  [头像]  用户昵称               |
|          [金卡会员] (图标)      |
|                                  |
|  当前权益：                      |
|  ✨ 专属客服  |  🎁 生日礼包   |
|                                  |
|  [升级进度条]                    |
|  当前消费：¥4,500                |
|  再消费 ¥500 升级钻石会员        |
+----------------------------------+
```

### 8.2 后台等级配置
```
+----------------------------------+
| 等级名称：[ 金卡会员       ]     |
| 消费门槛：[ 5000           ] 元  |
| 等级图标：[ 上传图标       ]     |
| 权益配置：                      |
|  [ 展示文案 ]: 专属客服 | 生日礼包 |
|  [ 扩展参数 ]: (隐藏/高级选项)   |
|                                  |
|  [ 保存 ]  [ 取消 ]               |
+----------------------------------+
```

---

## 9. 初始化配置

### 9.1 默认会员等级配置

| 等级 | 等级代码 | 最低消费额 | 折扣率 | 积分倍数 | 抽奖次数 | 描述 |
|--------|----------|------------|---------|-----------|----------|------|
| 普通会员 | normal | 0 | 1.00 | 1.0 | 0 | 新注册用户 |
| 白银会员 | silver | 1000 | 0.98 | 1.2 | 1 | 消费满1000元 |
| 黄金会员 | gold | 5000 | 0.95 | 1.5 | 3 | 消费满5000元 |
| 钻石会员 | diamond | 10000 | 0.90 | 2.0 | 5 | 消费满10000元 |

### 9.2 权益配置字典

为方便后续扩展，建议统一`benefits_config`字段：

| 字段名 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| display_text | String | 展示给用户的权益文案 | "专属客服 \| 生日礼包" |
| point_multiplier | Number | 积分倍数 | 1.5表示1.5倍积分 |
| lottery_times | Number | 额外抽奖次数 | 3表示额外3次抽奖机会 |
| discount_rate | Number | 折扣率 | 0.95表示95折 |

---

## 10. 未来扩展规划（Roadmap）

| 阶段 | 功能模块 | 实现方式 | 预计周期 |
| :--- | :--- | :--- | :--- |
| **V1.0（当前）** | 基础等级、自动升级、手动调整 | 本PRD内容 | 已完成 |
| **V1.5** | 积分倍数联动 | 读取`benefits_config.point_multiplier` | 3天 |
| **V2.0** | 等级有效期与降级 | 增加`expire_at`字段，定时任务 | 1周 |
| **V2.5** | 抽奖次数联动 | 读取`benefits_config.lottery_times` | 3天 |
| **V3.0** | 退款自动降级 | 消费额回扣逻辑，降级检查 | 1周 |
| **V3.5** | 折扣计算 | 读取`benefits_config.discount_rate` | 3天 |

---

## 11. 附录

### 11.1 技术栈
- **后端框架**：NestJS
- **数据库**：MySQL 8.0+
- **ORM**：TypeORM
- **前端框架**：Vue.js / UniApp

### 11.2 数据库表结构
- `member_level`：会员等级配置表
- `member_level_log`：等级变更日志表
- `customer`：客户表（已扩展）

### 11.3 核心文件
- `/server/src/member-level/member-level.entity.ts`：等级配置实体
- `/server/src/member-level/member-level-log.entity.ts`：等级日志实体
- `/server/src/member-level/member-level.service.ts`：等级服务
- `/server/src/member-level/member-level.controller.ts`：等级控制器
- `/server/src/member-level/member-level.module.ts`：等级模块
- `/server/src/customer/customer.entity.ts`：客户实体（已扩展）
- `/server/src/order/order.service.ts`：订单服务（已集成）

---

## 12. 测试检查清单

### 12.1 功能测试
- [ ] 等级配置CRUD功能正常
- [ ] 自动升级功能正常
- [ ] 手动调整功能正常
- [ ] 等级日志记录完整
- [ ] 权益查询功能正常
- [ ] 客户等级查询正常

### 12.2 边界测试
- [ ] 消费额正好等于等级门槛
- [ ] 消费额为0时等级正确
- [ ] 手动调整到不存在的等级
- [ ] 手动调整不填写原因

### 12.3 并发测试
- [ ] 同一用户并发订单支付
- [ ] 消费累计数据一致性

### 12.4 性能测试
- [ ] 等级查询响应时间 < 100ms
- [ ] 批量等级查询性能
- [ ] 日志查询性能

---

**文档结束**
