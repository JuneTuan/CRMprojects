const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Password01',
    database: 'crm_system',
  });

  try {
    const [users] = await connection.query('SELECT user_id, username, role FROM `user` LIMIT 5');
    console.log('用户列表:', JSON.stringify(users, null, 2));
  } finally {
    await connection.end();
  }
}

checkUsers();
