#!/usr/bin/env node

/**
 * 前端CRUD操作测试脚本
 * 用于验证前端是否能正确调用API对数据库进行CRUD操作
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
let authToken = '';

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API请求失败:', error.response?.data || error.message);
    throw error;
  }
);

// 测试结果记录
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// 测试函数
const runTest = async (name, testFn) => {
  console.log(`\n🧪 测试: ${name}`);
  try {
    await testFn();
    console.log(`✅ 通过: ${name}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`❌ 失败: ${name}`);
    console.log(`   错误: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
  }
};

// 测试认证
const testAuth = async () => {
  await runTest('登录认证', async () => {
    const response = await request.post('/auth/login', {
      username: 'admin',
      password: 'admin123',
    });
    authToken = response.access_token;
    if (!authToken) {
      throw new Error('登录失败，未获取到token');
    }
    // 设置认证头
    request.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });
};

// 测试产品CRUD
const testProductCRUD = async () => {
  let productId = null;

  await runTest('获取产品列表', async () => {
    const products = await request.get('/products');
    if (!Array.isArray(products)) {
      throw new Error('获取产品列表失败');
    }
    console.log(`   产品数量: ${products.length}`);
  });

  await runTest('创建产品', async () => {
    const newProduct = await request.post('/products', {
      name: '测试产品',
      description: '测试产品描述',
      price: 199.99,
      stock: 100,
      categoryId: null,
      status: '上架',
    });
    if (!newProduct.id) {
      throw new Error('创建产品失败');
    }
    productId = newProduct.id;
    console.log(`   产品ID: ${productId}`);
  });

  await runTest('更新产品', async () => {
    if (!productId) throw new Error('产品ID不存在');
    const updatedProduct = await request.put(`/products/${productId}`, {
      name: '更新后的测试产品',
      price: 299.99,
    });
    if (updatedProduct.name !== '更新后的测试产品') {
      throw new Error('更新产品失败');
    }
  });

  await runTest('删除产品', async () => {
    if (!productId) throw new Error('产品ID不存在');
    await request.delete(`/products/${productId}`);
  });
};

// 测试客户CRUD
const testCustomerCRUD = async () => {
  let customerId = null;

  await runTest('获取客户列表', async () => {
    const customers = await request.get('/customers');
    if (!Array.isArray(customers)) {
      throw new Error('获取客户列表失败');
    }
    console.log(`   客户数量: ${customers.length}`);
  });

  await runTest('创建客户', async () => {
    const username = `test_${Date.now()}`;
    const newCustomer = await request.post('/customers', {
      username: username,
      password: '123456',
      name: '测试客户',
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      email: `test_${Date.now()}@example.com`,
      points: 0,
    });
    if (!newCustomer.id) {
      throw new Error('创建客户失败');
    }
    customerId = newCustomer.id;
    console.log(`   客户ID: ${customerId}`);
  });

  await runTest('更新客户', async () => {
    if (!customerId) throw new Error('客户ID不存在');
    const updatedCustomer = await request.put(`/customers/${customerId}`, {
      name: '更新后的测试客户',
    });
    if (updatedCustomer.name !== '更新后的测试客户') {
      throw new Error('更新客户失败');
    }
  });

  await runTest('删除客户', async () => {
    if (!customerId) throw new Error('客户ID不存在');
    await request.delete(`/customers/${customerId}`);
  });
};

// 测试订单CRUD
const testOrderCRUD = async () => {
  let orderId = null;

  await runTest('获取订单列表', async () => {
    const response = await request.get('/orders');
    // 检查响应格式，支持新的分页格式和旧的数组格式
    const orders = Array.isArray(response) ? response : (response.data || []);
    if (!Array.isArray(orders)) {
      throw new Error('获取订单列表失败');
    }
    console.log(`   订单数量: ${orders.length}`);
  });

  await runTest('创建订单', async () => {
    // 获取产品和客户数据
    const [products, customers] = await Promise.all([
      request.get('/products'),
      request.get('/customers'),
    ]);

    if (products.length === 0 || customers.length === 0) {
      throw new Error('没有可用的产品或客户数据');
    }

    const product = products[0];
    const quantity = 2;
    const totalAmount = Number(product.price) * quantity;

    const newOrder = await request.post('/orders', {
      orderNo: `ORD${Date.now()}`,
      customerId: customers[0].id,
      totalAmount: totalAmount,
      actualAmount: totalAmount,
      shippingAddress: '测试地址',
      orderItems: [{
        productId: product.id,
        quantity: quantity,
        unitPrice: Number(product.price),
      }],
    });
    if (!newOrder.id) {
      throw new Error('创建订单失败');
    }
    orderId = newOrder.id;
    console.log(`   订单ID: ${orderId}`);
  });

  await runTest('更新订单状态', async () => {
    if (!orderId) throw new Error('订单ID不存在');
    const updatedOrder = await request.put(`/orders/${orderId}`, {
      status: '已完成',
    });
    if (updatedOrder.status !== '已完成') {
      throw new Error('更新订单状态失败');
    }
  });

  await runTest('删除订单', async () => {
    if (!orderId) throw new Error('订单ID不存在');
    await request.delete(`/orders/${orderId}`);
  });
};

// 测试优惠券CRUD
const testCouponCRUD = async () => {
  let couponId = null;

  await runTest('获取优惠券列表', async () => {
    const coupons = await request.get('/coupons');
    if (!Array.isArray(coupons)) {
      throw new Error('获取优惠券列表失败');
    }
    console.log(`   优惠券数量: ${coupons.length}`);
  });

  await runTest('创建优惠券', async () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const newCoupon = await request.post('/coupons', {
      code: `CPN${Date.now().toString().slice(-6)}`,
      name: '测试优惠券',
      type: '满减',
      value: 50,
      minAmount: 200,
      startTime: now.toISOString(),
      endTime: endDate.toISOString(),
      totalQuantity: 100,
      remainingQuantity: 100,
      status: '进行中',
    });
    if (!newCoupon.id) {
      throw new Error('创建优惠券失败');
    }
    couponId = newCoupon.id;
    console.log(`   优惠券ID: ${couponId}`);
  });

  await runTest('更新优惠券', async () => {
    if (!couponId) throw new Error('优惠券ID不存在');
    const updatedCoupon = await request.put(`/coupons/${couponId}`, {
      name: '更新后的测试优惠券',
      status: '进行中',
    });
    if (updatedCoupon.name !== '更新后的测试优惠券') {
      throw new Error('更新优惠券失败');
    }
  });

  await runTest('删除优惠券', async () => {
    if (!couponId) throw new Error('优惠券ID不存在');
    await request.delete(`/coupons/${couponId}`);
  });
};

// 运行所有测试
const runAllTests = async () => {
  console.log('🚀 开始前端CRUD操作测试');
  console.log(`📡 API基础URL: ${API_BASE_URL}`);
  console.log('=====================================');

  try {
    // 测试认证
    await testAuth();

    // 测试产品CRUD
    await testProductCRUD();

    // 测试客户CRUD
    await testCustomerCRUD();

    // 测试订单CRUD
    await testOrderCRUD();

    // 测试优惠券CRUD
    await testCouponCRUD();

  } catch (error) {
    console.log(`\n🔴 测试执行失败: ${error.message}`);
  } finally {
    // 输出测试结果
    console.log('\n=====================================');
    console.log('📊 测试结果汇总');
    console.log(`✅ 通过: ${testResults.passed}`);
    console.log(`❌ 失败: ${testResults.failed}`);
    console.log(`📋 总测试数: ${testResults.tests.length}`);

    if (testResults.failed > 0) {
      console.log('\n❌ 失败的测试:');
      testResults.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`   - ${test.name}`);
          if (test.error) {
            console.log(`     错误: ${test.error}`);
          }
        });
    }

    console.log('\n🎯 测试完成');
    if (testResults.failed === 0) {
      console.log('✅ 所有测试通过！前端CRUD操作正常。');
    } else {
      console.log('❌ 部分测试失败，需要检查前端API调用。');
    }
  }
};

// 运行测试
runAllTests();
