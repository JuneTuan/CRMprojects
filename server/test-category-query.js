const mysql = require('mysql2/promise');

async function testCategoryQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 测试分类查询 ===\n');

    const query = `
      SELECT * FROM product_category 
      WHERE deleted_at IS NULL 
      ORDER BY sort_order ASC
    `;
    
    console.log('执行SQL:', query);
    const [data] = await connection.query(query);
    console.log('查询结果:', data);
    console.log('结果数量:', data.length);

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

testCategoryQuery();
