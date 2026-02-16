const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testStaffList() {
  try {
    console.log('=== 测试员工列表显示 ===\n');

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✓ 管理员登录成功');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    console.log('\n1. 获取当前员工列表...');
    const listResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('✓ 获取员工列表成功');
    console.log('员工数量:', listResponse.data.length);
    
    if (listResponse.data.length > 0) {
      console.log('\n第一个员工信息:');
      console.log(JSON.stringify(listResponse.data[0], null, 2));
    }

    console.log('\n2. 创建新员工...');
    const newStaff = {
      username: `testuser_${Date.now()}`,
      name: '新测试员工',
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      position: '销售经理',
      password: 'password123'
    };
    const createResponse = await axios.post(`${BASE_URL}/users`, newStaff, { headers });
    console.log('✓ 创建员工成功');
    console.log('新员工ID:', createResponse.data.userId);
    console.log('新员工信息:', JSON.stringify(createResponse.data, null, 2));

    console.log('\n3. 再次获取员工列表...');
    const listResponse2 = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('✓ 获取员工列表成功');
    console.log('员工数量:', listResponse2.data.length);
    
    console.log('\n4. 检查新员工是否在列表中...');
    const newEmployee = listResponse2.data.find((u) => u.userId === createResponse.data.userId);
    if (newEmployee) {
      console.log('✓ 新员工在列表中');
      console.log('新员工信息:', JSON.stringify(newEmployee, null, 2));
    } else {
      console.log('✗ 新员工不在列表中');
    }

    console.log('\n5. 测试编辑员工...');
    const updateData = {
      name: '更新后的员工',
      position: '销售主管'
    };
    await axios.put(`${BASE_URL}/users/${createResponse.data.userId}`, updateData, { headers });
    console.log('✓ 更新员工成功');

    console.log('\n6. 再次获取员工列表验证更新...');
    const listResponse3 = await axios.get(`${BASE_URL}/users`, { headers });
    const updatedEmployee = listResponse3.data.find((u) => u.userId === createResponse.data.userId);
    if (updatedEmployee) {
      console.log('✓ 更新后的员工信息:', JSON.stringify(updatedEmployee, null, 2));
    }

    console.log('\n7. 测试删除员工...');
    await axios.delete(`${BASE_URL}/users/${createResponse.data.userId}`, { headers });
    console.log('✓ 删除员工成功');

    console.log('\n8. 再次获取员工列表验证删除...');
    const listResponse4 = await axios.get(`${BASE_URL}/users`, { headers });
    const deletedEmployee = listResponse4.data.find((u) => u.userId === createResponse.data.userId);
    if (deletedEmployee) {
      console.log('✗ 删除的员工仍在列表中');
    } else {
      console.log('✓ 删除的员工已从列表中移除');
    }

    console.log('\n=== 员工管理功能测试完成 ===');

  } catch (error) {
    console.error('\n✗ 测试失败:', error.response?.data || error.message);
  }
}

testStaffList();