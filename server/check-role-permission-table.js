const mysql = require('mysql2/promise');

async function checkRolePermissionTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 检查role_permission表结构 ===\n');
    const [rows] = await connection.execute('DESCRIBE role_permission');
    rows.forEach(row => {
      console.log(`${row.Field.padEnd(20)} ${row.Type.padEnd(20)} ${row.Null.padEnd(5)} ${row.Key}`);
    });

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkRolePermissionTable();