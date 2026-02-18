#!/usr/bin/env node

// 为现有用户创建客户记录的脚本
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// 读取数据文件
function readData(fileName) {
  const filePath = path.join(dataDir, `${fileName}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return [];
  }
}

// 写入数据文件
function writeData(fileName, data) {
  const filePath = path.join(dataDir, `${fileName}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
}

// 生成ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 哈希密码
function hashPassword(password) {
  return `hash_${Buffer.from(password).toString('base64')}`;
}

// 主函数
function main() {
  console.log('开始为现有用户创建客户记录...');
  
  // 读取用户和客户数据
  const users = readData('users');
  const customers = readData('customers');
  
  console.log(`读取到 ${users.length} 个用户，${customers.length} 个客户记录`);
  
  // 提取已有客户的userId
  const existingCustomerUserIds = new Set(customers.map(c => c.userId).filter(Boolean));
  
  // 为没有客户记录的客户用户创建记录
  let createdCount = 0;
  
  for (const user of users) {
    if (user.role === 'customer' && !existingCustomerUserIds.has(user.id)) {
      console.log(`为用户 ${user.username} (${user.name}) 创建客户记录`);
      
      // 创建新客户记录
      const newCustomer = {
        id: generateId(),
        userId: user.id,
        name: user.name,
        phone: '',
        email: '',
        points: 0,
        password: user.password, // 复用用户密码
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      customers.push(newCustomer);
      createdCount++;
    }
  }
  
  if (createdCount > 0) {
    console.log(`共创建了 ${createdCount} 个客户记录`);
    
    // 写入更新后的客户数据
    if (writeData('customers', customers)) {
      console.log('客户记录已成功更新！');
    } else {
      console.error('客户记录更新失败！');
    }
  } else {
    console.log('所有客户用户都已有对应的客户记录，无需创建！');
  }
  
  console.log('任务完成！');
}

// 运行主函数
main();