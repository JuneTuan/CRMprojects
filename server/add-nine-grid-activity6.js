const mysql = require('mysql2/promise');

async function addNineGridToActivity6() {
  console.log('=== 为活动6添加九宫格游戏 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 检查九宫格游戏类型ID...');
    const [gameTypes] = await connection.query(`
      SELECT game_type_id, game_type_name, type
      FROM game_type
      WHERE type = 'nine-grid'
    `);
    
    if (gameTypes.length === 0) {
      console.log('九宫格游戏类型不存在');
      await connection.end();
      return;
    }
    
    const nineGridGameTypeId = gameTypes[0].game_type_id;
    console.log('九宫格游戏类型ID:', nineGridGameTypeId);

    console.log('\n2. 检查活动6是否已有九宫格游戏...');
    const [existingGames] = await connection.query(`
      SELECT activity_game_id
      FROM activity_game
      WHERE activity_id = 6 AND game_type_id = ?
    `, [nineGridGameTypeId]);
    
    if (existingGames.length > 0) {
      console.log('活动6已有九宫格游戏，ID:', existingGames[0].activity_game_id);
      
      console.log('\n3. 更新九宫格游戏的奖品...');
      const activityGameId = existingGames[0].activity_game_id;
      
      const [existingPrizes] = await connection.query(`
        SELECT prize_id
        FROM game_prize
        WHERE activity_game_id = ?
      `, [activityGameId]);
      
      if (existingPrizes.length === 0) {
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
          `, [activityGameId, prize.prizeId, prize.probability]);
        }
        
        console.log(`✅ 添加了 ${prizes.length} 个奖品`);
      } else {
        console.log('九宫格游戏已有奖品');
      }
    } else {
      console.log('活动6没有九宫格游戏，正在添加...');
      
      console.log('\n3. 为活动6添加九宫格游戏关联...');
      const [activityGameResult] = await connection.query(`
        INSERT INTO activity_game (activity_id, game_type_id, is_active, config)
        VALUES (6, ?, 1, '{"costPoints": 0, "maxDrawCount": 3}')
      `, [nineGridGameTypeId]);
      
      console.log(`✅ 添加活动游戏关联成功，ID: ${activityGameResult.insertId}`);

      console.log('\n4. 为九宫格游戏添加奖品...');
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
    }

    console.log('\n5. 验证活动6的游戏类型...');
    const [activityGames] = await connection.query(`
      SELECT 
        ag.activity_game_id,
        ag.activity_id,
        ag.game_type_id,
        ag.is_active,
        gt.game_type_name,
        gt.type as game_type_code
      FROM activity_game ag
      LEFT JOIN game_type gt ON ag.game_type_id = gt.game_type_id
      WHERE ag.activity_id = 6
      ORDER BY ag.game_type_id
    `);
    
    console.log('活动6的游戏类型:');
    activityGames.forEach(ag => {
      console.log(`  - ${ag.game_type_name} (${ag.game_type_code})`);
    });

    await connection.end();
    console.log('\n✅ 九宫格游戏添加完成！');

  } catch (error) {
    console.error('❌ 添加失败！');
    console.error('错误:', error.message);
  }
}

addNineGridToActivity6();