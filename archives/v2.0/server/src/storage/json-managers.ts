import JsonStorage from './json-storage';

// 用户管理器
export class UserManager {
  private readonly FILE_NAME = 'users';

  async getUserByUsername(username: string) {
    const users = JsonStorage.readData<any>(this.FILE_NAME);
    return users.find((user: any) => user.username === username && user.isActive) || null;
  }

  async createUser(data: any) {
    const users = JsonStorage.readData<any>(this.FILE_NAME);
    const newUser = {
      id: JsonStorage.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    JsonStorage.writeData(this.FILE_NAME, users);
    return newUser;
  }
}

// 客户管理器
export class CustomerManager {
  private readonly FILE_NAME = 'customers';

  async getCustomers(options: any = {}) {
    let customers = JsonStorage.readData<any>(this.FILE_NAME);
    
    // 应用过滤条件
    if (options.filters) {
      const { id, name, phone } = options.filters;
      if (id) customers = customers.filter((c: any) => c.id === id);
      if (name) customers = customers.filter((c: any) => c.name.includes(name));
      if (phone) customers = customers.filter((c: any) => c.phone === phone);
    }
    
    // 分页
    const { skip = 0, limit = 100 } = options;
    return customers.slice(skip, skip + limit);
  }

  async getCustomerById(id: string) {
    const customers = JsonStorage.readData<any>(this.FILE_NAME);
    return customers.find((customer: any) => customer.id === id) || null;
  }

