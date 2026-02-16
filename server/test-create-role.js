const mysql = require('mysql2/promise');

async function testCreateRole() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 测试创建角色 ===\n');

    console.log('1. 创建测试角色:');
    const [result] = await connection.query(
      'INSERT INTO role (role_name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      ['测试角色', '这是一个测试角色']
    );
    console.log('创建成功，角色ID:', result.insertId);
    console.log('');

    console.log('2. 查看新创建的角色:');
    const [newRole] = await connection.query('SELECT * FROM role WHERE role_id = ?', [result.insertId]);
    console.log(newRole);
    console.log('');

    console.log('3. 为角色添加权限:');
    const [permissionResult] = await connection.query(
      'INSERT INTO role_permission (role_id, permission_id, created_at) VALUES (?, ?, NOW())',
      [result.insertId, 11]
    );
    console.log('权限添加成功，关联ID:', permissionResult.insertId);
    console.log('');

    console.log('4. 查看角色权限:');
    const [rolePermissions] = await connection.query(`
      SELECT rp.*, r.role_name, p.permission_name 
      FROM role_permission rp 
      JOIN role r ON rp.role_id = r.role_id 
      JOIN permission p ON rp.permission_id = p.permission_id 
      WHERE rp.role_id = ?
    `, [result.insertId]);
    console.log(rolePermissions);
    console.log('');

    console.log('5. 清理测试数据:');
    await connection.query('DELETE FROM role_permission WHERE role_id = ?', [result.insertId]);
    await connection.query('DELETE FROM role WHERE role_id = ?', [result.insertId]);
    console.log('测试数据已清理');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

testCreateRole();
