const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    const [rows] = await connection.execute('DESCRIBE activity');
    console.log('Activity表结构:');
    console.table(rows);
    
    const hasWinRateConfig = rows.some(row => row.Field === 'win_rate_config');
    console.log('\n是否有win_rate_config字段:', hasWinRateConfig);
    
    if (!hasWinRateConfig) {
      console.log('\n正在添加win_rate_config字段...');
      await connection.execute(`
        ALTER TABLE activity 
        ADD COLUMN win_rate_config JSON NULL 
        COMMENT '中奖率配置，用于游戏活动'
      `);
      console.log('win_rate_config字段添加成功！');
    }
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await connection.end();
  }
}

checkDatabase();