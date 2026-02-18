const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('为活动7添加刮刮乐游戏类型...');
    
    const [result] = await connection.query(
      'INSERT INTO activity_game (activity_id, game_type_id, config, is_active) VALUES (?, ?, ?, ?)',
      [7, 8, JSON.stringify({ costPoints: 0, maxDrawCount: 5 }), 1]
    );
    
    console.log('成功添加活动游戏:', result.insertId);
    
    const [activityGames] = await connection.query('SELECT * FROM activity_game WHERE activity_id = 7');
    console.log('活动7的游戏类型:', JSON.stringify(activityGames, null, 2));
    
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    await connection.end();
  }
})();
