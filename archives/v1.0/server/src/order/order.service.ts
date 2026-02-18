// server/src/order/order.service.ts
import { Injectable } from '@nestjs/common';
import { OrderStorage } from '../storage/order-storage';
import { ProductStorage } from '../storage/product-storage';
import { CustomerStorage } from '../storage/customer-storage';

@Injectable()
export class OrderService {
  async findAll() {
    return OrderStorage.findAll();
  }

  async findOne(id: string) {
    return OrderStorage.findById(id);
  }

  async findByCustomerId(customerId: string) {
    return OrderStorage.findByCustomerId(customerId);
  }

  async create(createOrderDto: any) {
    // 验证产品库存
    const product = ProductStorage.findById(createOrderDto.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < createOrderDto.quantity) {
      throw new Error('Insufficient stock');
    }

    // 计算总价
    const totalPrice = product.price * createOrderDto.quantity;

    // 创建订单
    const order = OrderStorage.create({
      customerId: createOrderDto.customerId,
      productId: createOrderDto.productId,
      quantity: createOrderDto.quantity,
      totalPrice: totalPrice,
      status: 'completed'
    });

    // 更新产品库存
    ProductStorage.updateStock(createOrderDto.productId, product.stock - createOrderDto.quantity);

    // 为顾客增加积分
    CustomerStorage.addPoints(createOrderDto.customerId, Math.floor(totalPrice));

    return order;
  }

  async update(id: string, updateOrderDto: any) {
    return OrderStorage.update(id, updateOrderDto);
  }

  // 别名方法以匹配控制器期望的接口
  async getOrders(query: any) {
    return this.findAll();
  }

  async getOrderById(id: string) {
    return this.findOne(id);
  }

  async createOrder(body: any) {
    return this.create(body);
  }
}