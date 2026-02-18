const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('为活动7的刮刮乐游戏添加奖品...');
    
    const [prizes] = await connection.query('SELECT * FROM prize WHERE deleted_at IS NULL LIMIT 5');
    console.log('可用的奖品:', prizes.map(p => ({ prize_id: p.prize_id, prize_name: p.prize_name, type: p.type })));
    
    const activityGameId = 20;
    
    for (let i = 0; i < prizes.length; i++) {
      const prize = prizes[i];
      const [result] = await connection.query(
        'INSERT INTO game_prize (activity_game_id, prize_id, probability) VALUES (?, ?, ?)',
        [activityGameId, prize.prize_id, 20]
      );
      console.log(`添加奖品${i + 1}: ${prize.prize_name}, ID: ${result.insertId}`);
    }
    
    console.log('成功添加所有奖品！');
    
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    await connection.end();
  }
})();
