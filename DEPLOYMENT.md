# JunLite CRM R1.2.0 部署指南

## 📋 版本信息

- **版本号**: R1.2.0
- **发布日期**: 2026-02-19
- **Git标签**: R1.2
- **分支**: V5.0

## 🎯 系统概述

JunLite CRM是一个完整的客户关系管理系统，包含以下三个主要部分：

1. **后端服务** (NestJS + TypeORM + MySQL)
2. **管理后台** (Vue 3 + Vite + Element Plus)
3. **H5前端** (Uni-app + Vue 3)

## 🔧 环境要求

### 服务器环境

- **操作系统**: Linux (推荐 Ubuntu 20.04+ 或 CentOS 7+)
- **Node.js**: >= 18.0.0
- **MySQL**: >= 8.0
- **Nginx**: >= 1.18 (用于反向代理)
- **PM2**: >= 5.0 (进程管理)

### 开发环境

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: >= 2.0

## 📦 部署步骤

### 1. 克隆代码

```bash
# 克隆代码仓库
git clone <repository-url> crm-system
cd crm-system

# 切换到R1版本
git checkout R1
```

### 2. 后端服务部署

#### 2.1 安装依赖

```bash
cd server
npm install --production
```

#### 2.2 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=crm_db

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d

# 服务器配置
PORT=3001
NODE_ENV=production

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

#### 2.3 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 运行数据库迁移（如果需要）
npm run migration:run
```

#### 2.4 构建项目

```bash
npm run build
```

#### 2.5 使用PM2启动服务

```bash
# 安装PM2（如果未安装）
npm install -g pm2

# 启动服务
pm2 start dist/src/main.js --name crm-server

# 查看日志
pm2 logs crm-server

# 设置开机自启
pm2 startup
pm2 save
```

### 3. 管理后台部署

#### 3.1 安装依赖

```bash
cd admin-web
npm install
```

#### 3.2 配置API地址

修改 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://your-server-ip:3001
```

#### 3.3 构建项目

```bash
npm run build
```

构建产物位于 `dist` 目录。

#### 3.4 部署到Nginx

```bash
# 复制构建产物到Nginx目录
cp -r dist/* /var/www/crm-admin/

# 配置Nginx
sudo nano /etc/nginx/sites-available/crm-admin
```

Nginx配置示例：

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;
    root /var/www/crm-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/crm-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. H5前端部署

#### 4.1 安装依赖

```bash
cd customerH5
npm install
```

#### 4.2 配置API地址

修改 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://your-server-ip:3001
```

#### 4.3 构建H5项目

```bash
npm run build:h5
```

构建产物位于 `dist/build/h5` 目录。

#### 4.4 部署到Nginx

```bash
# 复制构建产物到Nginx目录
cp -r dist/build/h5/* /var/www/crm-h5/

# 配置Nginx
sudo nano /etc/nginx/sites-available/crm-h5
```

Nginx配置示例：

```nginx
server {
    listen 80;
    server_name h5.your-domain.com;
    root /var/www/crm-h5;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/crm-h5 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 安全配置

### 1. 数据库安全

```bash
# 修改MySQL root密码
mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_strong_password';"

# 创建专用数据库用户
mysql -u root -p -e "CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'strong_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON crm_db.* TO 'crm_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### 2. 防火墙配置

```bash
# 开放必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # 后端API（可选，建议通过Nginx代理）
sudo ufw enable
```

### 3. SSL证书配置（推荐）

使用Let's Encrypt免费SSL证书：

```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d admin.your-domain.com
sudo certbot --nginx -d h5.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 📊 监控和维护

### 1. PM2监控

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs crm-server

# 重启服务
pm2 restart crm-server

# 停止服务
pm2 stop crm-server
```

### 2. 日志管理

后端日志位置：
- PM2日志: `~/.pm2/logs/crm-server-out.log`
- 应用日志: `server/logs/`

前端日志：
- 浏览器控制台
- Nginx访问日志: `/var/log/nginx/access.log`

### 3. 数据库备份

创建定时备份脚本：

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u crm_user -p crm_db > /backup/crm_db_$DATE.sql
gzip /backup/crm_db_$DATE.sql
find /backup -name "crm_db_*.sql.gz" -mtime +7 -delete
```

添加到crontab：

```bash
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 🚀 性能优化

### 1. Nginx优化

```nginx
# 在http块中添加
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. MySQL优化

```sql
-- 在my.cnf中添加
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
```

### 3. Node.js优化

```bash
# 设置Node.js内存限制
pm2 start dist/src/main.js --name crm-server --max-memory-restart 1G
```

## 🐛 故障排查

### 常见问题

1. **后端无法启动**
   - 检查数据库连接配置
   - 查看PM2日志: `pm2 logs crm-server`
   - 确认端口3001未被占用

2. **前端无法访问API**
   - 检查Nginx配置
   - 确认后端服务运行状态
   - 查看浏览器控制台错误信息

3. **数据库连接失败**
   - 检查MySQL服务状态: `sudo systemctl status mysql`
   - 验证数据库用户权限
   - 检查防火墙设置

4. **文件上传失败**
   - 检查uploads目录权限
   - 确认Nginx上传大小限制
   - 查看后端日志

## 📞 技术支持

- **文档**: 查看项目README.md
- **问题反馈**: 提交Issue到代码仓库
- **紧急联系**: 联系系统管理员

## 📝 更新日志

### R1.0.0 (2026-02-19)

**新增功能**：
- 会员等级系统：支持自动升级和手动调整
- 活动游戏功能：支持大转盘、老虎机、刮刮乐、盲盒、九宫格
- H5抽奖功能：支持免费次数和积分消耗
- 产品管理：完整的CRUD操作
- 订单管理：订单创建、状态更新、会员等级计算
- 活动管理：活动创建、游戏配置、奖品管理
- 客户管理：客户信息、积分、消费额管理
- 会员等级变更日志：完整追踪等级变更历史

**技术改进**：
- 修复decimal类型转换问题
- 优化数据库查询性能
- 完善错误处理机制

**测试完成**：
- 产品管理功能测试
- 订单管理功能测试
- 活动管理功能测试
- 会员等级自动升级功能测试
- H5活动页面和抽奖功能测试
- H5订单查询功能测试
- 活动游戏功能测试

---

**部署完成后，请访问以下地址验证系统：**
- 管理后台: http://admin.your-domain.com
- H5前端: http://h5.your-domain.com
- 后端API: http://your-server-ip:3001

**默认管理员账号**：
- 用户名: admin
- 密码: admin123

**⚠️ 重要提示：首次登录后请立即修改默认密码！**
