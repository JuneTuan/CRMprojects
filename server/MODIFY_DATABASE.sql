-- 修复customer表：删除username字段
-- 执行此脚本前请备份数据库！

-- 1. 删除username字段
ALTER TABLE customer DROP COLUMN username;

-- 2. 验证修改
DESCRIBE customer;

-- 3. 检查数据完整性
SELECT customer_id, customer_code, customer_name, phone, email FROM customer LIMIT 10;