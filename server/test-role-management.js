const mysql = require('mysql2/promise');

async function testRoleManagement() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 测试角色管理功能 ===\n');

    console.log('1. 查看现有角色:');
    const [roles] = await connection.query('SELECT * FROM role WHERE deleted_at IS NULL');
    console.log(roles);
    console.log('');

    console.log('2. 查看现有权限:');
    const [permissions] = await connection.query('SELECT permission_id, permission_name, code FROM permission WHERE deleted_at IS NULL LIMIT 10');
    console.log(permissions);
    console.log('');

    console.log('3. 查看角色权限关联:');
    const [rolePermissions] = await connection.query(`
      SELECT rp.*, r.role_name, p.permission_name 
      FROM role_permission rp 
      JOIN role r ON rp.role_id = r.role_id 
      JOIN permission p ON rp.permission_id = p.permission_id 
      LIMIT 10
    `);
    console.log(rolePermissions);
    console.log('');

    console.log('4. 查看用户角色关联:');
    const [userRoles] = await connection.query(`
      SELECT u.user_id, u.username, u.user_name, r.role_name 
      FROM user u 
      LEFT JOIN role r ON u.role_id = r.role_id 
      WHERE u.deleted_at IS NULL 
      LIMIT 10
    `);
    console.log(userRoles);
    console.log('');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

testRoleManagement();
