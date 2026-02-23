import request from '@/utils/request.js'

export const authAPI = {
  login: (data) => request({
    url: '/h5/auth/login',
    method: 'POST',
    data
  }),
  
  register: (data) => request({
    url: '/h5/auth/register',
    method: 'POST',
    data
  }),
  
  getProfile: () => request({
    url: '/h5/auth/profile',
    method: 'GET'
  }),

  forgotPassword: (phone) => request({
    url: '/h5/auth/forgot-password',
    method: 'POST',
    data: { phone }
  }),

  resetPassword: (phone, oldPassword, newPassword) => request({
    url: '/h5/auth/reset-password',
    method: 'POST',
    data: { phone, oldPassword, newPassword }
  })
}

export const orderAPI = {
  getOrders: (params) => request({
    url: `/h5/orders`,
    method: 'GET',
    data: params
  }),
  
  getOrderDetail: (id) => request({
    url: `/h5/orders/${id}`,
    method: 'GET'
  })
}

export const couponAPI = {
  getCoupons: () => request({
    url: `/h5/coupons`,
    method: 'GET'
  }),
  
  verifyCoupon: (code) => request({
    url: '/h5/coupons/verify',
    method: 'POST',
    data: { code }
  })
}

export const pointsAPI = {
  getCustomerInfo: () => request({
    url: `/h5/customer/info`,
    method: 'GET'
  }),
  
  getPointsHistory: () => request({
    url: `/h5/customer/points-history`,
    method: 'GET'
  })
}

export const userAPI = {
  getProfile: () => request({
    url: '/h5/customer/profile',
    method: 'GET'
  }),
  
  updateProfile: (data) => request({
    url: `/h5/customer/profile`,
    method: 'PUT',
    data
  })
}

export const lotteryAPI = {
  getActivities: () => request({
    url: '/h5/activities',
    method: 'GET'
  }),
  
  getDrawInfo: (activityId) => request({
    url: `/h5/lottery/draw-info/${activityId}`,
    method: 'GET'
  }),
  
  draw: (activityId, gameTypeId) => request({
    url: '/h5/lottery/draw',
    method: 'POST',
    data: { activityId, gameTypeId }
  }),
  
  getRecords: () => request({
    url: `/h5/lottery/records`,
    method: 'GET'
  }),
  
  claimPrize: (recordId) => request({
    url: `/h5/lottery/records/${recordId}/claim`,
    method: 'PUT'
  })
}