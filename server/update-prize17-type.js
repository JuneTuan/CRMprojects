const mysql = require('mysql2/promise');

async function updatePrize17Type() {
  console.log('=== 更新奖品17的类型 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 更新奖品17的类型为"券"...');
    const [result] = await connection.query(`
      UPDATE prize
      SET type = '券'
      WHERE prize_id = 17
    `);
    
    console.log('更新结果:', result.affectedRows > 0 ? '成功' : '失败');

    console.log('\n2. 验证更新结果...');
    const [prizes] = await connection.query(`
      SELECT 
        prize_id,
        prize_name,
        type,
        value
      FROM prize
      WHERE prize_id = 17
    `);
    
    if (prizes.length > 0) {
      const prize = prizes[0];
      console.log('奖品ID:', prize.prize_id);
      console.log('奖品名称:', prize.prize_name);
      console.log('奖品类型:', prize.type);
      console.log('奖品值:', prize.value);
    }

    await connection.end();
    console.log('\n✅ 更新完成！');

  } catch (error) {
    console.error('❌ 更新失败！');
    console.error('错误:', error.message);
  }
}

updatePrize17Type();