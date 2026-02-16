import { createConnection } from 'typeorm';

async function runMigration() {
  const connection = await createConnection({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'Password01',
    database: 'crm_system',
    charset: 'utf8mb4',
  });

  try {
    await connection.query(`ALTER TABLE \`activity\` MODIFY COLUMN \`activity_type\` ENUM('游戏活动', '积分活动', '优惠券活动', '混合活动') DEFAULT '游戏活动'`);
    console.log('Activity type column migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.close();
  }
}

runMigration();