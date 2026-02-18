const { createConnection } = require('typeorm');

async function updateIcons() {
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
    console.log('开始更新会员等级图标...');

    const iconMapping = {
      'normal': 'User',
      'silver': 'Medal',
      'gold': 'Trophy',
      'diamond': 'Diamond',
      'ultimate': 'Crown',
    };

    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      for (const [levelCode, iconCode] of Object.entries(iconMapping)) {
        console.log(`更新 ${levelCode} 的图标为 ${iconCode}...`);
        await queryRunner.query(
          `UPDATE member_level SET icon_code = ? WHERE level_code = ?`,
          [iconCode, levelCode]
        );
      }

      await queryRunner.commitTransaction();
      console.log('所有图标更新完成！');
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

updateIcons().catch(console.error);