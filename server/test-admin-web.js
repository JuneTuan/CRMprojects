const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAdminWeb() {
  console.log('=== 开始测试 Admin-Web 功能 ===\n');

  let authToken = '';

  try {
    console.log('1. 测试健康检查...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✓ 健康检查通过:', healthResponse.data);
    console.log();

    console.log('2. 测试管理员登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.access_token;
    console.log('✓ 管理员登录成功');
    console.log();

    console.log('3. 测试获取客户列表...');
    const customersResponse = await axios.get(`${BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ 获取客户列表成功，共 ${customersResponse.data.data?.length || 0} 个客户`);
    console.log();

    console.log('4. 测试获取订单列表...');
    const ordersResponse = await axios.get(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ 获取订单列表成功，共 ${ordersResponse.data.data?.length || 0} 个订单`);
    console.log();

    console.log('5. 测试获取优惠券列表...');
    const couponsResponse = await axios.get(`${BASE_URL}/coupons`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ 获取优惠券列表成功，共 ${couponsResponse.data.data?.length || 0} 个优惠券`);
    console.log();

    console.log('6. 测试获取产品列表...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ 获取产品列表成功，共 ${productsResponse.data.data?.length || 0} 个产品`);
    console.log();

    console.log('7. 测试获取奖品列表...');
    const prizesResponse = await axios.get(`${BASE_URL}/prizes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ 获取奖品列表成功，共 ${prizesResponse.data.data?.length || 0} 个奖品`);
    console.log();

    console.log('8. 测试获取活动列表...');
    const activitiesResponse = await axios.get(`${BASE_URL}/activities`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ 获取活动列表成功，共 ${activitiesResponse.data.data?.length || 0} 个活动`);
    console.log();

    console.log('9. 测试获取抽奖记录...');
    const lotteryRecordsResponse = await axios.get(`${BASE_URL}/lottery/records`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ 获取抽奖记录成功，共 ${lotteryRecordsResponse.data.data?.length || 0} 条记录`);
    console.log();

    console.log('10. 测试获取统计数据...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ 获取统计数据成功:', statsResponse.data);
    console.log();

    console.log('=== Admin-Web 功能测试完成 ===');
    console.log('所有核心功能正常运行！');

  } catch (error) {
    console.error('✗ 测试失败:', error.response?.data || error.message);
    console.error('错误详情:', error.response?.config?.url);
    process.exit(1);
  }
}

testAdminWeb();