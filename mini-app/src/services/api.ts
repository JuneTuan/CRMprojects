const BASE_URL = 'http://localhost:3001/api';

export const request = (options: UniApp.RequestOptions) => {
  const token = uni.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res: any) => {
        console.log('API响应:', res);
        if (res.data && res.data.code === 200) {
          resolve(res.data.data);
        } else {
          const errorMsg = res.data && res.data.msg ? res.data.msg : '请求失败';
          console.error('API错误:', errorMsg);
          reject(errorMsg);
        }
      },
      fail: (err) => {
        console.error('网络错误:', err);
        reject('网络连接失败，请检查网络设置');
      }
    });
  });
};

export const api = {
  auth: {
    login: (data: { username: string; password: string }) => 
      request({ url: '/auth/login', method: 'POST', data: { username: data.username, password: data.password } }),
    register: (data: { name: string; username: string; password: string }) => 
      request({ url: '/auth/register', method: 'POST', data: { username: data.username, password: data.password, name: data.name, role: 'customer' } }),
    logout: () => 
      request({ url: '/auth/logout', method: 'POST' }),
    getProfile: () => 
      request({ url: '/auth/profile', method: 'GET' }),
    updateProfile: (data: any) => 
      request({ url: '/auth/profile', method: 'PUT', data })
  },
  activity: {
    getActive: () => 
      request({ url: '/activity/active', method: 'GET' }),
    getGames: () => 
      request({ url: '/activity/game-types', method: 'GET' })
  },
  lottery: {
    getInfo: (customerId: string) => 
      request({ url: `/lottery/count?customerId=${customerId}`, method: 'GET' }),
    draw: (customerId: string) => 
      request({ url: '/lottery/draw', method: 'POST', data: { customerId } }),
    getRecords: (customerId: string) => 
      request({ url: `/lottery/records?customerId=${customerId}`, method: 'GET' })
  },
  coupon: {
    getMyCoupons: () => 
      request({ url: '/coupon', method: 'GET' }),
    getCouponDetail: (id: string) => 
      request({ url: `/coupon/${id}`, method: 'GET' })
  },
  points: {
    getBalance: () => 
      request({ url: '/points-history', method: 'GET' }),
    getHistory: () => 
      request({ url: '/points-history', method: 'GET' })
  },
  order: {
    getMyOrders: () => 
      request({ url: '/order', method: 'GET' }),
    getOrderDetail: (id: string) => 
      request({ url: `/order/${id}`, method: 'GET' })
  }
};
