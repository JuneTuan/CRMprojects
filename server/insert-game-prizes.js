const mysql = require('mysql2/promise');

async function insertGamePrizes() {
  console.log('=== 插入游戏奖品关联数据 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 获取活动游戏关联...');
    const [activityGames] = await connection.query(`
      SELECT ag.*, gt.type 
      FROM activity_game ag 
      JOIN game_type gt ON ag.game_type_id = gt.game_type_id 
      WHERE ag.deleted_at IS NULL
    `);
    console.log('活动游戏关联数量:', activityGames.length);
    console.log();

    console.log('2. 获取可用奖品...');
    const [prizes] = await connection.query('SELECT * FROM prize WHERE deleted_at IS NULL AND status = "可用" AND remaining_quantity > 0');
    console.log('可用奖品数量:', prizes.length);
    console.log();

    console.log('3. 检查现有游戏奖品关联...');
    const [existingGamePrizes] = await connection.query('SELECT * FROM game_prize');
    console.log('现有游戏奖品关联数量:', existingGamePrizes.length);
    console.log();

    if (activityGames.length > 0 && prizes.length > 0) {
      console.log('4. 插入游戏奖品关联...');
      
      for (const activityGame of activityGames) {
        console.log(`\n为活动${activityGame.activity_id} - 游戏${activityGame.game_type_id} (${activityGame.type}) 添加奖品:`);
        
        const selectedPrizes = prizes.slice(0, 6);
        
        for (let i = 0; i < selectedPrizes.length; i++) {
          const prize = selectedPrizes[i];
          const probability = i === selectedPrizes.length - 1 ? 100 - (i * 15) : 15;
          
          await connection.query(`
            INSERT INTO game_prize (activity_game_id, prize_id, probability, created_at)
            VALUES (?, ?, ?, NOW())
          `, [activityGame.activity_game_id, prize.prize_id, probability]);
          
          console.log(`  ✓ ${prize.prize_name} - ${probability}%`);
        }
      }
      
      console.log('\n✓ 插入游戏奖品关联成功');
    } else {
      console.log('❌ 缺少必要数据');
      if (activityGames.length === 0) {
        console.log('  - 没有活动游戏关联');
      }
      if (prizes.length === 0) {
        console.log('  - 没有可用奖品');
      }
    }
    console.log();

    await connection.end();

    console.log('=== 验证结果 ===');
    console.log('✅ 游戏奖品关联数据插入完成！');
    console.log('现在可以进行抽奖了');
    
  } catch (error) {
    console.error('❌ 插入失败！');
    console.error('错误:', error.message);
  }
}

insertGamePrizes();