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

    console.log('1. 检查现有优惠券数据...');
    const [coupons] = await connection.query(`
      SELECT coupon_id, coupon_name, type FROM coupon
    `);
    
    console.log('现有优惠券数量:', coupons.length);
    coupons.forEach(c => {
      console.log(`  ID: ${c.coupon_id}, 名称: ${c.coupon_name}, 类型: ${c.type}`);
    });

    console.log('\n2. 删除现有优惠券数据...');
    const [deleteCouponResult] = await connection.query(`
      DELETE FROM customer_coupon
    `);
    console.log(`✅ 删除了 ${deleteCouponResult.affectedRows} 条客户优惠券记录`);

    const [deleteCouponResult2] = await connection.query(`
      DELETE FROM coupon
    `);
    console.log(`✅ 删除了 ${deleteCouponResult2.affectedRows} 条优惠券记录`);

    console.log('\n3. 修改coupon表的type字段...');
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