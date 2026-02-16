const mysql = require('mysql2/promise');

async function findAdminUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 查询管理员用户 ===\n');

    const [rows] = await connection.query(`
      SELECT u.user_id, u.username, u.user_name, r.role_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.deleted_at IS NULL
      ORDER BY u.user_id
    `);

    console.log('用户列表:');
    rows.forEach(row => {
      console.log(`ID: ${row.user_id}, 用户名: ${row.username}, 姓名: ${row.user_name}, 角色: ${row.role_name || '无'}`);
    });

    const [adminRows] = await connection.query(`
      SELECT u.user_id, u.username, u.user_name, r.role_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.deleted_at IS NULL
      AND (r.role_name LIKE '%管理员%' OR u.username LIKE '%admin%')
    `);

    if (adminRows.length > 0) {
      console.log('\n找到管理员用户:');
      adminRows.forEach(row => {
        console.log(`ID: ${row.user_id}, 用户名: ${row.username}, 姓名: ${row.user_name}, 角色: ${row.role_name}`);
      });
    } else {
      console.log('\n未找到管理员用户，使用第一个用户作为默认管理员');
      if (rows.length > 0) {
        console.log(`默认管理员ID: ${rows[0].user_id}, 用户名: ${rows[0].username}`);
      }
    }

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

findAdminUser();
