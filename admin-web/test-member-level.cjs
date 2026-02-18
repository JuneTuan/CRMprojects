const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testMemberLevel() {
  console.log('=== 测试会员等级API ===\n');

  try {
    const api = axios.create({
      baseURL: API_BASE,
    });

    console.log('1. 登录获取token');
    const loginResponse = await api.post('/auth/login', {
      username: 'admin',
      password: 'admin123',
    });
    const token = loginResponse.data.access_token;
    console.log('登录成功，token:', token.substring(0, 50) + '...');
    console.log('');

    const authenticatedApi = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('2. 获取所有会员等级');
    const levels = await authenticatedApi.get('/member-level');
    console.log('等级列表:', JSON.stringify(levels.data, null, 2));
    console.log('');

    console.log('3. 获取单个等级');
    const level = await authenticatedApi.get(`/member-level/${levels.data[0].levelId}`);
    console.log('等级详情:', JSON.stringify(level.data, null, 2));
    console.log('');

    console.log('4. 测试创建新等级（预期失败，因为level_code重复）');
    try {
      const newLevel = await authenticatedApi.post('/member-level', {
        levelName: '测试等级',
        levelCode: 'normal',
        minConsumption: 500,
        iconUrl: '/uploads/level/test.png',
        benefitsConfig: {
          display_text: '测试权益',
          point_multiplier: 1.0,
          discount_rate: 1.0,
          lottery_times: 0
        },
        sortOrder: 5,
        isActive: true
      });
      console.log('创建结果:', JSON.stringify(newLevel.data, null, 2));
    } catch (error) {
      console.log('创建失败（预期）:', error.response?.data?.message);
    }
    console.log('');

    console.log('5. 测试更新等级');
    try {
      const updateLevel = await authenticatedApi.put(`/member-level/${levels.data[0].levelId}`, {
        levelName: '普通会员（更新）',
        minConsumption: 0
      });
      console.log('更新结果:', JSON.stringify(updateLevel.data, null, 2));
    } catch (error) {
      console.log('更新失败:', error.response?.data?.message);
    }
    console.log('');

    console.log('6. 测试删除等级（预期失败，因为有客户关联）');
    try {
      await authenticatedApi.delete(`/member-level/${levels.data[0].levelId}`);
      console.log('删除成功');
    } catch (error) {
      console.log('删除失败（预期）:', error.response?.data?.message);
    }
    console.log('');

    console.log('7. 测试获取等级权益');
    try {
      const benefit = await authenticatedApi.get(`/member-level/benefit/${levels.data[0].levelId}/point_multiplier`);
      console.log('积分倍数:', benefit.data);
    } catch (error) {
      console.log('获取权益失败:', error.response?.data?.message);
    }
    console.log('');

    console.log('8. 获取等级变更日志');
    const logs = await authenticatedApi.get('/member-level/logs/list?limit=5');
    console.log('变更日志:', JSON.stringify(logs.data, null, 2));
    console.log('');

    console.log('=== 测试完成 ===');

  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

testMemberLevel();
