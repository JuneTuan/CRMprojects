import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login/index.vue'),
  },
  {
    path: '/',
    component: () => import('@/components/Layout/index.vue'),
    redirect: '/customer',
    children: [
      {
        path: '/customer',
        name: 'Customer',
        component: () => import('@/pages/Customer/index.vue'),
        meta: { title: '客户管理' },
      },
      {
        path: '/product',
        name: 'Product',
        component: () => import('@/pages/Product/index.vue'),
        meta: { title: '产品管理' },
      },
      {
        path: '/category',
        name: 'Category',
        component: () => import('@/pages/Category/index.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/pages/Order/index.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: '/coupon',
        name: 'Coupon',
        component: () => import('@/pages/Coupon/index.vue'),
        meta: { title: '优惠券管理' },
      },
      {
        path: '/lottery',
        name: 'Lottery',
        component: () => import('@/pages/Lottery/index.vue'),
        meta: { title: '抽奖管理' },
      },
      {
          path: '/activity',
          name: 'Activity',
          component: () => import('@/pages/Activity/index.vue'),
          meta: { title: '活动管理' },
        },
        {
          path: '/statistics',
          name: 'Statistics',
          component: () => import('@/pages/Statistics/index.vue'),
          meta: { title: '数据统计' },
        },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/pages/User/index.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: '/role',
        name: 'Role',
        component: () => import('@/pages/Role/index.vue'),
        meta: { title: '角色管理' },
      },
      {
        path: '/member-level',
        name: 'MemberLevel',
        component: () => import('@/pages/MemberLevel/index.vue'),
        meta: { title: '会员等级管理' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/customer');
  } else {
    next();
  }
});

export default router;
