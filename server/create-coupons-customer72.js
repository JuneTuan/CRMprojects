const mysql = require('mysql2/promise');

async function createCouponsForCustomer72() {
  console.log('=== 为客户72的中奖记录创建优惠券 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 查找客户72的中奖记录（奖品类型为券）...');
    const [lotteryRecords] = await connection.query(`
      SELECT 
        lr.lottery_record_id,
        lr.customer_id,
        lr.prize_id,
        lr.prize_name,
        lr.draw_time,
        p.type as prize_type,
        p.value as prize_value
      FROM lottery_record lr
      LEFT JOIN prize p ON lr.prize_id = p.prize_id
      WHERE lr.customer_id = 72
        AND lr.prize_id IS NOT NULL
        AND p.type = '券'
      ORDER BY lr.draw_time DESC
    `);
    
    console.log('找到中奖记录数量:', lotteryRecords.length);

    if (lotteryRecords.length > 0) {
      for (const record of lotteryRecords) {
        console.log(`\n处理记录ID: ${record.lottery_record_id}`);
        console.log(`  奖品名称: ${record.prize_name}`);
        console.log(`  奖品值: ${record.prize_value}`);

        const couponCode = `CPN${Date.now()}`;
        const startTime = new Date();
        const endTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        console.log('  创建优惠券...');
        const [couponResult] = await connection.query(`
          INSERT INTO coupon (
            coupon_code,
            coupon_name,
            value,
            start_time,
            end_time,
            total_quantity,
            remaining_quantity,
            max_uses_per_user,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          couponCode,
          record.prize_name,
          record.prize_value,
          startTime,
          endTime,
          1,
          1,
          1,
          '进行中'
        ]);

        const couponId = couponResult.insertId;
        console.log(`  优惠券ID: ${couponId}`);

        console.log('  创建客户优惠券关联...');
        await connection.query(`
          INSERT INTO customer_coupon (
            customer_id,
            coupon_id,
            status,
            received_at
          ) VALUES (?, ?, ?, ?)
        `, [
          record.customer_id,
          couponId,
          '未使用',
          record.draw_time
        ]);

        console.log('  ✅ 创建成功！');
      }
    } else {
      console.log('没有需要创建优惠券的中奖记录');
    }

    console.log('\n2. 验证客户72的优惠券...');
    const [customerCoupons] = await connection.query(`
      SELECT 
        cc.customer_coupon_id,
        cc.customer_id,
        cc.coupon_id,
        cc.status,
        cc.received_at,
        c.coupon_code,
        c.coupon_name,
        c.value
      FROM customer_coupon cc
      LEFT JOIN coupon c ON cc.coupon_id = c.coupon_id
      WHERE cc.customer_id = 72
      ORDER BY cc.received_at DESC
    `);
    
    console.log('客户72的优惠券数量:', customerCoupons.length);
    if (customerCoupons.length > 0) {
      customerCoupons.forEach(cc => {
        console.log(`\n客户优惠券ID: ${cc.customer_coupon_id}`);
        console.log(`  券码: ${cc.coupon_code}`);
        console.log(`  券名: ${cc.coupon_name}`);
        console.log(`  值: ${cc.value}`);
        console.log(`  状态: ${cc.status}`);
        console.log(`  领取时间: ${cc.received_at}`);
      });
    }

    await connection.end();
    console.log('\n✅ 处理完成！');

  } catch (error) {
    console.error('❌ 处理失败！');
    console.error('错误:', error.message);
  }
}

createCouponsForCustomer72();