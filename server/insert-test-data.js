const mysql = require('mysql2/promise');

async function insertTestData() {
  console.log('=== 插入测试数据 ===\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Password01',
      database: 'crm_system'
    });

    console.log('1. 检查游戏类型...');
    const [gameTypes] = await connection.query('SELECT * FROM game_type WHERE deleted_at IS NULL');
    console.log('现有游戏类型数量:', gameTypes.length);

    if (gameTypes.length === 0) {
      console.log('插入游戏类型数据...');
      await connection.query(`
        INSERT INTO game_type (type, game_type_name, icon, description, is_active, created_at, updated_at)
        VALUES 
        ('wheel', '大转盘', '🎡', '幸运大转盘游戏', 1, NOW(), NOW()),
        ('slot-machine', '老虎机', '🎰', '幸运老虎机游戏', 1, NOW(), NOW()),
        ('scratch-card', '刮刮乐', '🎟', '刮刮乐游戏', 1, NOW(), NOW())
      `);
      console.log('✓ 插入游戏类型成功');
    } else {
      console.log('✓ 游戏类型已存在');
    }
    console.log();

    console.log('2. 检查活动...');
    const [activities] = await connection.query('SELECT * FROM activity WHERE deleted_at IS NULL');
    console.log('现有活动数量:', activities.length);

    if (activities.length > 0) {
      console.log('3. 检查活动游戏关联...');
      const [activityGames] = await connection.query('SELECT * FROM activity_game WHERE deleted_at IS NULL');
      console.log('现有活动游戏关联数量:', activityGames.length);

      if (activityGames.length === 0) {
        console.log('插入活动游戏关联数据...');
        
        const [gameTypes] = await connection.query('SELECT * FROM game_type WHERE deleted_at IS NULL');
        
        for (const activity of activities) {
          if (activity.activity_type === '游戏活动' || !activity.activity_type) {
            for (const gameType of gameTypes) {
              await connection.query(`
                INSERT INTO activity_game (activity_id, game_type_id, config, is_active, created_at, updated_at)
                VALUES (?, ?, ?, 1, NOW(), NOW())
              `, [activity.activity_id, gameType.game_type_id, JSON.stringify({
                costPoints: 10,
                maxDrawCount: 3
              })]);
            }
          }
        }
        console.log('✓ 插入活动游戏关联成功');
      } else {
        console.log('✓ 活动游戏关联已存在');
      }
    } else {
      console.log('❌ 没有活动数据');
      console.log('请先在后台创建活动');
    }
    console.log();

    await connection.end();

    console.log('=== 验证结果 ===');
    console.log('✅ 测试数据插入完成！');
    console.log('现在应该可以在H5页面看到活动和游戏了');
    
  } catch (error) {
    console.error('❌ 插入失败！');
    console.error('错误:', error.message);
  }
}

insertTestData();