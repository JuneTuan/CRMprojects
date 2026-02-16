const mysql = require('mysql2/promise');

async function testApiCreateRole() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 测试API创建角色 ===\n');

    console.log('1. 模拟API创建角色请求:');
    const roleName = 'API测试角色';
    const description = '通过API创建的测试角色';
    console.log('角色名称:', roleName);
    console.log('角色描述:', description);
    console.log('');

    console.log('2. 执行INSERT语句:');
    const [result] = await connection.query(
      'INSERT INTO role (role_name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [roleName, description]
    );
    console.log('创建成功，角色ID:', result.insertId);
    console.log('');

    console.log('3. 查询创建的角色:');
    const [role] = await connection.query('SELECT * FROM role WHERE role_id = ?', [result.insertId]);
    console.log('角色数据:', role[0]);
    console.log('');

    console.log('4. 验证字段映射:');
    console.log('role_name:', role[0].role_name);
    console.log('description:', role[0].description);
    console.log('');

    console.log('5. 清理测试数据:');
    await connection.query('DELETE FROM role WHERE role_id = ?', [result.insertId]);
    console.log('测试数据已清理');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

testApiCreateRole();
