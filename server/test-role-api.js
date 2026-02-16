const axios = require('axios');

async function testRoleCreation() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('=== 测试角色创建API ===\n');

    console.log('1. 登录获取token:');
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginResponse.data.access_token;
    console.log('登录成功，获取到token');
    console.log('');

    console.log('2. 创建角色:');
    const createRoleData = {
      roleName: '测试角色API',
      description: '通过API创建的测试角色'
    };
    console.log('请求数据:', createRoleData);
    
    const createResponse = await axios.post(`${baseUrl}/roles`, createRoleData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('创建成功:', createResponse.data);
    console.log('');

    console.log('3. 获取角色列表验证:');
    const listResponse = await axios.get(`${baseUrl}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('角色列表:', listResponse.data);
    console.log('');

    console.log('4. 清理测试数据:');
    const roleId = createResponse.data.roleId;
    await axios.delete(`${baseUrl}/roles/${roleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('测试数据已清理');

  } catch (error) {
    console.error('错误详情:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('无响应:', error.message);
    } else {
      console.error('请求错误:', error.message);
    }
  }
}

testRoleCreation();
