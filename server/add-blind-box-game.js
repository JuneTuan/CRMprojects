const mysql = require('mysql2/promise');

async function addBlindBoxGameType() {
  console.log('=== 添加盲盒游戏类型 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 添加盲盒游戏类型...');
    const [insertResult] = await connection.query(`
      INSERT INTO game_type (game_type_name, type, icon, description, is_active)
      VALUES ('盲盒', 'blind-box', '🎁', '盲盒抽奖游戏', 1)
    `);
    
    console.log(`✅ 添加游戏类型成功，ID: ${insertResult.insertId}`);

    console.log('\n2. 为活动4添加盲盒游戏关联...');
    const [activityGameResult] = await connection.query(`
      INSERT INTO activity_game (activity_id, game_type_id, is_active, config)
      VALUES (4, ?, 1, '{"costPoints": 0, "maxDrawCount": 3}')
    `, [insertResult.insertId]);
    
    console.log(`✅ 添加活动游戏关联成功，ID: ${activityGameResult.insertId}`);

    console.log('\n3. 为盲盒游戏添加奖品...');
    const prizes = [
      { prizeId: 22, probability: 25 },
      { prizeId: 17, probability: 15 },
      { prizeId: 18, probability: 15 },
      { prizeId: 19, probability: 15 },
      { prizeId: 20, probability: 15 },
      { prizeId: 21, probability: 15 }
    ];

    for (const prize of prizes) {
      await connection.query(`
        INSERT INTO game_prize (activity_game_id, prize_id, probability)
        VALUES (?, ?, ?)
      `, [activityGameResult.insertId, prize.prizeId, prize.probability]);
    }
    
    console.log(`✅ 添加了 ${prizes.length} 个奖品`);

    await connection.end();
    console.log('\n✅ 盲盒游戏类型添加完成！');

  } catch (error) {
    console.error('❌ 添加失败！');
    console.error('错误:', error.message);
  }
}

addBlindBoxGameType();