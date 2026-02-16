import { createConnection } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    const sql = readFileSync(join(__dirname, 'drop-probability-from-prize.sql'), 'utf-8');
    await connection.query(sql);
    console.log('Prize probability column drop migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.close();
  }
}

runMigration();