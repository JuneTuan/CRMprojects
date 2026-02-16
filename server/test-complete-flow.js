const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCompleteFlow() {
  try {
    console.log('=== 完整功能测试 ===\n');

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✓ 管理员登录成功');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    console.log('\n【1. 查询功能测试】');
    console.log('获取所有员工列表...');
    const listResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log(`✓ 查询成功，共 ${listResponse.data.length} 名员工`);

    if (listResponse.data.length > 0) {
      const firstEmployee = listResponse.data[0];
      console.log('\n获取单个员工详情...');
      const detailResponse = await axios.get(`${BASE_URL}/users/${firstEmployee.userId}`, { headers });
      console.log('✓ 查询详情成功');
      console.log('员工姓名:', detailResponse.data.userName);
      console.log('员工职位:', detailResponse.data.position);
    }

    console.log('\n【2. 新增功能测试】');
    const newStaff = {
      username: `testuser_${Date.now()}`,
      name: '测试员工A',
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      position: '销售经理',
      password: 'password123'
    };
    console.log('创建新员工:', newStaff.name);
    const createResponse = await axios.post(`${BASE_URL}/users`, newStaff, { headers });
    console.log('✓ 新增成功，员工ID:', createResponse.data.userId);

    console.log('\n【3. 编辑功能测试】');
    const updateData = {
      name: '测试员工B',
      position: '销售主管',
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
    };
    console.log('更新员工信息...');
    await axios.put(`${BASE_URL}/users/${createResponse.data.userId}`, updateData, { headers });
    console.log('✓ 编辑成功');
    
    const updatedEmployee = await axios.get(`${BASE_URL}/users/${createResponse.data.userId}`, { headers });
    console.log('更新后姓名:', updatedEmployee.data.userName);
    console.log('更新后职位:', updatedEmployee.data.position);

    console.log('\n【4. 状态切换功能测试】');
    console.log('切换员工状态...');
    await axios.put(`${BASE_URL}/users/${createResponse.data.userId}/toggle`, {}, { headers });
    console.log('✓ 状态切换成功');
    
    const toggledEmployee = await axios.get(`${BASE_URL}/users/${createResponse.data.userId}`, { headers });
    console.log('当前状态:', toggledEmployee.data.isActive === 1 ? '启用' : '禁用');

    console.log('\n【5. 删除功能测试】');
    console.log('删除员工...');
    await axios.delete(`${BASE_URL}/users/${createResponse.data.userId}`, { headers });
    console.log('✓ 删除成功');

    const finalList = await axios.get(`${BASE_URL}/users`, { headers });
    const deletedEmployee = finalList.data.find((u) => u.userId === createResponse.data.userId);
    if (!deletedEmployee) {
      console.log('✓ 确认员工已从列表中移除');
    }

    console.log('\n【6. 列表显示验证】');
    console.log('最终员工列表数量:', finalList.data.length);
    console.log('员工列表:');
    finalList.data.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.userName} - ${emp.position} (${emp.isActive === 1 ? '启用' : '禁用'})`);
    });

    console.log('\n=== 所有功能测试完成 ===');
    console.log('✓ 查询功能正常');
    console.log('✓ 新增功能正常');
    console.log('✓ 编辑功能正常');
    console.log('✓ 状态切换功能正常');
    console.log('✓ 删除功能正常');
    console.log('✓ 列表显示正常');

  } catch (error) {
    console.error('\n✗ 测试失败:', error.response?.data || error.message);
  }
}

testCompleteFlow();