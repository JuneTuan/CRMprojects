import { pgTable, varchar, text, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 用户表（系统用户：管理员、销售员、产品员等）
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"), // admin, staff, customer - 管理员、员工、客户
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// 客户表
export const customers = pgTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// 产品表
export const products = pgTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// 订单表
export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id", { length: 36 }).notNull(),
  productId: varchar("product_id", { length: 36 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// 奖品表
export const prizes = pgTable("prizes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // coupon, redpacket, item
  value: text("value"), // 奖品值，如"10元优惠"、"100元红包"
  probability: integer("probability").default(0).notNull(), // 中奖概率，0-100
  totalQuantity: integer("total_quantity").default(0).notNull(),
  remainingQuantity: integer("remaining_quantity").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// 卡券表
export const coupons = pgTable("coupons", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id", { length: 36 }).notNull(),
  prizeId: varchar("prize_id", { length: 36 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 20 }).default("claimed").notNull(), // claimed, used, expired
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// 抽奖记录表
export const lottery_records = pgTable("lottery_records", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id", { length: 36 }).notNull(),
  prizeId: varchar("prize_id", { length: 36 }),
  isWon: boolean("is_won").default(false).notNull(),
  result: text("result"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

// 积分规则表
export const points_rules = pgTable("points_rules", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(), // 规则名称
  pointsPerAmount: integer("points_per_amount").notNull().default(1), // 积分计算比例，如1元=10积分则值为10
  minAmount: numeric("min_amount", { precision: 10, scale: 2 }).default("0"), // 最低消费金额
  maxPoints: integer("max_points"), // 单次最高积分限制
  description: text("description"), // 规则说明
  isActive: boolean("is_active").default(true).notNull(), // 是否启用
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
})

// User schemas
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  isActive: true,
})

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    username: true,
    password: true,
    role: true,
    name: true,
    isActive: true,
  })
  .partial()

// Customer schemas
export const insertCustomerSchema = createCoercedInsertSchema(customers).pick({
  name: true,
  phone: true,
  address: true,
  points: true,
})

export const updateCustomerSchema = createCoercedInsertSchema(customers)
  .pick({
    name: true,
    phone: true,
    address: true,
    points: true,
  })
  .partial()

// Product schemas
export const insertProductSchema = createCoercedInsertSchema(products)
  .extend({
    price: z.union([z.string(), z.number()]).transform(String),
  })
  .pick({
    name: true,
    description: true,
    price: true,
    isActive: true,
  })

export const updateProductSchema = createCoercedInsertSchema(products)
  .extend({
    price: z.union([z.string(), z.number()]).transform(String).optional(),
  })
  .pick({
    name: true,
    description: true,
    price: true,
    isActive: true,
  })
  .partial()

// Order schemas
export const insertOrderSchema = createCoercedInsertSchema(orders)
  .extend({
    amount: z.union([z.string(), z.number()]).transform(String),
  })
  .pick({
    customerId: true,
    productId: true,
    amount: true,
    pointsEarned: true,
  })

// Prize schemas
export const insertPrizeSchema = createCoercedInsertSchema(prizes).pick({
  name: true,
  type: true,
  value: true,
  probability: true,
  totalQuantity: true,
  remainingQuantity: true,
})

export const updatePrizeSchema = createCoercedInsertSchema(prizes)
  .pick({
    name: true,
    type: true,
    value: true,
    probability: true,
    totalQuantity: true,
    remainingQuantity: true,
  })
  .partial()

// Coupon schemas
export const insertCouponSchema = createCoercedInsertSchema(coupons).pick({
  customerId: true,
  prizeId: true,
  code: true,
  status: true,
  expiryDate: true,
  usedAt: true,
})

export const updateCouponSchema = createCoercedInsertSchema(coupons)
  .pick({
    status: true,
    expiryDate: true,
    usedAt: true,
  })
  .partial()

// Points Rule schemas
export const insertPointsRuleSchema = createCoercedInsertSchema(points_rules)
  .extend({
    minAmount: z.union([z.string(), z.number()]).transform(String),
  })
  .pick({
    name: true,
    pointsPerAmount: true,
    minAmount: true,
    maxPoints: true,
    description: true,
    isActive: true,
  })

export const updatePointsRuleSchema = createCoercedInsertSchema(points_rules)
  .extend({
    minAmount: z.union([z.string(), z.number()]).transform(String).optional(),
  })
  .pick({
    name: true,
    pointsPerAmount: true,
    minAmount: true,
    maxPoints: true,
    description: true,
    isActive: true,
  })
  .partial()

// Lottery record schemas
export const insertLotteryRecordSchema = createCoercedInsertSchema(lottery_records).pick({
  customerId: true,
  prizeId: true,
  isWon: true,
  result: true,
})

// TypeScript types
export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

export type Customer = typeof customers.$inferSelect
export type InsertCustomer = z.infer<typeof insertCustomerSchema>
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>

export type Product = typeof products.$inferSelect
export type InsertProduct = Omit<z.infer<typeof insertProductSchema>, 'price'> & { price: number | string }
export type UpdateProduct = Omit<z.infer<typeof updateProductSchema>, 'price'> & { price?: number | string }

export type Order = typeof orders.$inferSelect
export type InsertOrder = Omit<z.infer<typeof insertOrderSchema>, 'amount'> & { amount: number | string }

export type Prize = typeof prizes.$inferSelect
export type InsertPrize = z.infer<typeof insertPrizeSchema>
export type UpdatePrize = z.infer<typeof updatePrizeSchema>

export type Coupon = typeof coupons.$inferSelect
export type InsertCoupon = z.infer<typeof insertCouponSchema>
export type UpdateCoupon = z.infer<typeof updateCouponSchema>

export type LotteryRecord = typeof lottery_records.$inferSelect
export type InsertLotteryRecord = z.infer<typeof insertLotteryRecordSchema>




