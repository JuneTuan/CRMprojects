const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Password01',
    database: 'crm_system',
  });

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(
      'INSERT INTO `user` (username, password, user_name, phone, email, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['admin', hashedPassword, '系统管理员', '13800138000', 'admin@example.com', 4, 1]
    );
    
    console.log('Admin用户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
  } catch (error) {
    console.error('创建失败:', error.message);
  } finally {
    await connection.end();
  }
}

createAdminUser();
