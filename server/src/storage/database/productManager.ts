import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { products, insertProductSchema, updateProductSchema } from "./shared/schema";
import * as schema from "./shared/schema";

export class ProductManager {
  async createProduct(data: any): Promise<any> {
    const db = await getDb(schema);
    const validated = insertProductSchema.parse(data);
    const [product] = await db.insert(products).values(validated).returning();
    return product;
  }

  async getProducts(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<any, 'id' | 'name' | 'isActive'>>
  } = {}): Promise<any[]> {
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

    const results = await db.select().from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(skip)
      .orderBy(sql`${products.createdAt} DESC`);

    return results;
  }

  async getProductById(id: string): Promise<any | null> {
    const db = await getDb(schema);
    const product = await db.select().from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product[0]) return null;
    return product[0];
  }

  async updateProduct(id: string, data: any): Promise<any | null> {
    const db = await getDb(schema);
    const validated = updateProductSchema.parse(data);
    const [product] = await db
      .update(products)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    if (!product) return null;
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const productManager = new ProductManager();
