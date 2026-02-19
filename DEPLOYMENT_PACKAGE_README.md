# CRM系统 R1.0.0 部署包说明

## 📦 部署包内容

本部署包包含CRM系统 R1.0.0 版本的所有必要文件：

```
crm-r1.0.0-deployment.tar.gz
├── DEPLOYMENT.md          # 详细部署指南
├── README.md              # 项目说明文档
├── deploy.sh             # 自动化部署脚本
├── server/              # 后端服务
│   ├── dist/            # 编译后的后端代码
│   ├── package.json      # 依赖配置
│   └── .env             # 环境配置（需修改）
├── admin-web/           # 管理后台
│   ├── dist/            # 编译后的前端代码
│   └── .env             # 环境配置（需修改）
└── customerH5/          # H5前端
    ├── .env             # 环境配置（需修改）
    └── *                 # H5静态文件
```

## 🚀 快速开始

### 1. 上传部署包

```bash
# 使用SCP上传
scp crm-r1.0.0-deployment.tar.gz user@server:/tmp/

# 或使用FTP/SFTP工具上传
```

### 2. 解压部署包

```bash
# SSH登录到服务器
ssh user@server

# 解压到部署目录
cd /opt
tar -xzf /tmp/crm-r1.0.0-deployment.tar.gz
cd crm-r1.0.0
```

### 3. 配置环境变量

#### 3.1 后端配置

编辑 `server/.env` 文件：

```env
# 数据库配置（必须修改）
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=crm_db

# JWT配置（必须修改）
JWT_SECRET=your_secure_jwt_secret_key

# 服务器配置
PORT=3001
NODE_ENV=production
```

#### 3.2 管理后台配置

编辑 `admin-web/.env` 文件：

```env
# API地址（必须修改为实际服务器地址）
VITE_API_BASE_URL=http://your-server-ip:3001
```

#### 3.3 H5前端配置

编辑 `customerH5/.env` 文件：

```env
# API地址（必须修改为实际服务器地址）
VITE_API_BASE_URL=http://your-server-ip:3001
```

### 4. 运行部署脚本

```bash
# 执行自动化部署脚本
./deploy.sh
```

部署脚本会自动完成以下操作：
- 停止旧的后端服务
- 启动新的后端服务（使用PM2）
- 复制前端文件到Nginx目录
- 重载Nginx配置

## 📋 部署前检查清单

在运行部署脚本前，请确认以下项目：

- [ ] MySQL服务已安装并运行
- [ ] 已创建数据库 crm_db
- [ ] 已创建数据库用户并授权
- [ ] Node.js版本 >= 18.0.0
- [ ] PM2已全局安装
- [ ] Nginx已安装并运行
- [ ] 已修改所有环境配置文件
- [ ] 防火墙已开放必要端口（80, 443, 3001）

## 🔧 手动部署步骤

如果自动化部署脚本无法使用，可以手动执行以下步骤：

### 1. 部署后端

```bash
cd server

# 安装依赖
npm install --production

# 使用PM2启动
pm2 stop crm-server || true
pm2 start dist/src/main.js --name crm-server

# 查看日志
pm2 logs crm-server
```

### 2. 部署管理后台

```bash
cd admin-web

# 复制到Nginx目录
sudo cp -r dist/* /var/www/crm-admin/

# 重载Nginx
sudo systemctl reload nginx
```

### 3. 部署H5前端

```bash
cd customerH5

# 复制到Nginx目录
sudo cp -r * /var/www/crm-h5/

# 重载Nginx
sudo systemctl reload nginx
```

## 🌐 访问系统

部署完成后，通过以下地址访问系统：

- **管理后台**: http://admin.your-domain.com
- **H5前端**: http://h5.your-domain.com
- **后端API**: http://your-server-ip:3001

## 🔐 默认账号

**管理员账号**：
- 用户名: `admin`
- 密码: `admin123`

**⚠️ 重要提示：首次登录后请立即修改默认密码！**

## 📞 故障排查

### 后端无法启动

```bash
# 查看PM2日志
pm2 logs crm-server

# 查看详细错误
pm2 logs crm-server --lines 100

# 重启服务
pm2 restart crm-server
```

### 前端无法访问

```bash
# 检查Nginx状态
sudo systemctl status nginx

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 测试Nginx配置
sudo nginx -t
```

### 数据库连接失败

```bash
# 测试数据库连接
mysql -u your_user -p -h localhost crm_db

# 检查MySQL服务状态
sudo systemctl status mysql
```

## 📊 监控和维护

### PM2监控

```bash
# 查看所有进程
pm2 list

# 实时监控
pm2 monit

# 查看资源使用
pm2 show crm-server
```

### 日志位置

- **后端日志**: `~/.pm2/logs/crm-server-out.log`
- **Nginx访问日志**: `/var/log/nginx/access.log`
- **Nginx错误日志**: `/var/log/nginx/error.log`
- **MySQL日志**: `/var/log/mysql/error.log`

## 🔄 更新和升级

### 更新到新版本

```bash
# 备份当前版本
cd /opt
mv crm-r1.0.0 crm-r1.0.0-backup

# 上传并解压新版本
tar -xzf crm-new-version.tar.gz

# 运行部署脚本
cd crm-new-version
./deploy.sh
```

### 回滚到旧版本

```bash
# 停止当前版本
pm2 stop crm-server

# 恢复旧版本
cd /opt
mv crm-r1.0.0 crm-new-version
mv crm-r1.0.0-backup crm-r1.0.0

# 启动旧版本
cd crm-r1.0.0/server
pm2 start dist/src/main.js --name crm-server
```

## 📞 技术支持

如遇到部署问题，请参考：
- 详细部署文档: `DEPLOYMENT.md`
- 项目README: `README.md`
- 提交Issue到代码仓库

## 📝 版本信息

- **版本号**: R1.0.0
- **发布日期**: 2026-02-19
- **Git标签**: R1
- **分支**: V5.0

---

**部署完成后，请立即修改默认管理员密码！**
