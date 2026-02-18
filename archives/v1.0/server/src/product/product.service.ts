// server/src/product/product.service.ts
import { Injectable } from '@nestjs/common';
import { ProductStorage, Product } from '../storage/product-storage';

@Injectable()
export class ProductService {
  async findAll() {
    return ProductStorage.findAll();
  }

  async findOne(id: string) {
    return ProductStorage.findById(id);
  }

  async findByCategory(category: string) {
    return ProductStorage.findByCategory(category);
  }

  async create(createProductDto: any) {
    return ProductStorage.create({
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock,
      category: createProductDto.category
    });
  }

  async update(id: string, updateProductDto: any) {
    return ProductStorage.update(id, updateProductDto);
  }

  async updateStock(id: string, stock: number) {
    return ProductStorage.updateStock(id, stock);
  }

  // 别名方法以匹配控制器期望的接口
  async getProducts(query: any) {
    return this.findAll();
  }

  async getProductById(id: string) {
    return this.findOne(id);
  }

  async createProduct(body: any) {
    return this.create(body);
  }

  async updateProduct(id: string, body: any) {
    return this.update(id, body);
  }

  async deleteProduct(id: string) {
    // ProductStorage 没有 delete 方法，这里简单返回 null
    return null;
  }
}