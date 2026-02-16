const mysql = require('mysql2/promise');

async function addCustomerFields() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 添加客户表字段 ===\n');

    // 添加source字段
    await connection.execute(`
      ALTER TABLE customer 
      ADD COLUMN source ENUM('后台新增', 'H5注册') DEFAULT '后台新增' COMMENT '客户来源'
    `);
    console.log('✓ 添加source字段成功');

    // 添加remark字段
    await connection.execute(`
      ALTER TABLE customer 
      ADD COLUMN remark TEXT COMMENT '备注信息'
    `);
    console.log('✓ 添加remark字段成功');

    console.log('\n=== 查看更新后的表结构 ===\n');
    const [rows] = await connection.query('DESCRIBE customer');
    rows.forEach(row => {
      const field = row.Field.padEnd(20);
      const type = row.Type.padEnd(30);
      const null_ = (row.Null === 'YES' ? 'YES' : 'NO').padEnd(5);
      const key = (row.Key || '').padEnd(4);
      console.log(`${field}${type}${null_}${key}`);
    });

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('字段已存在，跳过');
    } else {
      console.error('错误:', error.message);
    }
  } finally {
    await connection.end();
  }
}

addCustomerFields();
