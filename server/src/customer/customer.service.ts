import { Injectable } from '@nestjs/common';
import { customerManager } from '../storage/database';

@Injectable()
export class CustomerService {
  async getCustomers(query: any) {
    const { skip, limit, ...filters } = query;
    return customerManager.getCustomers({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      filters
    });
  }

  async getCustomerById(id: string) {
    return customerManager.getCustomerById(id);
  }

  async createCustomer(data: any) {
    return customerManager.createCustomer(data);
  }

  async updateCustomer(id: string, data: any) {
    return customerManager.updateCustomer(id, data);
  }

  async deleteCustomer(id: string) {
    return customerManager.deleteCustomer(id);
  }
}
