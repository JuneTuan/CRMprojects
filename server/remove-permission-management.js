const mysql = require('mysql2/promise');

async function removePermissionManagement() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password01',
    database: 'crm_system'
  });

  try {
    console.log('=== 删除授权管理权限 ===\n');

    console.log('1. 查找授权管理权限:');
    const [permissions] = await connection.query(
      "SELECT * FROM permission WHERE permission_name = '授权管理' OR code = 'permission:manage'"
    );
    console.log('找到的权限:', permissions);
    console.log('');

    if (permissions.length > 0) {
      console.log('2. 删除角色权限关联:');
      for (const perm of permissions) {
        const [deleteResult] = await connection.query(
          'DELETE FROM role_permission WHERE permission_id = ?',
          [perm.permission_id]
        );
        console.log(`删除权限ID ${perm.permission_id} 的关联: ${deleteResult.affectedRows} 条`);
      }
      console.log('');

      console.log('3. 删除权限记录:');
      for (const perm of permissions) {
        const [deleteResult] = await connection.query(
          'DELETE FROM permission WHERE permission_id = ?',
          [perm.permission_id]
        );
        console.log(`删除权限ID ${perm.permission_id}: ${deleteResult.affectedRows} 条`);
      }
      console.log('');
    } else {
      console.log('没有找到授权管理权限');
    }

    console.log('4. 验证删除结果:');
    const [remaining] = await connection.query(
      "SELECT * FROM permission WHERE permission_name = '授权管理' OR code = 'permission:manage'"
    );
    console.log('剩余的授权管理权限:', remaining);
    console.log('');

    console.log('5. 查看当前所有权限:');
    const [allPermissions] = await connection.query(
      'SELECT permission_id, permission_name, code FROM permission WHERE deleted_at IS NULL ORDER BY permission_id'
    );
    console.log('当前权限列表:');
    allPermissions.forEach(p => {
      console.log(`  ${p.permission_id}. ${p.permission_name} (${p.code})`);
    });

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

removePermissionManagement();
