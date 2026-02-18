const mysql = require('mysql2/promise');

async function addNineGridGameType() {
  console.log('=== 添加九宫格游戏类型 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 检查九宫格游戏类型是否存在...');
    const [existingTypes] = await connection.query(`
      SELECT game_type_id, game_type_name, type
      FROM game_type
      WHERE type = 'nine-grid'
    `);
    
    if (existingTypes.length > 0) {
      console.log('九宫格游戏类型已存在，ID:', existingTypes[0].game_type_id);
      
      console.log('\n2. 检查活动4是否有九宫格游戏...');
      const [activityGames] = await connection.query(`
        SELECT activity_game_id
        FROM activity_game
        WHERE activity_id = 4 AND game_type_id = ?
      `, [existingTypes[0].game_type_id]);
      
      if (activityGames.length > 0) {
        console.log('活动4已有九宫格游戏');
      } else {
        console.log('为活动4添加九宫格游戏...');
        const [activityGameResult] = await connection.query(`
          INSERT INTO activity_game (activity_id, game_type_id, is_active, config)
          VALUES (4, ?, 1, '{"costPoints": 0, "maxDrawCount": 3}')
        `, [existingTypes[0].game_type_id]);
        
        console.log(`✅ 添加活动游戏关联成功，ID: ${activityGameResult.insertId}`);

        console.log('\n3. 为九宫格游戏添加奖品...');
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
    } else {
      console.log('九宫格游戏类型不存在，正在添加...');
      
      console.log('\n2. 添加九宫格游戏类型...');
      const [insertResult] = await connection.query(`
        INSERT INTO game_type (game_type_name, type, icon, description, is_active)
        VALUES ('九宫格', 'nine-grid', '🎯', '九宫格抽奖游戏', 1)
      `);
      
      console.log(`✅ 添加游戏类型成功，ID: ${insertResult.insertId}`);

      console.log('\n3. 为活动4添加九宫格游戏关联...');
      const [activityGameResult] = await connection.query(`
        INSERT INTO activity_game (activity_id, game_type_id, is_active, config)
        VALUES (4, ?, 1, '{"costPoints": 0, "maxDrawCount": 3}')
      `, [insertResult.insertId]);
      
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

    await connection.end();
    console.log('\n✅ 九宫格游戏类型添加完成！');

  } catch (error) {
    console.error('❌ 添加失败！');
    console.error('错误:', error.message);
  }
}

addNineGridGameType();