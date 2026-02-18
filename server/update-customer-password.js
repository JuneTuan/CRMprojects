const { createConnection } = require('typeorm');
const bcrypt = require('bcrypt');

async function updateCustomerPassword() {
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
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash('test123', 10);

      await queryRunner.query(`
        UPDATE customer
        SET password = ?, is_active = 1
        WHERE customer_code = 'CUST_1771427473170'
      `, [hashedPassword]);

      await queryRunner.commitTransaction();
      console.log('客户密码更新成功！');
      console.log('用户名: CUST_1771427473170');
      console.log('密码: test123');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('更新失败:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } finally {
    await connection.close();
  }
}

updateCustomerPassword().catch(console.error);