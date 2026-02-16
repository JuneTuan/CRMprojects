const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testH5() {
  console.log('=== 开始测试 H5 功能 ===\n');

  let authToken = '';
  let customerId = null;
  let testUsername = '';
  let testPassword = 'test123456';

  try {
    console.log('1. 测试H5用户注册...');
    try {
      const timestamp = Date.now();
      testUsername = `testuser_${timestamp}`;
      const registerResponse = await axios.post(`${BASE_URL}/h5/auth/register`, {
        username: testUsername,
        password: testPassword,
        phone: `138${timestamp.toString().slice(-8)}`,
        name: '测试用户',
        email: `test${timestamp}@example.com`,
        roleId: 2
      });
      console.log('✓ H5用户注册成功');
      console.log('注册用户信息:', JSON.stringify(registerResponse.data, null, 2));
      authToken = registerResponse.data.access_token;
      customerId = registerResponse.data.customerId;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ 用户已存在，跳过注册');
      } else {
        throw error;
      }
    }
    console.log();

    console.log('2. 测试H5用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/h5/auth/login`, {
      username: testUsername,
      password: testPassword
    });
    authToken = loginResponse.data.access_token;
    customerId = loginResponse.data.customerId;
    console.log('✓ H5用户登录成功');
    console.log('用户ID:', customerId);
    console.log();

    console.log('3. 测试获取客户信息...');
    const customerInfoResponse = await axios.get(`${BASE_URL}/h5/customer/info`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取客户信息成功');
    console.log('客户信息:', JSON.stringify(customerInfoResponse.data, null, 2));
    console.log();

    console.log('4. 测试获取客户资料...');
    const profileResponse = await axios.get(`${BASE_URL}/h5/customer/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取客户资料成功');
    console.log('客户资料:', JSON.stringify(profileResponse.data, null, 2));
    console.log();

    console.log('5. 测试获取积分历史...');
    const pointsHistoryResponse = await axios.get(`${BASE_URL}/h5/customer/points-history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取积分历史成功');
    console.log('积分历史记录数:', pointsHistoryResponse.data.data?.length || 0);
    console.log();

    console.log('6. 测试获取订单列表...');
    const ordersResponse = await axios.get(`${BASE_URL}/h5/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取订单列表成功');
    console.log('订单数量:', ordersResponse.data.data?.length || 0);
    console.log();

    console.log('7. 测试获取优惠券列表...');
    const couponsResponse = await axios.get(`${BASE_URL}/h5/coupons`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取优惠券列表成功');
    console.log('优惠券数量:', couponsResponse.data.data?.length || 0);
    console.log();

    console.log('8. 测试获取活动列表...');
    const activitiesResponse = await axios.get(`${BASE_URL}/h5/activities`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取活动列表成功');
    console.log('活动数量:', activitiesResponse.data.data?.length || 0);
    console.log();

    console.log('9. 测试获取抽奖记录...');
    const recordsResponse = await axios.get(`${BASE_URL}/h5/lottery/records`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取抽奖记录成功');
    console.log('抽奖记录数量:', recordsResponse.data.data?.length || 0);
    console.log();

    console.log('=== H5 功能测试完成 ===');
    console.log('所有核心功能正常运行！');

  } catch (error) {
    console.error('✗ 测试失败:', error.response?.data || error.message);
    console.error('错误详情:', error.response?.config?.url);
    process.exit(1);
  }
}

testH5();