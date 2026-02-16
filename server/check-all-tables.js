const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 检查数据库表 ===\n');
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('所有表:');
    rows.forEach(row => {
      console.log(Object.values(row)[0]);
    });

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkTables();