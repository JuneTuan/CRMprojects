// server/src/storage/init-data.ts
import { CustomerStorage } from './customer-storage';
import { ProductStorage } from './product-storage';
import JsonStorage from './json-storage';

export function initializeSampleData() {
  console.log('Initializing sample JSON data...');
  
  const hashPassword = (password: string): string => {
    return `hash_${Buffer.from(password).toString('base64')}`;
  };
  
  const existingUsers = JsonStorage.readData<any>('users');
  if (existingUsers.length === 0) {
    const defaultUser = {
      id: JsonStorage.generateId(),
      username: 'admin',
      password: hashPassword('123456'),
      name: '管理员',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    JsonStorage.writeData('users', [defaultUser]);
    console.log('Default admin user created');
  }
  
  // 初始化客户数据
  const existingCustomers = CustomerStorage.findAll();
  if (existingCustomers.length === 0) {
    const sampleCustomers = [
      {
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        points: 100
      },
      {
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        points: 200
      },
      {
        name: '王五',
        phone: '13800138003',
        email: 'wangwu@example.com',
        points: 150
      }
    ];

    sampleCustomers.forEach(customer => {
      CustomerStorage.create(customer);
    });
    console.log('Sample customers created');
  }

  // 初始化产品数据
  const existingProducts = ProductStorage.findAll();
  if (existingProducts.length === 0) {
    const sampleProducts = [
      {
        name: 'iPhone 15',
        description: '最新款苹果手机',
        price: 5999,
        stock: 50,
        category: '电子产品'
      },
      {
        name: 'MacBook Pro',
        description: '专业笔记本电脑',
        price: 12999,
        stock: 20,
        category: '电子产品'
      },
      {
        name: 'Nike运动鞋',
        description: '舒适透气运动鞋',
        price: 899,
        stock: 100,
        category: '服装鞋帽'
      }
    ];

    sampleProducts.forEach(product => {
      ProductStorage.create(product);
    });
    console.log('Sample products created');
  }

  console.log('JSON data initialization completed!');
}