  async createCustomer(data: any) {
    const customers = JsonStorage.readData<any>(this.FILE_NAME);
    const newCustomer = {
      id: JsonStorage.generateId(),
      ...data,
      points: data.points || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    JsonStorage.writeData(this.FILE_NAME, customers);
    return newCustomer;
  }

  async updateCustomer(id: string, data: any) {
    const customers = JsonStorage.readData<any>(this.FILE_NAME);
    const index = customers.findIndex((customer: any) => customer.id === id);
    if (index === -1) return null;
    
    customers[index] = {
      ...customers[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, customers);
    return customers[index];
  }

  async deleteCustomer(id: string) {
    const customers = JsonStorage.readData<any>(this.FILE_NAME);
    const filtered = customers.filter((customer: any) => customer.id !== id);
    JsonStorage.writeData(this.FILE_NAME, filtered);
    return filtered.length < customers.length;
  }
}

// 产品管理器
export class ProductManager {
  private readonly FILE_NAME = 'products';

  async getProducts(options: any = {}) {
    let products = JsonStorage.readData<any>(this.FILE_NAME);
    
    // 应用过滤条件
    if (options.filters) {
      const { id, name, isActive } = options.filters;
      if (id) products = products.filter((p: any) => p.id === id);
      if (name) products = products.filter((p: any) => p.name.includes(name));
      if (isActive !== undefined) products = products.filter((p: any) => p.isActive === isActive);
    }
    
    // 分页
    const { skip = 0, limit = 100 } = options;
    return products.slice(skip, skip + limit);
  }

  async getProductById(id: string) {
    const products = JsonStorage.readData<any>(this.FILE_NAME);
    return products.find((product: any) => product.id === id) || null;
  }

  async createProduct(data: any) {
    const products = JsonStorage.readData<any>(this.FILE_NAME);
    const newProduct = {
      id: JsonStorage.generateId(),
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    JsonStorage.writeData(this.FILE_NAME, products);
    return newProduct;
  }

  async updateProduct(id: string, data: any) {
    const products = JsonStorage.readData<any>(this.FILE_NAME);
    const index = products.findIndex((product: any) => product.id === id);
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, products);
    return products[index];
  }
}

// 订单管理器
export class OrderManager {
  private readonly FILE_NAME = 'orders';

  async createOrder(data: any) {
    const orders = JsonStorage.readData<any>(this.FILE_NAME);
    const newOrder = {
      id: JsonStorage.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.push(newOrder);
    JsonStorage.writeData(this.FILE_NAME, orders);
    
    // 更新客户积分
    if (data.pointsEarned > 0) {
      const customerManager = new CustomerManager();
      const customer = await customerManager.getCustomerById(data.customerId);
      if (customer) {
        await customerManager.updateCustomer(data.customerId, {
          points: (customer.points || 0) + data.pointsEarned
        });
      }
    }
    
    return newOrder;
  }

  async getOrders(options: any = {}) {
    let orders = JsonStorage.readData<any>(this.FILE_NAME);
    
    // 按客户ID过滤
    if (options.customerId) {
      orders = orders.filter((order: any) => order.customerId === options.customerId);
    }
    
    // 分页
    const { skip = 0, limit = 100 } = options;
    return orders.slice(skip, skip + limit);
  }

  async getOrderById(id: string) {
    const orders = JsonStorage.readData<any>(this.FILE_NAME);
    return orders.find((order: any) => order.id === id) || null;
  }
}

// 奖品管理器
export class PrizeManager {
  private readonly FILE_NAME = 'prizes';

  async createPrize(data: any) {
    const prizes = JsonStorage.readData<any>(this.FILE_NAME);
    const newPrize = {
      id: JsonStorage.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    prizes.push(newPrize);
    JsonStorage.writeData(this.FILE_NAME, prizes);
    return newPrize;
  }

  async getPrizes(options: any = {}) {
    const { skip = 0, limit = 100 } = options;
    const prizes = JsonStorage.readData<any>(this.FILE_NAME);
    return prizes.slice(skip, skip + limit);
  }

  async getAvailablePrizes() {
    const prizes = JsonStorage.readData<any>(this.FILE_NAME);
    return prizes.sort((a: any, b: any) => (a.probability || 0) - (b.probability || 0));
  }

  async getPrizeById(id: string) {
    const prizes = JsonStorage.readData<any>(this.FILE_NAME);
    return prizes.find((prize: any) => prize.id === id) || null;
  }

  async updatePrize(id: string, data: any) {
    const prizes = JsonStorage.readData<any>(this.FILE_NAME);
    const index = prizes.findIndex((prize: any) => prize.id === id);
    if (index === -1) return null;
    
    prizes[index] = {
      ...prizes[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, prizes);
    return prizes[index];
  }

  async deletePrize(id: string) {
    const prizes = JsonStorage.readData<any>(this.FILE_NAME);
    const filtered = prizes.filter((prize: any) => prize.id !== id);
    JsonStorage.writeData(this.FILE_NAME, filtered);
    return filtered.length < prizes.length;
  }

  async decreasePrizeQuantity(id: string) {
    // 简化实现
    return true;
  }
}

// 优惠券管理器
export class CouponManager {
  private readonly FILE_NAME = 'coupons';

  async createCoupon(data: any) {
    const coupons = JsonStorage.readData<any>(this.FILE_NAME);
    const newCoupon = {
      id: JsonStorage.generateId(),
      ...data,
      status: data.status || 'unused',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    coupons.push(newCoupon);
    JsonStorage.writeData(this.FILE_NAME, coupons);
    return newCoupon;
  }

  async createCouponFromPrize(data: {
    customerId?: string;
    prizeId: string;
    prizeName: string;
    prizeType: string;
    prizeValue: string;
    expiryDays?: number;
  }) {
    const coupons = JsonStorage.readData<any>(this.FILE_NAME);
    const expiryDate = data.expiryDays 
      ? new Date(Date.now() + data.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    
    const newCoupon = {
      id: JsonStorage.generateId(),
      customerId: data.customerId,
      prizeId: data.prizeId,
      prizeName: data.prizeName,
      prizeType: data.prizeType,
      prizeValue: data.prizeValue,
      code: `CPN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'claimed',
      expiryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    coupons.push(newCoupon);
    JsonStorage.writeData(this.FILE_NAME, coupons);
    return newCoupon;
  }

  async getCoupons(options: any = {}) {
    let coupons = JsonStorage.readData<any>(this.FILE_NAME);
    
    // 过滤条件
    if (options.customerId) {
      coupons = coupons.filter((c: any) => c.customerId === options.customerId);
    }
    if (options.status) {
      coupons = coupons.filter((c: any) => c.status === options.status);
    }
    
    // 分页
    const { skip = 0, limit = 100 } = options;
    return coupons.slice(skip, skip + limit);
  }

  async getCouponById(id: string) {
    const coupons = JsonStorage.readData<any>(this.FILE_NAME);
    return coupons.find((coupon: any) => coupon.id === id) || null;
  }

  async updateCoupon(id: string, data: any) {
    const coupons = JsonStorage.readData<any>(this.FILE_NAME);
    const index = coupons.findIndex((coupon: any) => coupon.id === id);
    if (index === -1) return null;
    
    coupons[index] = {
      ...coupons[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, coupons);
    return coupons[index];
  }

  async useCoupon(id: string) {
    const coupons = JsonStorage.readData<any>(this.FILE_NAME);
    const index = coupons.findIndex((coupon: any) => coupon.id === id);
    if (index === -1) return null;
    
    coupons[index] = {
      ...coupons[index],
      status: 'used',
      usedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, coupons);
    return coupons[index];
  }

  async verifyCoupon(id: string, userId: string) {
    const coupons = JsonStorage.readData<any>(this.FILE_NAME);
    const index = coupons.findIndex((coupon: any) => coupon.id === id);
    
    if (index === -1) {
      throw new Error('卡券不存在');
    }

    const coupon = coupons[index];

    if (coupon.status === 'used') {
      throw new Error('卡券已被核销');
    }

    if (coupon.status === 'expired') {
      throw new Error('卡券已过期');
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new Error('卡券已过期');
    }

    coupons[index] = {
      ...coupon,
      status: 'used',
      usedAt: new Date().toISOString(),
      verifiedBy: userId,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    JsonStorage.writeData(this.FILE_NAME, coupons);
    return coupons[index];
  }

  async verifyCouponByCode(code: string, userId: string) {
    const coupons = JsonStorage.readData<any>(this.FILE_NAME);
    const index = coupons.findIndex((coupon: any) => coupon.code === code);
    
    if (index === -1) {
      throw new Error('卡券不存在');
    }

    const coupon = coupons[index];

    if (coupon.status === 'used') {
      throw new Error('卡券已被核销');
    }

    if (coupon.status === 'expired') {
      throw new Error('卡券已过期');
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new Error('卡券已过期');
    }

    coupons[index] = {
      ...coupon,
      status: 'used',
      usedAt: new Date().toISOString(),
      verifiedBy: userId,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    JsonStorage.writeData(this.FILE_NAME, coupons);
    return coupons[index];
  }
}

// 抽奖管理器
export class LotteryManager {
  private readonly FILE_NAME = 'lottery_records';

  async createLotteryRecord(data: any) {
    const records = JsonStorage.readData<any>(this.FILE_NAME);
    const newRecord = {
      id: JsonStorage.generateId(),
      ...data,
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    JsonStorage.writeData(this.FILE_NAME, records);
    return newRecord;
  }

  async getTodayLotteryCount(customerId: string) {
    const records = JsonStorage.readData<any>(this.FILE_NAME);
    const today = new Date().toDateString();
    return records.filter((record: any) => 
      record.customerId === customerId && 
      new Date(record.createdAt).toDateString() === today
    ).length;
  }

  async resetTodayLotteryCount(customerId: string) {
    const records = JsonStorage.readData<any>(this.FILE_NAME);
    const today = new Date().toDateString();
    const filtered = records.filter((record: any) => 
      !(record.customerId === customerId && 
        new Date(record.createdAt).toDateString() === today)
    );
    JsonStorage.writeData(this.FILE_NAME, filtered);
  }

  async getLotteryRecords(customerId: string) {
    const records = JsonStorage.readData<any>(this.FILE_NAME);
    return records.filter((record: any) => record.customerId === customerId);
  }
}

// 积分规则管理器
export class PointsRuleManager {
  private readonly FILE_NAME = 'points_rules';

  async calculatePoints(amount: number) {
    const rules = JsonStorage.readData<any>(this.FILE_NAME);
    const activeRule = rules.find((rule: any) => rule.isActive);
    
    if (!activeRule) return Math.floor(amount / 10); // 默认规则
    
    // 根据规则计算积分
    if (activeRule.calculationType === 'fixed') {
      return activeRule.pointsPerUnit * Math.floor(amount / activeRule.unitAmount);
    } else {
      return Math.floor(amount * activeRule.rate);
    }
  }

  async getPointsRules(options: any = {}) {
    const { skip = 0, limit = 100 } = options;
    const rules = JsonStorage.readData<any>(this.FILE_NAME);
    return rules.slice(skip, skip + limit);
  }

  async getActiveRule() {
    const rules = JsonStorage.readData<any>(this.FILE_NAME);
    return rules.find((rule: any) => rule.isActive) || null;
  }

  async getPointsRuleById(id: string) {
    const rules = JsonStorage.readData<any>(this.FILE_NAME);
    return rules.find((rule: any) => rule.id === id) || null;
  }

  async getActivePointsRule() {
    return this.getActiveRule();
  }

  async createPointsRule(data: any) {
    const rules = JsonStorage.readData<any>(this.FILE_NAME);
    const newRule = {
      id: JsonStorage.generateId(),
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    rules.push(newRule);
    JsonStorage.writeData(this.FILE_NAME, rules);
    return newRule;
  }

  async updatePointsRule(id: string, data: any) {
    const rules = JsonStorage.readData<any>(this.FILE_NAME);
    const index = rules.findIndex((rule: any) => rule.id === id);
    if (index === -1) return null;
    
    rules[index] = {
      ...rules[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, rules);
    return rules[index];
  }

  async deletePointsRule(id: string) {
    const rules = JsonStorage.readData<any>(this.FILE_NAME);
    const filtered = rules.filter((rule: any) => rule.id !== id);
    JsonStorage.writeData(this.FILE_NAME, filtered);
    return filtered.length < rules.length;
  }
}

// 抽奖设置管理器
export class LotterySettingManager {
  private readonly FILE_NAME = 'lottery_settings';

  async getLotterySettings(options: any = {}) {
    const { skip = 0, limit = 100 } = options;
    const settings = JsonStorage.readData<any>(this.FILE_NAME);
    return settings.slice(skip, skip + limit);
  }

  async getActiveLotterySetting() {
    const settings = JsonStorage.readData<any>(this.FILE_NAME);
    return settings.find((setting: any) => setting.isActive) || null;
  }

  async getLotterySettingById(id: string) {
    const settings = JsonStorage.readData<any>(this.FILE_NAME);
    return settings.find((setting: any) => setting.id === id) || null;
  }

  async createLotterySetting(data: any) {
    const settings = JsonStorage.readData<any>(this.FILE_NAME);
    const newSetting = {
      id: JsonStorage.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    settings.push(newSetting);
    JsonStorage.writeData(this.FILE_NAME, settings);
    return newSetting;
  }

  async updateLotterySetting(id: string, data: any) {
    const settings = JsonStorage.readData<any>(this.FILE_NAME);
    const index = settings.findIndex((setting: any) => setting.id === id);
    if (index === -1) return null;
    
    settings[index] = {
      ...settings[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, settings);
    return settings[index];
  }

  async deleteLotterySetting(id: string) {
    const settings = JsonStorage.readData<any>(this.FILE_NAME);
    const filtered = settings.filter((setting: any) => setting.id !== id);
    JsonStorage.writeData(this.FILE_NAME, filtered);
    return filtered.length < settings.length;
  }
}

// 活动管理器
export class ActivityManager {
  private readonly FILE_NAME = 'activities';

  async getActivities() {
    const activities = JsonStorage.readData<any>(this.FILE_NAME);
    return activities.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActivityById(id: string) {
    const activities = JsonStorage.readData<any>(this.FILE_NAME);
    return activities.find((activity: any) => activity.id === id) || null;
  }

  async getActiveActivity() {
    const activities = JsonStorage.readData<any>(this.FILE_NAME);
    const now = new Date();
    return activities.find((activity: any) => 
      activity.status === 'active' &&
      new Date(activity.startTime) <= now &&
      new Date(activity.endTime) >= now
    ) || null;
  }

  async createActivity(data: any) {
    const activities = JsonStorage.readData<any>(this.FILE_NAME);
    const newActivity = {
      id: JsonStorage.generateId(),
      ...data,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    activities.push(newActivity);
    JsonStorage.writeData(this.FILE_NAME, activities);
    return newActivity;
  }

  async updateActivity(id: string, data: any) {
    const activities = JsonStorage.readData<any>(this.FILE_NAME);
    const index = activities.findIndex((activity: any) => activity.id === id);
    if (index === -1) return null;
    
    activities[index] = {
      ...activities[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    JsonStorage.writeData(this.FILE_NAME, activities);
    return activities[index];
  }

  async deleteActivity(id: string) {
    const activities = JsonStorage.readData<any>(this.FILE_NAME);
    const filtered = activities.filter((activity: any) => activity.id !== id);
    JsonStorage.writeData(this.FILE_NAME, filtered);
    return filtered.length < activities.length;
  }

  async getActivityConfigs(activityId: string) {
    // 简化实现，返回空数组
    return [];
  }

  async addActivityConfig(data: any) {
    // 简化实现
    return { id: JsonStorage.generateId(), ...data };
  }

  async updateActivityConfig(id: string, configValue: any) {
    // 简化实现
    return { id, configValue };
  }

  async deleteActivityConfig(id: string) {
    // 简化实现
    return true;
  }

  async getActivityPrizes(activityId: string) {
    // 简化实现，返回空数组
    return [];
  }

  async addActivityPrize(data: any) {
    // 简化实现
    return { id: JsonStorage.generateId(), ...data };
  }

  async updateActivityPrize(id: string, data: any) {
    // 简化实现
    return { id, ...data };
  }

  async deleteActivityPrize(id: string) {
    // 简化实现
    return true;
  }

  getGameTypes() {
    return [
      { value: 'wheel', label: '幸运转盘' },
      { value: 'blindbox', label: '神秘盲盒' },
      { value: 'slotmachine', label: '老虎机' },
      { value: 'scratchcard', label: '刮刮乐' },
      { value: 'lotterybox', label: '抽奖箱' }
    ];
  }
}

// 导出实例
export const userManager = new UserManager();
export const customerManager = new CustomerManager();
export const productManager = new ProductManager();
export const orderManager = new OrderManager();
export const prizeManager = new PrizeManager();
export const couponManager = new CouponManager();
export const lotteryManager = new LotteryManager();
export const pointsRuleManager = new PointsRuleManager();
export const lotterySettingManager = new LotterySettingManager();
export const activityManager = new ActivityManager();