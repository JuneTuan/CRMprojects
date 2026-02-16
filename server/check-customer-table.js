const mysql = require('mysql2/promise');

async function checkCustomerTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 检查customer表结构 ===\n');
    const [rows] = await connection.query('DESCRIBE customer');
    rows.forEach(row => {
      const field = row.Field.padEnd(20);
      const type = row.Type.padEnd(20);
      const null_ = (row.Null === 'YES' ? 'YES' : 'NO').padEnd(5);
      const key = (row.Key || '').padEnd(4);
      console.log(`${field}${type}${null_}${key}`);
    });
    console.log('');

    console.log('=== 查看customer表数据 ===\n');
    const [data] = await connection.query('SELECT * FROM customer LIMIT 5');
    console.log(data);
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkCustomerTable();
