const mysql = require('mysql2/promise');

async function cleanDatabaseAndCreateAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 开始清理数据库 ===\n');

    console.log('1. 删除角色权限关联...');
    await connection.execute('DELETE FROM role_permission');
    console.log('✓ 角色权限关联已清空');

    console.log('\n2. 删除权限...');
    await connection.execute('DELETE FROM permission');
    console.log('✓ 权限已清空');

    console.log('\n3. 删除角色...');
    await connection.execute('DELETE FROM role');
    console.log('✓ 角色已清空');

    console.log('\n4. 删除用户...');
    await connection.execute('DELETE FROM user');
    console.log('✓ 用户已清空');

    console.log('\n5. 删除抽奖记录...');
    await connection.execute('DELETE FROM lottery_record');
    console.log('✓ 抽奖记录已清空');

    console.log('\n6. 删除客户优惠券...');
    await connection.execute('DELETE FROM customer_coupon');
    console.log('✓ 客户优惠券已清空');

    console.log('\n7. 删除优惠券...');
    await connection.execute('DELETE FROM coupon');
    console.log('✓ 优惠券已清空');

    console.log('\n8. 删除订单项...');
    await connection.execute('DELETE FROM order_item');
    console.log('✓ 订单项已清空');

    console.log('\n9. 删除订单...');
    await connection.execute('DELETE FROM `order`');
    console.log('✓ 订单已清空');

    console.log('\n10. 删除客户...');
    await connection.execute('DELETE FROM customer');
    console.log('✓ 客户已清空');

    console.log('\n11. 删除积分记录...');
    await connection.execute('DELETE FROM point_record');
    console.log('✓ 积分记录已清空');

    console.log('\n12. 删除游戏奖品关联...');
    await connection.execute('DELETE FROM game_prize');
    console.log('✓ 游戏奖品关联已清空');

    console.log('\n13. 删除活动游戏关联...');
    await connection.execute('DELETE FROM activity_game');
    console.log('✓ 活动游戏关联已清空');

    console.log('\n14. 删除游戏类型...');
    await connection.execute('DELETE FROM game_type');
    console.log('✓ 游戏类型已清空');

    console.log('\n15. 删除活动...');
    await connection.execute('DELETE FROM activity');
    console.log('✓ 活动已清空');

    console.log('\n16. 删除奖品...');
    await connection.execute('DELETE FROM prize');
    console.log('✓ 奖品已清空');

    console.log('\n17. 删除产品...');
    await connection.execute('DELETE FROM product');
    console.log('✓ 产品已清空');

    console.log('\n=== 数据库清理完成 ===\n');

    console.log('=== 创建超级管理员 ===\n');

    const hashedPassword = '$2b$10$mgVMVwtI1mHRmATOlKaBFOV7YnoDRx.rgxvLTqmnkHUgSyXfUI2p2';

    await connection.execute(
      `INSERT INTO user (username, password, user_name, phone, email, position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin', hashedPassword, '超级管理员', '13800138000', 'admin@example.com', '系统管理员', 1]
    );
    console.log('✓ 超级管理员创建成功');

    await connection.execute(
      `INSERT INTO role (role_name, description) VALUES (?, ?)`,
      ['超级管理员', '拥有所有权限']
    );
    console.log('✓ 超级管理员角色创建成功');

    const [roles] = await connection.execute('SELECT role_id FROM role WHERE role_name = ?', ['超级管理员']);
    const roleId = roles[0].role_id;

    const [users] = await connection.execute('SELECT user_id FROM user WHERE username = ?', ['admin']);
    const userId = users[0].user_id;

    await connection.execute(
      `UPDATE user SET role_id = ? WHERE user_id = ?`,
      [roleId, userId]
    );
    console.log('✓ 超级管理员角色分配成功');

    const permissions = [
      ['用户管理', 'user:manage', '管理系统用户'],
      ['客户管理', 'customer:manage', '管理客户信息'],
      ['产品管理', 'product:manage', '管理产品信息'],
      ['订单管理', 'order:manage', '管理订单信息'],
      ['优惠券管理', 'coupon:manage', '管理优惠券'],
      ['活动管理', 'activity:manage', '管理活动'],
      ['奖品管理', 'prize:manage', '管理奖品'],
      ['抽奖管理', 'lottery:manage', '管理抽奖'],
      ['积分管理', 'point:manage', '管理积分'],
      ['授权管理', 'permission:manage', '管理权限'],
      ['数据统计', 'statistics:manage', '查看数据统计'],
    ];

    for (const [permissionName, code, description] of permissions) {
      await connection.execute(
        `INSERT INTO permission (permission_name, code, description) VALUES (?, ?, ?)`,
        [permissionName, code, description]
      );
    }
    console.log('✓ 权限创建成功');

    const [permissionList] = await connection.execute('SELECT permission_id FROM permission');
    for (const permission of permissionList) {
      await connection.execute(
        `INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)`,
        [roleId, permission.permission_id]
      );
    }
    console.log('✓ 角色权限分配成功');

    console.log('\n=== 数据库初始化完成 ===');
    console.log('超级管理员账号：admin');
    console.log('超级管理员密码：admin123');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

cleanDatabaseAndCreateAdmin();