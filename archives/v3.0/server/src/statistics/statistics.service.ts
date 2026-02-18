import { Injectable } from '@nestjs/common';
import { OrderStorage } from '../storage/order-storage';
import { CustomerStorage } from '../storage/customer-storage';
import { JsonStorage } from '../storage/json-storage';

@Injectable()
export class StatisticsService {
  private readonly LOTTERY_RECORDS_FILE = 'lotteryRecords';

  async getSalesStatistics(period: 'day' | 'week' | 'month' = 'day') {
    const orders = OrderStorage.findAll();
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });

    const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const orderCount = filteredOrders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    return {
      period,
      totalSales,
      orderCount,
      averageOrderValue,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  }

  async getCustomerStatistics() {
    const customers = CustomerStorage.findAll();
    const users = JsonStorage.readData<any>('users');
    const customerUsers = users.filter(user => user.role === 'customer');

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newCustomersToday = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate >= oneDayAgo && customerDate <= now;
    });

    const newCustomersThisWeek = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate >= oneWeekAgo && customerDate <= now;
    });

    const totalPoints = customers.reduce((sum, customer) => sum + customer.points, 0);
    const averagePoints = customers.length > 0 ? totalPoints / customers.length : 0;

    const pointsDistribution = this.calculatePointsDistribution(customers);

    return {
      totalCustomers: customers.length,
      newCustomersToday: newCustomersToday.length,
      newCustomersThisWeek: newCustomersThisWeek.length,
      totalPoints,
      averagePoints,
      pointsDistribution
    };
  }

  private calculatePointsDistribution(customers: any[]) {
    const ranges = [
      { label: '0-100', min: 0, max: 100 },
      { label: '101-500', min: 101, max: 500 },
      { label: '501-1000', min: 501, max: 1000 },
      { label: '1001-5000', min: 1001, max: 5000 },
      { label: '5000+', min: 5001, max: Infinity }
    ];

    return ranges.map(range => ({
      ...range,
      count: customers.filter(c => c.points >= range.min && c.points <= range.max).length
    }));
  }

  async getLotteryStatistics() {
    const lotteryRecords = JsonStorage.readData<any[]>(this.LOTTERY_RECORDS_FILE) || [];
    const prizes = JsonStorage.readData<any[]>('prizes') || [];

    const totalDraws = lotteryRecords.length;
    const winningRecords = lotteryRecords.filter((record: any) => record.isWon);
    const totalWins = winningRecords.length;
    const winRate = totalDraws > 0 ? (totalWins / totalDraws) * 100 : 0;

    const prizeDistribution = prizes.map((prize: any) => {
      const prizeWins = winningRecords.filter((record: any) => record.prizeId === prize.id).length;
      return {
        prizeId: prize.id,
        prizeName: prize.name,
        wins: prizeWins,
        percentage: totalWins > 0 ? (prizeWins / totalWins) * 100 : 0
      };
    });

    return {
      totalDraws,
      totalWins,
      winRate: Math.round(winRate * 100) / 100,
      prizeDistribution
    };
  }

  async getPointsStatistics() {
    const customers = CustomerStorage.findAll();
    const orders = OrderStorage.findAll();

    const totalPointsEarned = orders.reduce((sum, order) => sum + Math.floor(order.totalPrice), 0);
    const totalPointsBalance = customers.reduce((sum, customer) => sum + customer.points, 0);

    const pointsEarnedDistribution = this.calculatePointsEarnedDistribution(orders);

    return {
      totalPointsEarned,
      totalPointsBalance,
      pointsEarnedDistribution
    };
  }

  private calculatePointsEarnedDistribution(orders: any[]) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const pointsToday = orders
      .filter(order => new Date(order.createdAt) >= oneDayAgo)
      .reduce((sum, order) => sum + Math.floor(order.totalPrice), 0);

    const pointsThisWeek = orders
      .filter(order => new Date(order.createdAt) >= oneWeekAgo)
      .reduce((sum, order) => sum + Math.floor(order.totalPrice), 0);

    const pointsThisMonth = orders
      .filter(order => new Date(order.createdAt) >= oneMonthAgo)
      .reduce((sum, order) => sum + Math.floor(order.totalPrice), 0);

    return {
      today: pointsToday,
      thisWeek: pointsThisWeek,
      thisMonth: pointsThisMonth
    };
  }

  async getDashboardData() {
    const [salesStats, customerStats, lotteryStats, pointsStats] = await Promise.all([
      this.getSalesStatistics('day'),
      this.getCustomerStatistics(),
      this.getLotteryStatistics(),
      this.getPointsStatistics()
    ]);

    return {
      sales: salesStats,
      customers: customerStats,
      lottery: lotteryStats,
      points: pointsStats
    };
  }
}
