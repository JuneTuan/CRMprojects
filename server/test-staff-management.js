const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testStaffManagement() {
  try {
    console.log('=== 开始测试员工管理完整功能 ===\n');

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✓ 管理员登录成功');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    console.log('\n1. 测试获取员工列表...');
    const listResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('✓ 获取员工列表成功');
    console.log('员工数量:', listResponse.data.length);

    console.log('\n2. 测试创建员工...');
    const newStaff = {
      username: `teststaff_${Date.now()}`,
      name: '测试员工',
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      position: '销售经理',
      password: 'password123'
    };
    const createResponse = await axios.post(`${BASE_URL}/users`, newStaff, { headers });
    console.log('✓ 创建员工成功');
    console.log('新员工ID:', createResponse.data.userId);
    const newStaffId = createResponse.data.userId;

    console.log('\n3. 测试获取单个员工...');
    const getResponse = await axios.get(`${BASE_URL}/users/${newStaffId}`, { headers });
    console.log('✓ 获取员工成功');
    console.log('员工姓名:', getResponse.data.userName);
    console.log('员工职位:', getResponse.data.position);

    console.log('\n4. 测试更新员工...');
    const updateData = {
      name: '更新后的员工',
      position: '销售主管',
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
    };
    await axios.put(`${BASE_URL}/users/${newStaffId}`, updateData, { headers });
    console.log('✓ 更新员工成功');

    console.log('\n5. 测试切换员工状态...');
    await axios.put(`${BASE_URL}/users/${newStaffId}/toggle`, {}, { headers });
    console.log('✓ 切换员工状态成功');

    console.log('\n6. 测试删除员工...');
    await axios.delete(`${BASE_URL}/users/${newStaffId}`, { headers });
    console.log('✓ 删除员工成功');

    console.log('\n7. 测试获取角色列表...');
    const rolesResponse = await axios.get(`${BASE_URL}/roles`, { headers });
    console.log('✓ 获取角色列表成功');
    console.log('角色数量:', rolesResponse.data.length);

    console.log('\n8. 测试获取权限列表...');
    const permissionsResponse = await axios.get(`${BASE_URL}/permissions`, { headers });
    console.log('✓ 获取权限列表成功');
    console.log('权限数量:', permissionsResponse.data.length);

    console.log('\n=== 员工管理功能测试完成 ===');
    console.log('所有功能正常运行！');

  } catch (error) {
    console.error('\n✗ 测试失败:', error.response?.data || error.message);
  }
}

testStaffManagement();