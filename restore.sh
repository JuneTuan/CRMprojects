#!/bin/bash

# JunLite CRM 恢复脚本
# 用途: 从备份恢复Docker镜像和数据库

if [ -z "$1" ]; then
    echo "用法: ./restore.sh <备份日期>"
    echo "示例: ./restore.sh 20260223"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="backups"

echo "======================================"
echo "  JunLite CRM 恢复脚本"
echo "  恢复日期: $BACKUP_DATE"
echo "======================================"
echo ""

# 检查备份文件是否存在
if [ ! -f "$BACKUP_DIR/junlite-crm-server-backup-$BACKUP_DATE.tar" ]; then
    echo "错误: Server备份文件不存在"
    exit 1
fi

if [ ! -f "$BACKUP_DIR/junlite-crm-admin-web-backup-$BACKUP_DATE.tar" ]; then
    echo "错误: Admin Web备份文件不存在"
    exit 1
fi

if [ ! -f "$BACKUP_DIR/junlite-crm-mysql-backup-$BACKUP_DATE.sql" ]; then
    echo "错误: 数据库备份文件不存在"
    exit 1
fi

echo "1. 停止当前服务..."
docker-compose down
echo "✓ 服务已停止"

echo ""
echo "2. 加载Server镜像..."
docker load < $BACKUP_DIR/junlite-crm-server-backup-$BACKUP_DATE.tar
echo "✓ Server镜像加载完成"

echo ""
echo "3. 加载Admin Web镜像..."
docker load < $BACKUP_DIR/junlite-crm-admin-web-backup-$BACKUP_DATE.tar
echo "✓ Admin Web镜像加载完成"

echo ""
echo "4. 启动服务..."
docker-compose up -d
echo "✓ 服务已启动"

echo ""
echo "5. 等待MySQL启动..."
sleep 15

echo ""
echo "6. 恢复数据库..."
docker exec -i junlite-crm-mysql mysql -ucrm_user -pcrm_password_change_in_production crm_db < $BACKUP_DIR/junlite-crm-mysql-backup-$BACKUP_DATE.sql
echo "✓ 数据库恢复完成"

echo ""
echo "======================================"
echo "  恢复完成！"
echo "======================================"
echo ""
echo "服务状态:"
docker ps --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "访问地址:"
echo "  - 管理后台: http://localhost:8080"
echo "  - CustomerH5: http://localhost:5173"
echo "  - 后端API: http://localhost:3001"