const mysql = require('mysql2/promise');

async function checkPermissionTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 检查permission表结构 ===\n');
    const [rows] = await connection.query('DESCRIBE permission');
    rows.forEach(row => {
      const field = row.Field.padEnd(20);
      const type = row.Type.padEnd(20);
      const null_ = (row.Null === 'YES' ? 'YES' : 'NO').padEnd(5);
      const key = (row.Key || '').padEnd(4);
      console.log(`${field}${type}${null_}${key}`);
    });
    console.log('\n=== 检查permission表数据 ===\n');
    const [data] = await connection.query('SELECT * FROM permission LIMIT 10');
    console.log(data);
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkPermissionTable();
