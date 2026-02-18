// server/src/storage/product-storage.ts
import JsonStorage from './json-storage';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

export class ProductStorage {
  private static readonly FILE_NAME = 'products';

  static findAll(): Product[] {
    return JsonStorage.readData<Product>(this.FILE_NAME);
  }

  static findById(id: string): Product | null {
    const products = this.findAll();
    return products.find(product => product.id === id) || null;
  }

  static findByCategory(category: string): Product[] {
    const products = this.findAll();
    return products.filter(product => product.category === category);
  }

  static create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.findAll();
    const newProduct: Product = {
      id: JsonStorage.generateId(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    JsonStorage.writeData(this.FILE_NAME, products);
    return newProduct;
  }

  static update(id: string, updateData: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
    const products = this.findAll();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) return null;
    
    products[index] = { 
      ...products[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    JsonStorage.writeData(this.FILE_NAME, products);
    return products[index];
  }

  static updateStock(id: string, newStock: number): Product | null {
    return this.update(id, { stock: newStock });
  }
}