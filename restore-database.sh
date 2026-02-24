#!/bin/bash

# JunLite CRM 数据库恢复脚本
# 用途: 从备份文件恢复MySQL数据库

set -e

# 配置
DB_CONTAINER="junlite-crm-mysql"
DB_NAME="crm_db"
DB_USER="crm_user"
DB_PASSWORD="crm_password_change_in_production"
BACKUP_DIR="database-backups"

echo "======================================"
echo "  JunLite CRM 数据库恢复"
echo "  恢复时间: $(date)"
echo "======================================"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo "用法: $0 <备份文件>"
    echo ""
    echo "可用的备份文件:"
    ls -lh $BACKUP_DIR/*.sql.gz 2>/dev/null || echo "  没有找到备份文件"
    exit 1
fi

BACKUP_FILE="$1"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "备份文件: $BACKUP_FILE"
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "文件大小: $FILE_SIZE"
echo ""

# 确认恢复操作
echo "⚠️  警告: 此操作将覆盖当前数据库！"
echo ""
read -p "确认要恢复数据库吗？(输入 'yes' 继续): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 操作已取消"
    exit 0
fi

echo ""
echo "开始恢复数据库..."
echo ""

# 检查容器是否运行
if ! docker ps | grep -q $DB_CONTAINER; then
    echo "❌ 错误: 数据库容器 $DB_CONTAINER 未运行"
    exit 1
fi

echo "✓ 数据库容器正在运行"
echo ""

# 解压备份文件（如果需要）
TEMP_FILE="/tmp/temp_restore.sql"

if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "正在解压备份文件..."
    gunzip -c "$BACKUP_FILE" > $TEMP_FILE
    echo "✓ 备份文件已解压"
else
    cp "$BACKUP_FILE" $TEMP_FILE
fi

echo ""

# 停止应用服务以避免数据冲突
echo "正在停止应用服务..."
docker-compose stop server admin-web customer-h5
echo "✓ 应用服务已停止"
echo ""

# 恢复数据库
echo "正在恢复数据库..."
docker exec -i $DB_CONTAINER mysql \
    -u$DB_USER \
    -p$DB_PASSWORD \
    $DB_NAME < $TEMP_FILE

if [ $? -eq 0 ]; then
    echo "✓ 数据库恢复完成"
else
    echo "❌ 数据库恢复失败"
    rm -f $TEMP_FILE
    exit 1
fi

# 清理临时文件
rm -f $TEMP_FILE
echo "✓ 临时文件已清理"
echo ""

# 重启应用服务
echo "正在重启应用服务..."
docker-compose start server admin-web customer-h5
echo "✓ 应用服务已重启"
echo ""

echo "======================================"
echo "  恢复完成！"
echo "======================================"
echo ""
echo "数据库已从以下备份恢复:"
echo "  $BACKUP_FILE"
echo ""
echo "请检查应用是否正常运行"
echo ""