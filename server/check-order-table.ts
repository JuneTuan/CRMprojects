import { createConnection } from 'typeorm';

async function checkTable() {
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
    const result = await connection.query('DESCRIBE `order`');
    console.log('Order table structure:');
    console.table(result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.close();
  }
}

checkTable();