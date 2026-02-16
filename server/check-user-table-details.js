const mysql = require('mysql2/promise');

async function checkUserTableDetails() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 检查user表详细结构 ===\n');
    const [rows] = await connection.execute('DESCRIBE user');
    rows.forEach(row => {
      console.log(`${row.Field.padEnd(20)} ${row.Type.padEnd(20)} ${row.Null.padEnd(5)} ${row.Key.padEnd(5)} ${row.Default || ''}`);
    });

    console.log('\n=== 检查user表索引 ===\n');
    const [indexes] = await connection.execute('SHOW INDEX FROM user');
    indexes.forEach(idx => {
      console.log(`索引名: ${idx.Key_name}, 列: ${idx.Column_name}, 唯一: ${idx.Non_unique === 0 ? '是' : '否'}`);
    });

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkUserTableDetails();