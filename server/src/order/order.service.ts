import { Injectable } from '@nestjs/common';
import { orderManager, customerManager, pointsRuleManager } from '../storage/database';

@Injectable()
export class OrderService {
  async getOrders(query: any) {
    const { skip, limit, customerId } = query;
    return orderManager.getOrders({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      customerId
    });
  }

  async getOrderById(id: string) {
    return orderManager.getOrderById(id);
  }

  async createOrder(data: any) {
    const customer = await customerManager.getCustomerById(data.customerId);
    if (!customer) {
      throw new Error('客户不存在');
    }

    const amount = parseFloat(data.amount);

    // 使用积分规则计算积分
    let pointsEarned = await pointsRuleManager.calculatePoints(amount);

    // 如果前端传入了pointsEarned（向后兼容）
    if (data.pointsEarned !== undefined) {
      pointsEarned = parseInt(data.pointsEarned);
    }

    // 创建订单
    const order = await orderManager.createOrder({
      ...data,
      amount,
      pointsEarned
    });

    // 更新客户积分
    await customerManager.updateCustomer(data.customerId, {
      points: (customer.points || 0) + pointsEarned
    });

    return order;
  }
}
