-- V6.0数据库迁移脚本
-- 版本：V6.0
-- 日期：2026-02-26
-- 说明：创建销售线索管理相关表

-- 执行前检查
SELECT '开始执行V6.0数据库迁移...';

-- 创建销售线索表
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '线索姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '电话号码',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱地址',
  `company` VARCHAR(200) DEFAULT NULL COMMENT '公司名称',
  `position` VARCHAR(100) DEFAULT NULL COMMENT '职位',
  `source` VARCHAR(50) NOT NULL COMMENT '来源渠道',
  `source_detail` VARCHAR(200) DEFAULT NULL COMMENT '来源详情',
  `description` TEXT DEFAULT NULL COMMENT '线索描述',
  `priority` VARCHAR(20) NOT NULL DEFAULT 'medium' COMMENT '优先级',
  `status` VARCHAR(20) NOT NULL DEFAULT 'new' COMMENT '状态',
  `assigned_to` INT DEFAULT NULL COMMENT '分配给的销售人员ID',
  `assigned_at` DATETIME DEFAULT NULL COMMENT '分配时间',
  `score` INT DEFAULT 0 COMMENT '线索评分',
  `converted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已转化',
  `converted_at` DATETIME DEFAULT NULL COMMENT '转化时间',
  `converted_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '转化金额',
  `converted_customer_id` INT DEFAULT NULL COMMENT '转化的客户ID',
  `closed` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已关闭',
  `closed_at` DATETIME DEFAULT NULL COMMENT '关闭时间',
  `close_reason` VARCHAR(200) DEFAULT NULL COMMENT '关闭原因',
  `created_by` INT NOT NULL COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_converted` (`converted`),
  CONSTRAINT `fk_leads_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_leads_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_leads_converted_customer_id` FOREIGN KEY (`converted_customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='销售线索表';

-- 创建线索跟进记录表
CREATE TABLE IF NOT EXISTS `lead_followups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lead_id` INT NOT NULL COMMENT '线索ID',
  `contact_method` VARCHAR(20) NOT NULL COMMENT '联系方式',
  `contact_time` DATETIME NOT NULL COMMENT '联系时间',
  `contact_content` TEXT DEFAULT NULL COMMENT '联系内容',
  `contact_result` VARCHAR(20) NOT NULL COMMENT '联系结果',
  `next_followup` DATETIME DEFAULT NULL COMMENT '下次跟进时间',
  `attachment` VARCHAR(500) DEFAULT NULL COMMENT '附件路径',
  `created_by` INT NOT NULL COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_lead_id` (`lead_id`),
  KEY `idx_contact_time` (`contact_time`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_lead_followups_lead_id` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lead_followups_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='线索跟进记录表';

-- 创建线索分配历史表
CREATE TABLE IF NOT EXISTS `lead_assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lead_id` INT NOT NULL COMMENT '线索ID',
  `assigned_to` INT NOT NULL COMMENT '分配给的销售人员ID',
  `assigned_by` INT NOT NULL COMMENT '分配人ID',
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  `notes` VARCHAR(500) DEFAULT NULL COMMENT '分配备注',
  PRIMARY KEY (`id`),
  KEY `idx_lead_id` (`lead_id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_assigned_at` (`assigned_at`),
  CONSTRAINT `fk_lead_assignments_lead_id` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lead_assignments_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lead_assignments_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='线索分配历史表';

-- 执行后检查
SELECT 'V6.0数据库迁移完成！';
