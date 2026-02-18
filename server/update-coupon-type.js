const mysql = require('mysql2/promise');

async function updateCouponType() {
  console.log('=== 更新优惠券类型字段 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 修改coupon表的type字段...');
    await connection.query(`
      ALTER TABLE coupon 
      MODIFY COLUMN type ENUM('代金券', '实物券') NOT NULL
    `);
    
    console.log('✅ 优惠券类型字段已更新为：代金券、实物券');

    await connection.end();
    console.log('\n✅ 更新完成！');

  } catch (error) {
    console.error('❌ 更新失败！');
    console.error('错误:', error.message);
  }
}

updateCouponType();