const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAdminWebUserManagement() {
  console.log('=== 开始测试 Admin-Web 员工管理功能 ===\n');

  let authToken = '';
  let testUserId = null;

  try {
    console.log('1. 测试管理员登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.access_token;
    console.log('✓ 管理员登录成功');
    console.log();
  } catch (error) {
    console.error('✗ 管理员登录失败:', error.response?.data || error.message);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`
  };

  try {
    console.log('2. 测试获取用户列表...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('✓ 获取用户列表成功');
    console.log('用户数量:', usersResponse.data.length);
    if (usersResponse.data.length > 0) {
      console.log('第一个用户:', JSON.stringify(usersResponse.data[0], null, 2));
    }
    console.log();
  } catch (error) {
    console.error('✗ 获取用户列表失败:', error.response?.data || error.message);
    console.log();
  }

  try {
    console.log('3. 测试创建新用户...');
    const timestamp = Date.now();
    const createResponse = await axios.post(`${BASE_URL}/users`, {
      username: `testuser_${timestamp}`,
      password: 'test123456',
      name: '测试员工',
      phone: `138${timestamp.toString().slice(-8)}`,
      email: `test${timestamp}@example.com`,
      position: '测试职位',
      isActive: true
    }, { headers });
    testUserId = createResponse.data.userId;
    console.log('✓ 创建用户成功');
    console.log('新用户ID:', testUserId);
    console.log('新用户信息:', JSON.stringify(createResponse.data, null, 2));
    console.log();
  } catch (error) {
    console.error('✗ 创建用户失败:', error.response?.data || error.message);
    console.log();
  }

  if (testUserId) {
    try {
      console.log('4. 测试获取单个用户...');
      const userResponse = await axios.get(`${BASE_URL}/users/${testUserId}`, { headers });
      console.log('✓ 获取用户成功');
      console.log('用户信息:', JSON.stringify(userResponse.data, null, 2));
      console.log();
    } catch (error) {
      console.error('✗ 获取用户失败:', error.response?.data || error.message);
      console.log();
    }

    try {
      console.log('5. 测试更新用户...');
      const updateResponse = await axios.put(`${BASE_URL}/users/${testUserId}`, {
        name: '更新后的测试员工',
        position: '更新后的职位'
      }, { headers });
      console.log('✓ 更新用户成功');
      console.log('更新后用户信息:', JSON.stringify(updateResponse.data, null, 2));
      console.log();
    } catch (error) {
      console.error('✗ 更新用户失败:', error.response?.data || error.message);
      console.log();
    }

    try {
      console.log('6. 测试获取所有角色...');
      const rolesResponse = await axios.get(`${BASE_URL}/roles`, { headers });
      console.log('✓ 获取角色列表成功');
      console.log('角色数量:', rolesResponse.data.length);
      if (rolesResponse.data.length > 0) {
        console.log('第一个角色:', JSON.stringify(rolesResponse.data[0], null, 2));
      }
      console.log();
    } catch (error) {
      console.error('✗ 获取角色列表失败:', error.response?.data || error.message);
      console.log();
    }

    try {
      console.log('7. 测试获取所有权限...');
      const permissionsResponse = await axios.get(`${BASE_URL}/permissions`, { headers });
      console.log('✓ 获取权限列表成功');
      console.log('权限数量:', permissionsResponse.data.length);
      if (permissionsResponse.data.length > 0) {
        console.log('第一个权限:', JSON.stringify(permissionsResponse.data[0], null, 2));
      }
      console.log();
    } catch (error) {
      console.error('✗ 获取权限列表失败:', error.response?.data || error.message);
      console.log();
    }

    try {
      console.log('8. 测试删除用户...');
      await axios.delete(`${BASE_URL}/users/${testUserId}`, { headers });
      console.log('✓ 删除用户成功');
      console.log();
    } catch (error) {
      console.error('✗ 删除用户失败:', error.response?.data || error.message);
      console.log();
    }
  }

  console.log('=== Admin-Web 员工管理功能测试完成 ===');
}

testAdminWebUserManagement().catch(console.error);