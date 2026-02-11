import { Injectable } from '@nestjs/common';
import { productManager } from '../storage/database';

@Injectable()
export class ProductService {
  async getProducts(query: any) {
    const { skip, limit, ...filters } = query;
    return productManager.getProducts({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      filters
    });
  }

  async getProductById(id: string) {
    return productManager.getProductById(id);
  }

  async createProduct(data: any) {
    return productManager.createProduct(data);
  }

  async updateProduct(id: string, data: any) {
    return productManager.updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    return productManager.deleteProduct(id);
  }
}
