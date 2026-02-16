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

    const [tables] = await connection.query('SHOW TABLES');
    console.log('所有表:', tables.map(t => Object.values(t)[0]));

    const [columns] = await connection.query('DESCRIBE product');
    console.log('\nproduct表结构:');
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Null}`);
    });

    const [categoryExists] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'crm_system' 
      AND table_name = 'category'
    `);
    console.log(`\ncategory表是否存在: ${categoryExists[0].count > 0 ? '是' : '否'}`);

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkTables();
