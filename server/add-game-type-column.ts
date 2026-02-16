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
    await connection.query(`ALTER TABLE \`activity\` ADD COLUMN \`game_type\` ENUM('slot-machine', 'blind-box', 'wheel', 'scratch-card', 'nine-grid') NULL AFTER \`activity_name\``);
    console.log('Game type column migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.close();
  }
}

runMigration();