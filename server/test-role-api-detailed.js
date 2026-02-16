const axios = require('axios');

async function testRoleCreationDetailed() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    console.log('=== 详细测试角色创建API ===\n');

    console.log('1. 登录获取token:');
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginResponse.data.access_token;
    console.log('登录成功');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('');

    console.log('2. 测试创建角色 - 最小数据:');
    const minimalData = {
      roleName: '最小测试角色'
    };
    console.log('请求数据:', JSON.stringify(minimalData, null, 2));
    
    try {
      const response1 = await axios.post(`${baseUrl}/roles`, minimalData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✓ 创建成功:', response1.data);
      console.log('');
      
      await axios.delete(`${baseUrl}/roles/${response1.data.roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✓ 清理完成');
      console.log('');
    } catch (error) {
      console.error('✗ 最小数据创建失败:');
      console.error('状态码:', error.response?.status);
      console.error('错误数据:', JSON.stringify(error.response?.data, null, 2));
      console.log('');
    }

    console.log('3. 测试创建角色 - 完整数据:');
    const fullData = {
      roleName: '完整测试角色',
      description: '这是一个包含描述的完整测试角色'
    };
    console.log('请求数据:', JSON.stringify(fullData, null, 2));
    
    try {
      const response2 = await axios.post(`${baseUrl}/roles`, fullData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✓ 创建成功:', response2.data);
      console.log('');
      
      await axios.delete(`${baseUrl}/roles/${response2.data.roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✓ 清理完成');
      console.log('');
    } catch (error) {
      console.error('✗ 完整数据创建失败:');
      console.error('状态码:', error.response?.status);
      console.error('错误数据:', JSON.stringify(error.response?.data, null, 2));
      console.log('');
    }

    console.log('4. 测试获取角色列表:');
    try {
      const listResponse = await axios.get(`${baseUrl}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✓ 获取成功，角色数量:', listResponse.data.length);
      console.log('');
    } catch (error) {
      console.error('✗ 获取列表失败:');
      console.error('错误:', error.message);
    }

  } catch (error) {
    console.error('致命错误:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('无响应，服务器可能未启动');
      console.error('错误信息:', error.message);
    } else {
      console.error('请求错误:', error.message);
    }
  }
}

testRoleCreationDetailed();
