# JunLite CRM V6.0 发布说明

**发布日期**: 2026-02-28  
**版本号**: V6.0  
**分支**: v6-release

---

## 🎉 版本概述

JunLite CRM V6.0 是一个重要的功能更新版本，新增了线索管理、字典管理等核心模块，优化了客户管理和H5注册流程，提升了系统的可配置性和业务流程完整性。

---

## ✨ 新增功能

### 1. 线索管理模块

完整的销售线索管理功能，支持从线索录入到转化为客户的完整流程。

**功能特性**:
- 线索录入与管理
- 线索分配给销售人员
- 线索跟进记录管理
- 线索评分系统（0-100分）
- 线索状态流转（新线索 → 跟进中 → 已转化/已关闭）
- 线索转化为客户和订单

**API接口**:
```
GET    /api/v6/leads                  # 获取线索列表
GET    /api/v6/leads/:id              # 获取线索详情
POST   /api/v6/leads                  # 创建线索
PUT    /api/v6/leads/:id              # 更新线索
DELETE /api/v6/leads/:id              # 删除线索
POST   /api/v6/leads/:id/convert      # 转化线索
POST   /api/v6/leads/:id/assign       # 分配线索
POST   /api/v6/leads/:id/followups    # 添加跟进记录
GET    /api/v6/leads/:id/followups    # 获取跟进记录
```

**数据库表**:
- `leads` - 线索主表
- `lead_followups` - 线索跟进记录表
- `lead_assignments` - 线索分配记录表

### 2. 字典管理模块

可配置的枚举值管理系统，支持动态配置客户来源、线索来源等选项。

**功能特性**:
- 可配置的枚举值管理
- 客户来源动态配置
- 线索来源动态配置
- 支持多类型字典
- 字典项排序和状态管理

**API接口**:
```
GET    /api/v6/dictionary             # 获取字典列表（需认证）
GET    /api/v6/dictionary/type/:type  # 按类型获取字典（公开）
GET    /api/v6/dictionary/types       # 获取所有字典类型（需认证）
POST   /api/v6/dictionary             # 创建字典项（需认证）
PUT    /api/v6/dictionary/:id         # 更新字典项（需认证）
DELETE /api/v6/dictionary/:id         # 删除字典项（需认证）
```

**预设字典类型**:
| 字典类型 | 说明 |
|----------|------|
| customer_source | 客户来源 |
| lead_source | 线索来源 |
| lead_priority | 线索优先级 |

### 3. 客户管理增强

**新增功能**:
- 表格列排序（按姓名、注册时间、消费金额等）
- 分页浏览
- 来源字段使用字典值显示

**API增强**:
```
GET /api/v6/customers?sortBy=created_at&sortOrder=DESC&page=1&pageSize=10
```

### 4. H5注册优化

**新增功能**:
- 注册时自动标注来源为 `h5_register`
- 移除来源选择UI，简化注册流程
- 来源值与字典系统关联

---

## 🔧 优化改进

### 后端优化

1. **API版本化**
   - 客户接口升级为 `/api/v6/customers`
   - 线索接口使用 `/api/v6/leads`
   - 字典接口使用 `/api/v6/dictionary`

2. **排序支持**
   - 客户列表支持动态排序
   - 支持多字段排序

3. **认证优化**
   - 字典类型查询接口支持匿名访问
   - 方便H5端获取来源选项

### 前端优化

1. **客户管理页面**
   - 添加表头排序功能
   - 添加分页组件
   - 来源字段显示字典标签

2. **线索管理页面**
   - 完整的线索CRUD功能
   - 线索分配和跟进功能
   - 转化为订单功能

3. **订单管理页面**
   - 支持从线索转化创建订单
   - 自动填充线索客户信息

---

## 🐛 问题修复

1. 修复线索转化后客户列表不显示的问题
2. 修复客户来源字段显示乱码的问题
3. 修复H5注册来源未正确设置的问题
4. 修复订单创建时API路径错误的问题
5. 修复字典管理认证问题

---

## 📦 部署说明

### 环境要求

- Node.js 18+
- MySQL 8.0+
- Docker (可选)

### 部署步骤

1. **克隆代码**
```bash
git clone https://github.com/JuneTuan/CRMprojects.git
cd CRMprojects
git checkout v6-release
```

2. **数据库迁移**
```bash
mysql -u root -p < V6.0_DATABASE_MIGRATION.sql
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 配置数据库连接
```

4. **启动服务**
```bash
# Docker部署
docker-compose up -d --build

# 或手动部署
cd server && npm install && npm run start:dev
cd admin-web && npm install && npm run dev
cd customerH5 && npm install && npm run dev:h5
```

### Docker服务

| 服务 | 端口 | 说明 |
|------|------|------|
| MySQL | 3306 | 数据库服务 |
| Server | 3001 | 后端API服务 |
| Admin Web | 8080 | 管理后台 |
| Customer H5 | 8081 | H5前端 |

---

## 📚 文档更新

| 文档 | 说明 |
|------|------|
| README.md | 更新为V6.0版本说明 |
| USER_MANUAL.md | 更新用户手册，新增线索和字典管理章节 |
| V6.0_DEPLOYMENT_GUIDE.md | 新增部署指南 |
| V6.0_DATABASE_MIGRATION.sql | 数据库迁移脚本 |
| RELEASE_NOTES.md | 本发布说明 |

---

## 🔄 升级指南

### 从V5.x升级

1. 备份现有数据库
2. 执行数据库迁移脚本
3. 更新代码到v6-release分支
4. 更新环境变量配置
5. 重启服务

### 数据库变更

新增表：
- `leads` - 线索表
- `lead_followups` - 线索跟进表
- `lead_assignments` - 线索分配表
- `dictionary` - 字典表

字段变更：
- `customer.source` 类型从ENUM改为VARCHAR

---

## 👥 贡献者

- 开发团队

---

## 📞 支持

- **GitHub**: https://github.com/JuneTuan/CRMprojects
- **Issues**: https://github.com/JuneTuan/CRMprojects/issues

---

**© 2026 JunLite CRM V6.0**
