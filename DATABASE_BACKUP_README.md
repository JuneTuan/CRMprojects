# 数据库备份和恢复脚本

## 概述

本项目提供了两个主要的数据库管理脚本：

1. **backup-database.sh** - 数据库备份脚本
2. **restore-database.sh** - 数据库恢复脚本

## 使用说明

### 1. 数据库备份

运行备份脚本：

```bash
./backup-database.sh
```

**功能特性：**
- 自动创建时间戳备份文件
- 备份文件自动压缩（.gz格式）
- 自动清理旧备份（保留最近10个）
- 显示备份统计信息
- 备份文件存储在 `database-backups/` 目录

**备份文件命名格式：**
```
crm_db_backup_YYYYMMDD_HHMMSS.sql.gz
```

**示例输出：**
```
======================================
  JunLite CRM 数据库备份
  备份时间: 2026-02-24 11:45:30
======================================

✓ 数据库容器正在运行

正在备份数据库...
✓ 数据库备份完成: database-backups/crm_db_backup_20260224_114530.sql

正在压缩备份文件...
✓ 备份文件已压缩: database-backups/crm_db_backup_20260224_114530.sql.gz
  文件大小: 2.5M

======================================
  备份完成！
======================================

最近的备份文件:
-rw-r--r--  1 user  group  2.5M Feb 24 11:45 crm_db_backup_20260224_114530.sql.gz
-rw-r--r--  1 user  group  2.4M Feb 23 15:20 crm_db_backup_20260223_152015.sql.gz
```

### 2. 数据库恢复

运行恢复脚本：

```bash
./restore-database.sh <备份文件>
```

**参数说明：**
- `<备份文件>`: 要恢复的备份文件路径

**示例：**
```bash
./restore-database.sh database-backups/crm_db_backup_20260224_114530.sql.gz
```

**功能特性：**
- 自动检测备份文件是否存在
- 支持压缩和未压缩的备份文件
- 恢复前自动停止应用服务
- 恢复后自动重启应用服务
- 需要用户确认（输入 'yes'）才能继续

**示例输出：**
```
======================================
  JunLite CRM 数据库恢复
  恢复时间: 2026-02-24 11:50:00
======================================

备份文件: database-backups/crm_db_backup_20260224_114530.sql.gz
文件大小: 2.5M

⚠️  警告: 此操作将覆盖当前数据库！

确认要恢复数据库吗？(输入 'yes' 继续): yes

开始恢复数据库...

✓ 数据库容器正在运行

正在解压备份文件...
✓ 备份文件已解压

正在停止应用服务...
✓ 应用服务已停止

正在恢复数据库...
✓ 数据库恢复完成
✓ 临时文件已清理

正在重启应用服务...
✓ 应用服务已重启

======================================
  恢复完成！
======================================

数据库已从以下备份恢复:
  database-backups/crm_db_backup_20260224_114530.sql.gz

请检查应用是否正常运行
```

## 配置说明

脚本中的数据库配置（如需修改，请编辑脚本文件）：

```bash
DB_CONTAINER="junlite-crm-mysql"      # Docker容器名称
DB_NAME="crm_db"                      # 数据库名称
DB_USER="crm_user"                    # 数据库用户名
DB_PASSWORD="crm_password_change_in_production"  # 数据库密码
BACKUP_DIR="database-backups"         # 备份目录
```

## 注意事项

1. **备份前检查：**
   - 确保Docker容器正在运行
   - 确保有足够的磁盘空间

2. **恢复前检查：**
   - 确认备份文件完整且未损坏
   - 恢复操作会覆盖当前数据库，请谨慎操作
   - 建议在恢复前先备份当前数据库

3. **权限要求：**
   - 脚本需要执行权限：`chmod +x backup-database.sh restore-database.sh`
   - 需要Docker操作权限

4. **备份策略：**
   - 建议定期执行备份（如每天一次）
   - 备份文件可以复制到外部存储进行长期保存
   - 保留多个备份版本以便回滚

5. **恢复策略：**
   - 恢复时会停止应用服务，可能导致短暂服务中断
   - 恢复后请检查应用功能是否正常
   - 如有问题，可以从其他备份恢复

## 常见问题

### Q1: 备份失败怎么办？
A: 检查以下几点：
   - Docker容器是否正在运行：`docker ps | grep junlite-crm-mysql`
   - 数据库连接信息是否正确
   - 磁盘空间是否充足

### Q2: 恢复失败怎么办？
A: 检查以下几点：
   - 备份文件是否完整
   - 数据库容器是否正在运行
   - 查看错误日志了解具体原因

### Q3: 如何查看所有备份文件？
A: 运行以下命令：
   ```bash
   ls -lh database-backups/
   ```

### Q4: 如何删除旧备份？
A: 脚本会自动保留最近10个备份，如需手动删除：
   ```bash
   rm database-backups/crm_db_backup_YYYYMMDD_HHMMSS.sql.gz
   ```

## 自动化建议

可以将备份脚本添加到crontab中实现自动备份：

```bash
# 每天凌晨2点执行备份
0 2 * * * /path/to/CRMprojects/backup-database.sh >> /var/log/crm-backup.log 2>&1
```

## 技术支持

如遇到问题，请检查：
1. Docker日志：`docker-compose logs mysql`
2. 脚本执行权限：`ls -l backup-database.sh restore-database.sh`
3. 备份目录权限：`ls -ld database-backups/`