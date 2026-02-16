const mysql = require('mysql2/promise');

async function checkCategoryTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 检查product_category表 ===\n');

    const [columns] = await connection.query('DESCRIBE product_category');
    console.log('product_category表结构:');
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Null}`);
    });

    const [data] = await connection.query('SELECT * FROM product_category LIMIT 10');
    console.log('\nproduct_category表数据:');
    data.forEach(row => {
      console.log(`  ID: ${row.category_id}, 名称: ${row.category_name}, 描述: ${row.description || '无'}`);
    });

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkCategoryTable();
