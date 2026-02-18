const { createConnection } = require('typeorm');

async function activateNormalLevel() {
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
      await queryRunner.query(`
        UPDATE member_level
        SET is_active = 1
        WHERE level_id = 1
      `);

      await queryRunner.commitTransaction();
      console.log('普通会员已启用！');
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

activateNormalLevel().catch(console.error);