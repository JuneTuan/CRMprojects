import request from './index';

// 用户API
const userApi = {
  // 获取用户列表
  list: () => request.get('/users'),
};

export default userApi;