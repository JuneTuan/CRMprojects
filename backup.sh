#!/bin/bash

# JunLite CRM 备份脚本
# 用途: 备份Docker镜像和数据库

BACKUP_DATE=$(date +%Y%m%d)
BACKUP_DIR="backups"

echo "======================================"
echo "  JunLite CRM 备份脚本"
echo "  备份日期: $BACKUP_DATE"
echo "======================================"
echo ""

# 创建备份目录
mkdir -p $BACKUP_DIR

echo "1. 备份Server镜像..."
docker commit junlite-crm-server junlite-crm-server:backup-$BACKUP_DATE
echo "✓ Server镜像备份完成"

echo ""
echo "2. 备份Admin Web镜像..."
docker commit junlite-crm-admin-web junlite-crm-admin-web:backup-$BACKUP_DATE
echo "✓ Admin Web镜像备份完成"

echo ""
echo "3. 备份数据库..."
docker exec junlite-crm-mysql mysqldump -ucrm_user -pcrm_password_change_in_production crm_db > $BACKUP_DIR/junlite-crm-mysql-backup-$BACKUP_DATE.sql 2>/dev/null
echo "✓ 数据库备份完成"

echo ""
echo "4. 导出Docker镜像为tar文件..."
docker save junlite-crm-server:backup-$BACKUP_DATE -o $BACKUP_DIR/junlite-crm-server-backup-$BACKUP_DATE.tar
docker save junlite-crm-admin-web:backup-$BACKUP_DATE -o $BACKUP_DIR/junlite-crm-admin-web-backup-$BACKUP_DATE.tar
echo "✓ Docker镜像导出完成"

echo ""
echo "======================================"
echo "  备份完成！"
echo "======================================"
echo ""
echo "备份文件列表:"
ls -lh $BACKUP_DIR/

echo ""
echo "Docker镜像备份:"
docker images | grep backup