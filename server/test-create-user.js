const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCreateUser() {
  try {
    console.log('=== 测试创建用户 ===\n');

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✓ 登录成功，获取token');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const userData = {
      username: 'testuser_new',
      name: '测试员工',
      phone: '13800138001',
      position: '销售经理',
      password: 'password123'
    };

    console.log('\n创建用户数据:', JSON.stringify(userData, null, 2));

    const response = await axios.post(`${BASE_URL}/users`, userData, { headers });
    console.log('\n✓ 创建用户成功');
    console.log('返回数据:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n✗ 创建用户失败:', error.response?.data || error.message);
  }
}

testCreateUser();