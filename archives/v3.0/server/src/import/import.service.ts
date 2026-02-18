import { Injectable, BadRequestException } from '@nestjs/common';
import { CustomerStorage } from '../storage/customer-storage';
import { ProductStorage } from '../storage/product-storage';
import * as xlsx from 'xlsx';

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class ImportService {
  async importCustomers(file: Express.Multer.File): Promise<ImportResult> {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const row of data as any[]) {
        try {
          const customerData = {
            name: row['姓名'] || row['name'] || '',
            phone: row['电话'] || row['phone'] || '',
            email: row['邮箱'] || row['email'] || '',
            points: parseInt(row['积分'] || row['points'] || '0') || 0,
            address: row['地址'] || row['address'] || '',
            password: row['密码'] || row['password'] || ''
          };

          if (!customerData.name) {
            throw new Error('姓名不能为空');
          }

          CustomerStorage.create(customerData);
          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push(`第${result.success + result.failed}行: ${error.message}`);
        }
      }

      return result;
    } catch (error: any) {
      throw new BadRequestException('文件解析失败: ' + error.message);
    }
  }

  async importProducts(file: Express.Multer.File): Promise<ImportResult> {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const row of data as any[]) {
        try {
          const productData = {
            name: row['名称'] || row['name'] || '',
            description: row['描述'] || row['description'] || '',
            price: parseFloat(row['价格'] || row['price'] || '0') || 0,
            stock: parseInt(row['库存'] || row['stock'] || '0') || 0,
            category: row['分类'] || row['category'] || ''
          };

          if (!productData.name) {
            throw new Error('名称不能为空');
          }

          if (productData.price <= 0) {
            throw new Error('价格必须大于0');
          }

          ProductStorage.create(productData);
          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push(`第${result.success + result.failed}行: ${error.message}`);
        }
      }

      return result;
    } catch (error: any) {
      throw new BadRequestException('文件解析失败: ' + error.message);
    }
  }

  getCustomerTemplate(): Buffer {
    const template = [
      {
        '姓名': '张三',
        '电话': '13800138000',
        '邮箱': 'zhangsan@example.com',
        '积分': 100,
        '地址': '北京市朝阳区',
        '密码': '123456'
      },
      {
        '姓名': '李四',
        '电话': '13800138001',
        '邮箱': 'lisi@example.com',
        '积分': 200,
        '地址': '上海市浦东新区',
        '密码': '123456'
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(template);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '客户导入模板');
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  getProductTemplate(): Buffer {
    const template = [
      {
        '名称': 'iPhone 15',
        '描述': '最新款苹果手机',
        '价格': 5999,
        '库存': 50,
        '分类': '电子产品'
      },
      {
        '名称': 'MacBook Pro',
        '描述': '专业笔记本电脑',
        '价格': 12999,
        '库存': 20,
        '分类': '电子产品'
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(template);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '产品导入模板');
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
