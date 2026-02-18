import { Injectable } from '@nestjs/common';
import { PointsHistoryStorage, PointsTransaction } from '../storage/points-history-storage';
import { CustomerStorage } from '../storage/customer-storage';

@Injectable()
export class PointsHistoryService {
  async findAll(customerId?: string) {
    if (customerId) {
      return PointsHistoryStorage.findByCustomerId(customerId);
    }
    return PointsHistoryStorage.findAll();
  }

  async findOne(id: string) {
    return PointsHistoryStorage.findById(id);
  }

  async create(createTransactionDto: any) {
    const { customerId, type, amount, description, orderId } = createTransactionDto;

    const customer = CustomerStorage.findById(customerId);
    if (!customer) {
      throw new Error('客户不存在');
    }

    const currentBalance = customer.points;
    let newBalance = currentBalance;

    switch (type) {
      case 'earn':
        newBalance = currentBalance + amount;
        break;
      case 'spend':
        if (currentBalance < amount) {
          throw new Error('积分不足');
        }
        newBalance = currentBalance - amount;
        break;
      case 'refund':
        newBalance = currentBalance + amount;
        break;
      case 'adjust':
        newBalance = amount;
        break;
      default:
        throw new Error('无效的交易类型');
    }

    const transaction = PointsHistoryStorage.create({
      customerId,
      type,
      amount,
      balance: newBalance,
      description,
      orderId
    });

    CustomerStorage.update(customerId, { points: newBalance });

    return transaction;
  }

  async remove(id: string) {
    return PointsHistoryStorage.delete(id);
  }

  async getCustomerBalance(customerId: string) {
    return PointsHistoryStorage.getCustomerBalance(customerId);
  }
}