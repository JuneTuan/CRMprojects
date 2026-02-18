import { eq } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { users, insertUserSchema, updateUserSchema } from "./shared/schema";
import type { User, InsertUser, UpdateUser } from "./shared/schema";
import * as schema from "./shared/schema";

export class UserManager {
  async createUser(data: InsertUser): Promise<User> {
    const db = await getDb(schema);
    const validated = insertUserSchema.parse(data);
    const [user] = await db.insert(users).values(validated).returning();
    return user;
  }

  async getUsers(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<User, 'id' | 'name' | 'username' | 'role' | 'isActive'>>
  } = {}): Promise<User[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: any[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(users.id, filters.id));
    }
    if (filters.name !== undefined) {
      conditions.push(eq(users.name, filters.name));
    }
    if (filters.username !== undefined) {
      conditions.push(eq(users.username, filters.username));
    }
    if (filters.role !== undefined) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }

    return db.query.users.findMany({
      where: conditions.length > 0 ? conditions.length === 1 ? conditions[0] : conditions : undefined,
      limit,
      offset: skip,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await getDb(schema);
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = await getDb(schema);
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return user || null;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | null> {
    const db = await getDb(schema);
    const validated = updateUserSchema.parse(data);
    const [user] = await db
      .update(users)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const userManager = new UserManager();
