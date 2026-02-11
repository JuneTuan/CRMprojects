import { Injectable } from '@nestjs/common';
import { orderManager, customerManager } from '../storage/database';

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
    const pointsEarned = Math.floor(amount);

    return orderManager.createOrder({
      ...data,
      amount,
      pointsEarned
    });
  }
}
