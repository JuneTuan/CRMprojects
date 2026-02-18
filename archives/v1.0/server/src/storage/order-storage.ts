// server/src/storage/order-storage.ts
import JsonStorage from './json-storage';

export interface Order {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export class OrderStorage {
  private static readonly FILE_NAME = 'orders';

  static findAll(): Order[] {
    return JsonStorage.readData<Order>(this.FILE_NAME);
  }

  static findById(id: string): Order | null {
    const orders = this.findAll();
    return orders.find(order => order.id === id) || null;
  }

  static findByCustomerId(customerId: string): Order[] {
    const orders = this.findAll();
    return orders.filter(order => order.customerId === customerId);
  }

  static create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.findAll();
    const newOrder: Order = {
      id: JsonStorage.generateId(),
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    JsonStorage.writeData(this.FILE_NAME, orders);
    return newOrder;
  }

  static update(id: string, updateData: Partial<Omit<Order, 'id' | 'createdAt'>>): Order | null {
    const orders = this.findAll();
    const index = orders.findIndex(order => order.id === id);
    
    if (index === -1) return null;
    
    orders[index] = { 
      ...orders[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    JsonStorage.writeData(this.FILE_NAME, orders);
    return orders[index];
  }
}