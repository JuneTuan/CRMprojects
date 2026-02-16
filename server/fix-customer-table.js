const mysql = require('mysql2/promise');

async function fixCustomerTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 修复customer表 ===\n');

    console.log('1. 删除username字段...');
    await connection.execute('ALTER TABLE customer DROP COLUMN username');
    console.log('✓ username字段已删除');

    console.log('\n2. 验证修改...');
    const [rows] = await connection.execute('DESCRIBE customer');
    console.log('表结构:');
    rows.forEach(row => {
      console.log(`${row.Field.padEnd(20)} ${row.Type.padEnd(20)} ${row.Null.padEnd(5)} ${row.Key}`);
    });

    console.log('\n3. 检查数据完整性...');
    const [data] = await connection.execute('SELECT customer_id, customer_code, customer_name, phone, email FROM customer LIMIT 10');
    console.log('数据示例:');
    data.forEach(row => {
      console.log(`ID: ${row.customer_id}, Code: ${row.customer_code}, Name: ${row.customer_name}, Phone: ${row.phone}`);
    });

    console.log('\n✓ customer表修复完成！');

  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixCustomerTable();