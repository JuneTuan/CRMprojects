const { createConnection } = require('typeorm');

async function checkMemberLevels() {
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

    const levels = await queryRunner.query(`
      SELECT level_id, level_name, level_code, min_consumption, is_active
      FROM member_level
      ORDER BY min_consumption ASC
    `);

    console.log('=== 会员等级列表 ===');
    console.log(JSON.stringify(levels, null, 2));

    await queryRunner.release();
  } finally {
    await connection.close();
  }
}

checkMemberLevels().catch(console.error);