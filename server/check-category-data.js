const mysql = require('mysql2/promise');

async function checkCategoryData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 检查product_category表数据 ===\n');

    const [data] = await connection.query('SELECT * FROM product_category');
    console.log('分类数据:');
    data.forEach(row => {
      console.log(`  ID: ${row.product_category_id}, 名称: ${row.product_category_name}, 父分类: ${row.parent_id || '无'}, 排序: ${row.sort_order}, 状态: ${row.is_active ? '启用' : '禁用'}, 删除时间: ${row.deleted_at || '无'}`);
    });

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkCategoryData();
