const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFrontendFlow() {
  try {
    console.log('=== 模拟前端请求流程 ===\n');

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✓ 登录成功，获取token');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    console.log('\n1. 模拟前端获取员工列表...');
    const response = await axios.get(`${BASE_URL}/users`, { headers });
    
    console.log('✓ API请求成功');
    console.log('响应类型:', typeof response.data);
    console.log('是否为数组:', Array.isArray(response.data));
    console.log('数据长度:', response.data.length);
    
    console.log('\n2. 模拟前端数据映射...');
    const tableData = (response.data || []).map((user) => ({
      id: user.userId,
      username: user.username,
      name: user.userName,
      phone: user.phone,
      position: user.position,
      isActive: user.isActive,
    }));
    
    console.log('✓ 数据映射成功');
    console.log('映射后数据长度:', tableData.length);
    
    if (tableData.length > 0) {
      console.log('\n第一个员工数据:');
      console.log('原始数据:', JSON.stringify(response.data[0], null, 2));
      console.log('映射数据:', JSON.stringify(tableData[0], null, 2));
    }

    console.log('\n3. 测试新增员工...');
    const newStaff = {
      username: `frontend_test_${Date.now()}`,
      name: '前端测试员工',
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      position: '销售经理',
      password: 'password123'
    };
    
    const createResponse = await axios.post(`${BASE_URL}/users`, newStaff, { headers });
    console.log('✓ 创建员工成功');
    console.log('新员工ID:', createResponse.data.userId);

    console.log('\n4. 重新获取员工列表...');
    const response2 = await axios.get(`${BASE_URL}/users`, { headers });
    const tableData2 = (response2.data || []).map((user) => ({
      id: user.userId,
      username: user.username,
      name: user.userName,
      phone: user.phone,
      position: user.position,
      isActive: user.isActive,
    }));
    
    console.log('✓ 重新获取成功');
    console.log('员工数量:', tableData2.length);
    
    const newEmployee = tableData2.find((u) => u.id === createResponse.data.userId);
    if (newEmployee) {
      console.log('✓ 新员工在列表中');
      console.log('新员工数据:', JSON.stringify(newEmployee, null, 2));
    } else {
      console.log('✗ 新员工不在列表中');
    }

    console.log('\n=== 前端流程测试完成 ===');

  } catch (error) {
    console.error('\n✗ 测试失败:', error.response?.data || error.message);
  }
}

testFrontendFlow();