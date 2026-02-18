// server/src/storage/customer-storage.ts
import JsonStorage from './json-storage';

export interface Customer {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  password?: string;
  createdAt: string;
  updatedAt?: string;
}

export class CustomerStorage {
  private static readonly FILE_NAME = 'customers';

  static findAll(): Customer[] {
    return JsonStorage.readData<Customer>(this.FILE_NAME);
  }

  static findById(id: string): Customer | null {
    const customers = this.findAll();
    return customers.find(customer => customer.id === id) || null;
  }

  static findByPhone(phone: string): Customer | null {
    const customers = this.findAll();
    return customers.find(customer => customer.phone === phone) || null;
  }

  static create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const customers = this.findAll();
    const newCustomer: Customer = {
      id: JsonStorage.generateId(),
      ...customerData,
      points: customerData.points || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    JsonStorage.writeData(this.FILE_NAME, customers);
    return newCustomer;
  }

  static update(id: string, updateData: Partial<Omit<Customer, 'id' | 'createdAt'>>): Customer | null {
    const customers = this.findAll();
    const index = customers.findIndex(customer => customer.id === id);
    
    if (index === -1) return null;
    
    customers[index] = { 
      ...customers[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    JsonStorage.writeData(this.FILE_NAME, customers);
    return customers[index];
  }

  static delete(id: string): boolean {
    const customers = this.findAll();
    const initialLength = customers.length;
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    
    if (filteredCustomers.length === initialLength) return false;
    
    JsonStorage.writeData(this.FILE_NAME, filteredCustomers);
    return true;
  }

  static addPoints(id: string, points: number): Customer | null {
    const customer = this.findById(id);
    if (!customer) return null;
    
    return this.update(id, { 
      points: customer.points + points 
    });
  }
}