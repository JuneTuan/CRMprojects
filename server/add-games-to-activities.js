const mysql = require('mysql2/promise');

async function addGamesToActivities() {
  console.log('=== 为活动5和6添加游戏类型 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 获取所有游戏类型...');
    const [gameTypes] = await connection.query(`
      SELECT game_type_id, game_type_name, type
      FROM game_type
      WHERE is_active = 1
      ORDER BY game_type_id
    `);
    
    console.log('游戏类型数量:', gameTypes.length);
    gameTypes.forEach(gt => {
      console.log(`  ${gt.game_type_name} (${gt.type}) - ID: ${gt.game_type_id}`);
    });

    console.log('\n2. 为活动5（春节）添加游戏类型...');
    const activity5Games = [
      { gameTypeId: 6, costPoints: 0, maxDrawCount: 3 },
      { gameTypeId: 7, costPoints: 10, maxDrawCount: 10 },
      { gameTypeId: 8, costPoints: 5, maxDrawCount: 5 },
      { gameTypeId: 9, costPoints: 15, maxDrawCount: 5 }
    ];

    for (const game of activity5Games) {
      const [insertResult] = await connection.query(`
        INSERT INTO activity_game (activity_id, game_type_id, is_active, config)
        VALUES (5, ?, 1, ?)
      `, [game.gameTypeId, JSON.stringify({ costPoints: game.costPoints, maxDrawCount: game.maxDrawCount })]);
      
      console.log(`  ✅ 添加游戏类型ID ${game.gameTypeId}，活动游戏ID: ${insertResult.insertId}`);
      
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
        `, [insertResult.insertId, prize.prizeId, prize.probability]);
      }
      
      console.log(`    ✅ 添加了 ${prizes.length} 个奖品`);
    }

    console.log('\n3. 为活动6（初一）添加游戏类型...');
    const activity6Games = [
      { gameTypeId: 6, costPoints: 0, maxDrawCount: 5 },
      { gameTypeId: 7, costPoints: 20, maxDrawCount: 20 },
      { gameTypeId: 8, costPoints: 10, maxDrawCount: 10 },
      { gameTypeId: 9, costPoints: 25, maxDrawCount: 10 }
    ];

    for (const game of activity6Games) {
      const [insertResult] = await connection.query(`
        INSERT INTO activity_game (activity_id, game_type_id, is_active, config)
        VALUES (6, ?, 1, ?)
      `, [game.gameTypeId, JSON.stringify({ costPoints: game.costPoints, maxDrawCount: game.maxDrawCount })]);
      
      console.log(`  ✅ 添加游戏类型ID ${game.gameTypeId}，活动游戏ID: ${insertResult.insertId}`);
      
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
        `, [insertResult.insertId, prize.prizeId, prize.probability]);
      }
      
      console.log(`    ✅ 添加了 ${prizes.length} 个奖品`);
    }

    await connection.end();
    console.log('\n✅ 游戏类型添加完成！');

  } catch (error) {
    console.error('❌ 添加失败！');
    console.error('错误:', error.message);
  }
}

addGamesToActivities();