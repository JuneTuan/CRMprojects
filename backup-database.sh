#!/bin/bash

# JunLite CRM 数据库备份脚本
# 用途: 备份MySQL数据库

set -e

# 配置
DB_CONTAINER="junlite-crm-mysql"
DB_NAME="crm_db"
DB_USER="crm_user"
DB_PASSWORD="crm_password_change_in_production"
BACKUP_DIR="database-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/crm_db_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo "======================================"
echo "  JunLite CRM 数据库备份"
echo "  备份时间: $(date)"
echo "======================================"
echo ""

# 创建备份目录
mkdir -p $BACKUP_DIR

# 检查容器是否运行
if ! docker ps | grep -q $DB_CONTAINER; then
    echo "❌ 错误: 数据库容器 $DB_CONTAINER 未运行"
    exit 1
fi

echo "✓ 数据库容器正在运行"
echo ""

# 备份数据库
echo "正在备份数据库..."
docker exec $DB_CONTAINER mysqldump \
    -u$DB_USER \
    -p$DB_PASSWORD \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    $DB_NAME > $BACKUP_FILE 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ 数据库备份完成: $BACKUP_FILE"
    
    # 压缩备份文件
    echo ""
    echo "正在压缩备份文件..."
    gzip -f $BACKUP_FILE
    
    if [ -f "$BACKUP_FILE_GZ" ]; then
        echo "✓ 备份文件已压缩: $BACKUP_FILE_GZ"
        
        # 获取文件大小
        FILE_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
        echo "  文件大小: $FILE_SIZE"
    fi
else
    echo "❌ 数据库备份失败"
    exit 1
fi

echo ""
echo "======================================"
echo "  备份完成！"
echo "======================================"
echo ""

# 显示备份文件列表
echo "最近的备份文件:"
ls -lh $BACKUP_DIR/ | tail -5

echo ""
echo "备份位置: $BACKUP_DIR"
echo "备份文件: $BACKUP_FILE_GZ"
echo ""

# 清理旧备份（保留最近10个）
echo "正在清理旧备份（保留最近10个）..."
cd $BACKUP_DIR
ls -t *.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f 2>/dev/null
echo "✓ 旧备份清理完成"
echo ""

echo "======================================"
echo "  备份统计信息"
echo "======================================"
echo ""
echo "总备份数量: $(ls -1 $BACKUP_DIR/*.sql.gz 2>/dev/null | wc -l)"
echo "最新备份: $(ls -t $BACKUP_DIR/*.sql.gz 2>/dev/null | head -1)"
echo "备份目录: $(pwd)/$BACKUP_DIR"
echo ""