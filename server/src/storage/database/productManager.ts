import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { products, insertProductSchema, updateProductSchema } from "./shared/schema";
import type { Product, InsertProduct, UpdateProduct } from "./shared/schema";
import * as schema from "./shared/schema";

export class ProductManager {
  async createProduct(data: InsertProduct): Promise<Product> {
    const db = await getDb(schema);
    const validated = insertProductSchema.parse(data);
    const [product] = await db.insert(products).values(validated).returning();
    return { ...product, price: parseFloat(product.price) || 0 };
  }

  async getProducts(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Product, 'id' | 'name' | 'isActive'>>
  } = {}): Promise<Product[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(products.id, filters.id));
    }
    if (filters.name !== undefined) {
      conditions.push(eq(products.name, filters.name));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }

    const results = await db.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: { createdAt: "desc" as any },
    });

    return results.map(r => ({ ...r, price: parseFloat(r.price) || 0 }));
  }

  async getProductById(id: string): Promise<Product | null> {
    const db = await getDb(schema);
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) return null;
    return { ...product, price: parseFloat(product.price) || 0 };
  }

  async updateProduct(id: string, data: UpdateProduct): Promise<Product | null> {
    const db = await getDb(schema);
    const validated = updateProductSchema.parse(data);
    const [product] = await db
      .update(products)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    if (!product) return null;
    return { ...product, price: parseFloat(product.price) || 0 };
  }

  async deleteProduct(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const productManager = new ProductManager();
