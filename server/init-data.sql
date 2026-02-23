-- 初始化角色数据
INSERT INTO role (role_id, role_name, description, created_at, updated_at) VALUES
(1, '超级管理员', '系统超级管理员，拥有所有权限', NOW(), NOW()),
(2, '管理员', '系统管理员，拥有大部分权限', NOW(), NOW()),
(3, '客服', '客服人员，负责客户服务和订单处理', NOW(), NOW()),
(4, '运营', '运营人员，负责活动和营销', NOW(), NOW());

-- 初始化管理员用户 (密码: admin123)
INSERT INTO user (username, password, user_name, phone, email, role_id, position, is_active, created_at, updated_at) VALUES
('admin', '$2b$10$5qpEwVA05ocNPFzauBSq2e3ai/arBLD4IaiM9fe3dAGhvyBpy6ohi', '系统管理员', '13800138000', 'admin@junlite.com', 1, '系统管理员', 1, NOW(), NOW());

-- 初始化测试用户 (密码: test123)
INSERT INTO user (username, password, user_name, phone, email, role_id, position, is_active, created_at, updated_at) VALUES
('test', '$2b$10$3ZzpMnmcLwAWlXtfc7JjX.fxttZTgq.w0YCkCCoVwJC2q4Ed4daPO', '测试用户', '13800138001', 'test@junlite.com', 2, '测试人员', 1, NOW(), NOW());