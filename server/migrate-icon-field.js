const { createConnection } = require('typeorm');

async function migrate() {
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
    console.log('开始迁移会员等级图标字段...');

    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const tableExists = await queryRunner.hasTable('member_level');
      if (tableExists) {
        const columnExists = await queryRunner.hasColumn('member_level', 'icon_url');
        
        if (columnExists) {
          console.log('检测到 icon_url 字段，正在重命名为 icon_code...');
          await queryRunner.renameColumn('member_level', 'icon_url', 'icon_code');
          console.log('字段重命名成功');
        } else {
          console.log('icon_code 字段已存在，无需迁移');
        }
      }

      await queryRunner.commitTransaction();
      console.log('迁移完成！');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('迁移失败:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } finally {
    await connection.close();
  }
}

migrate().catch(console.error);