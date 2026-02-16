-- 添加win_rate_config字段到activity表
-- 如果字段不存在则添加

ALTER TABLE activity 
ADD COLUMN IF NOT EXISTS win_rate_config JSON NULL 
COMMENT '中奖率配置，用于游戏活动';

-- 检查字段是否添加成功
DESCRIBE activity;