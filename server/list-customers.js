const { createConnection } = require('typeorm');

async function listAllCustomers() {
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
      SELECT customer_id, customer_code, customer_name, is_active, member_level_id
      FROM customer
      ORDER BY customer_id DESC
      LIMIT 10
    `);

    console.log('=== 最近10个客户 ===');
    console.log(JSON.stringify(customers, null, 2));

    await queryRunner.release();
  } finally {
    await connection.close();
  }
}

listAllCustomers().catch(console.error);