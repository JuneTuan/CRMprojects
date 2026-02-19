# JunLite CRM Docker 部署指南

## 📋 概述

本指南介绍如何使用Docker和Docker Compose快速部署JunLite CRM系统。

## 🎯 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    JunLite CRM v5.0                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│   MySQL 8.0    │  │   Server    │  │  Frontend      │
│   (Database)   │  │  (NestJS)   │  │  (Vue 3)       │
│   Port: 3306   │  │  Port: 3001 │  │  Port: 80      │
└────────────────┘  └─────────────┘  └────────────────┘
```

## 📦 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0
- 至少2GB可用内存
- 至少10GB可用磁盘空间

## 🚀 快速开始

### 1. 克隆代码

```bash
git clone https://github.com/JuneTuan/CRMprojects.git
cd CRMprojects
git checkout R1.2
```

### 2. 配置环境变量

复制并编辑环境变量文件：

```bash
cp .env.docker .env
```

编辑 `.env` 文件，修改以下重要配置：

```env
# MySQL数据库配置
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=crm_db
MYSQL_USER=crm_user
MYSQL_PASSWORD=your_secure_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_change_in_production

# CORS配置
CORS_ORIGIN=http://your-domain.com,http://your-h5-domain.com
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- **管理后台**: http://localhost:8080
- **H5前端**: http://localhost:8081
- **后端API**: http://localhost:3001

## 📝 服务说明

### MySQL数据库

- **容器名称**: junlite-crm-mysql
- **端口**: 3306
- **数据持久化**: mysql_data volume
- **默认数据库**: crm_db

### 后端服务

- **容器名称**: junlite-crm-server
- **端口**: 3001
- **技术栈**: NestJS + TypeORM
- **依赖**: MySQL
- **数据持久化**: server_uploads volume

### 管理后台

- **容器名称**: junlite-crm-admin-web
- **端口**: 8080
- **技术栈**: Vue 3 + Vite + Element Plus
- **依赖**: 后端服务

### H5前端

- **容器名称**: junlite-crm-customer-h5
- **端口**: 8081
- **技术栈**: Uni-app + Vue 3
- **依赖**: 后端服务

## 🔧 常用命令

### 服务管理

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启所有服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service_name]

# 重新构建并启动
docker-compose up -d --build
```

### 单个服务管理

```bash
# 启动特定服务
docker-compose up -d server

# 停止特定服务
docker-compose stop server

# 重启特定服务
docker-compose restart server

# 查看特定服务日志
docker-compose logs -f server
```

### 数据管理

```bash
# 进入MySQL容器
docker-compose exec mysql mysql -u crm_user -p crm_db

# 备份数据库
docker-compose exec mysql mysqldump -u crm_user -p crm_db > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u crm_user -p crm_db < backup.sql

# 查看数据卷
docker volume ls

# 删除数据卷（危险操作）
docker-compose down -v
```

### 清理操作

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v

# 删除未使用的镜像
docker image prune -a

# 删除未使用的容器、网络、镜像
docker system prune -a
```

## 🔐 安全建议

### 1. 修改默认密码

生产环境中必须修改以下密码：
- MySQL root密码
- MySQL用户密码
- JWT密钥

### 2. 配置防火墙

```bash
# 只开放必要的端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3. 使用HTTPS

建议使用Nginx反向代理配置SSL证书。

### 4. 定期备份

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mysql mysqldump -u crm_user -p crm_db > $BACKUP_DIR/crm_$DATE.sql
EOF

chmod +x backup.sh

# 设置定时任务
crontab -e
# 添加：0 2 * * * /path/to/backup.sh
```

## 🐛 故障排查

### 服务无法启动

```bash
# 查看服务日志
docker-compose logs [service_name]

# 检查端口占用
netstat -tlnp | grep :3001
netstat -tlnp | grep :3306
```

### 数据库连接失败

```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 检查MySQL日志
docker-compose logs mysql

# 测试数据库连接
docker-compose exec server npm run test:db
```

### 前端无法访问后端

```bash
# 检查网络连接
docker-compose exec admin-web ping junlite-crm-server

# 检查后端服务状态
docker-compose ps server

# 检查CORS配置
docker-compose exec server env | grep CORS
```

### 磁盘空间不足

```bash
# 清理Docker系统
docker system prune -a

# 查看磁盘使用情况
docker system df
```

## 📊 性能优化

### 1. 资源限制

编辑 `docker-compose.yml`，添加资源限制：

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 2. 数据库优化

编辑MySQL配置：

```yaml
mysql:
  command: --default-authentication-plugin=mysql_native_password --max_connections=200 --innodb_buffer_pool_size=1G
```

### 3. 日志管理

```yaml
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔄 更新部署

### 1. 拉取最新代码

```bash
git pull origin main
```

### 2. 重新构建镜像

```bash
docker-compose build
```

### 3. 重启服务

```bash
docker-compose up -d
```

## 📚 更多信息

- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [JunLite CRM项目文档](./README.md)
- [传统部署指南](./DEPLOYMENT.md)

## 🆘 获取帮助

如有问题，请：
1. 查看日志：`docker-compose logs -f`
2. 检查配置：`docker-compose config`
3. 提交Issue：https://github.com/JuneTuan/CRMprojects/issues