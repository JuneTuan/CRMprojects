-- 为核心业务表增加业务编码字段
-- 中期方案：内部ID + 业务编码

-- 1. 为customer表增加customer_code字段
ALTER TABLE `customer` ADD COLUMN `customer_code` VARCHAR(32) UNIQUE NULL COMMENT '客户业务编码' AFTER `customer_id`;

-- 2. 为product表增加product_code字段
ALTER TABLE `product` ADD COLUMN `product_code` VARCHAR(32) UNIQUE NULL COMMENT '产品业务编码' AFTER `product_id`;

-- 3. 为activity表增加activity_code字段
ALTER TABLE `activity` ADD COLUMN `activity_code` VARCHAR(32) UNIQUE NULL COMMENT '活动业务编码' AFTER `activity_id`;

-- 4. 为现有数据生成业务编码
-- 客户编码规则：CUS + 时间戳后6位 + 随机4位
UPDATE `customer` SET `customer_code` = CONCAT('CUS', RIGHT(UNIX_TIMESTAMP(created_at), 6), LPAD(FLOOR(RAND() * 10000), 4, '0')) WHERE `customer_code` IS NULL;

-- 产品编码规则：PRD + 分类ID + 序号（3位）
UPDATE `product` p SET `product_code` = CONCAT('PRD', IFNULL(p.category_id, 0), LPAD(p.product_id, 3, '0')) WHERE `product_code` IS NULL;

-- 活动编码规则：ACT + 年月 + 序号（3位）
UPDATE `activity` a SET `activity_code` = CONCAT('ACT', DATE_FORMAT(a.created_at, '%Y%m'), LPAD(a.activity_id, 3, '0')) WHERE `activity_code` IS NULL;

-- 5. 设置字段为NOT NULL（确保所有数据都有编码）
ALTER TABLE `customer` MODIFY COLUMN `customer_code` VARCHAR(32) NOT NULL COMMENT '客户业务编码';
ALTER TABLE `product` MODIFY COLUMN `product_code` VARCHAR(32) NOT NULL COMMENT '产品业务编码';
ALTER TABLE `activity` MODIFY COLUMN `activity_code` VARCHAR(32) NOT NULL COMMENT '活动业务编码';

-- 6. 验证结果
SELECT 'customer' as table_name, COUNT(*) as total, COUNT(customer_code) as has_code FROM customer
UNION ALL
SELECT 'product' as table_name, COUNT(*) as total, COUNT(product_code) as has_code FROM product
UNION ALL
SELECT 'activity' as table_name, COUNT(*) as total, COUNT(activity_code) as has_code FROM activity;