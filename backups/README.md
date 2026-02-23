# JunLite CRM Docker 备份说明

## 备份日期
2026-02-23

## 备份内容

### Docker 镜像备份

1. **junlite-crm-server:backup-20260223**
   - 大小: 2.14GB
   - 包含: 后端服务器代码和依赖
   - 创建命令: `docker commit junlite-crm-server junlite-crm-server:backup-20260223`

2. **junlite-crm-admin-web:backup-20260223**
   - 大小: 95.1MB
   - 包含: 管理前端代码和依赖
   - 创建命令: `docker commit junlite-crm-admin-web junlite-crm-admin-web:backup-20260223`

### 数据库备份

- **junlite-crm-mysql-backup-20260223.sql**
  - 大小: 30KB
  - 包含: 完整的数据库结构和数据
  - 创建命令: `docker exec junlite-crm-mysql mysqldump -ucrm_user -pcrm_password_change_in_production crm_db > backups/junlite-crm-mysql-backup-20260223.sql`

## 恢复步骤

### 1. 恢复Docker镜像

```bash
# 恢复Server镜像
docker load < junlite-crm-server-backup-20260223.tar

# 恢复Admin Web镜像
docker load < junlite-crm-admin-web-backup-20260223.tar
```

### 2. 恢复数据库

```bash
# 启动MySQL容器
docker-compose up -d mysql

# 等待MySQL完全启动
sleep 15

# 恢复数据库
docker exec -i junlite-crm-mysql mysql -ucrm_user -pcrm_password_change_in_production crm_db < backups/junlite-crm-mysql-backup-20260223.sql
```

### 3. 导出Docker镜像为tar文件（可选）

如果需要将镜像传输到其他机器：

```bash
# 导出Server镜像
docker save junlite-crm-server:backup-20260223 -o backups/junlite-crm-server-backup-20260223.tar

# 导出Admin Web镜像
docker save junlite-crm-admin-web:backup-20260223 -o backups/junlite-crm-admin-web-backup-20260223.tar
```

## 备份文件位置

所有备份文件位于项目根目录的 `backups/` 文件夹中。

## 注意事项

1. MySQL镜像使用的是官方镜像 `mysql:8.4`，无需备份
2. CustomerH5使用本地开发服务器运行，无需Docker备份
3. 备份文件包含敏感信息（如数据库密码），请妥善保管
4. 建议定期备份，特别是在重要更新之前

## 查看备份列表

```bash
# 查看Docker镜像备份
docker images | grep backup

# 查看数据库备份文件
ls -lh backups/
```