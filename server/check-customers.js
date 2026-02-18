const { createConnection } = require('typeorm');

async function checkCustomers() {
  const connection = await createConnection({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'Password01',
    database: 'crm_system',
    synchronize: false,
  });

  try {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const customers = await queryRunner.query(`
      SELECT customer_id, customer_code, customer_name, member_level_id, total_consumption
      FROM customer
      WHERE is_active = 1
      LIMIT 5
    `);

    console.log('=== 客户列表 ===');
    console.log(JSON.stringify(customers, null, 2));

    await queryRunner.release();
  } finally {
    await connection.close();
  }
}

checkCustomers().catch(console.error);