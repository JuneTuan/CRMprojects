const mysql = require('mysql2/promise');

async function addOwnerIdField() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 添加客户负责人字段 ===\n');

    // 添加owner_id字段
    await connection.execute(`
      ALTER TABLE customer 
      ADD COLUMN owner_id INT COMMENT '负责人ID'
    `);
    console.log('✓ 添加owner_id字段成功');

    // 添加外键约束
    await connection.execute(`
      ALTER TABLE customer 
      ADD CONSTRAINT fk_customer_owner 
      FOREIGN KEY (owner_id) REFERENCES user(user_id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log('✓ 添加外键约束成功');

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
    } else if (error.code === 'ER_FOREIGN_KEY_CONSTRAINT') {
      console.log('外键约束已存在，跳过');
    } else {
      console.error('错误:', error.message);
    }
  } finally {
    await connection.end();
  }
}

addOwnerIdField();
