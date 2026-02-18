import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { customers, insertCustomerSchema, updateCustomerSchema } from "./shared/schema";
import type { Customer, InsertCustomer, UpdateCustomer } from "./shared/schema";
import * as schema from "./shared/schema";

export class CustomerManager {
  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const db = await getDb(schema);
    const validated = insertCustomerSchema.parse(data);
    const [customer] = await db.insert(customers).values(validated).returning();
    return customer;
  }

  async getCustomers(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Customer, 'id' | 'name' | 'phone'>>
  } = {}): Promise<Customer[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(customers.id, filters.id));
    }
    if (filters.name !== undefined) {
      conditions.push(eq(customers.name, filters.name));
    }
    if (filters.phone !== undefined && filters.phone !== null) {
      conditions.push(eq(customers.phone, filters.phone));
    }

    const results = await db.select().from(customers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(skip)
      .orderBy(sql`${customers.createdAt} DESC`);

    return results;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const db = await getDb(schema);
    const customer = await db.select().from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    return customer[0] || null;
  }

  async updateCustomer(id: string, data: UpdateCustomer): Promise<Customer | null> {
    const db = await getDb(schema);
    const validated = updateCustomerSchema.parse(data);
    const customer = await db.update(customers)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();

    return customer[0] || null;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const customerManager = new CustomerManager();
