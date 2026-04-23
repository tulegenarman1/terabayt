import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  logo: text("logo"), // URL to the logo image
  description: text("description"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("categoryId").notNull(),
  brandId: integer("brandId").notNull(),
  name: text("name").notNull(),
  brand: text("brand").notNull(), // Legacy field, kept for compatibility or can be removed after migration
  model: text("model").notNull(),
  price: real("price").notNull(),
  discountPrice: real("discountPrice"),
  description: text("description"),
  specs: text("specs", { mode: 'json' }).$type<{
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    display?: string;
    os?: string;
    [key: string]: string | undefined;
  }>(),
  images: text("images", { mode: 'json' }).$type<string[]>(),
  videoUrl: text("videoUrl"),
  availability: text("availability", { enum: ["in_stock", "out_of_stock", "coming_soon"] }).default("in_stock").notNull(),
  kaspiLink: text("kaspiLink"),
  featured: integer("featured", { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const cartItems = sqliteTable("cartItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  sessionId: text("sessionId").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

export const aiLogs = sqliteTable("aiLogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId"),
  userIp: text("userId"), 
  query: text("query").notNull(),
  normalizedKey: text("normalizedKey").notNull(),
  aiUsed: integer("aiUsed", { mode: 'boolean' }).notNull(),
  reason: text("reason").notNull(),
  confidenceScore: real("confidenceScore"),
  response: text("response").notNull(),
  savings: integer("savings").default(0).notNull(), 
  abTestGroup: text("abTestGroup").default("optimized").notNull(),
  
  // New Analytics Fields
  clickedProductId: integer("clickedProductId"),
  addedToCart: integer("addedToCart", { mode: 'boolean' }).default(false).notNull(),
  conversionValue: real("conversionValue").default(0),
  responseTime: integer("responseTime"), // in ms
  
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
});

export type AiLog = typeof aiLogs.$inferSelect;
export type InsertAiLog = typeof aiLogs.$inferInsert;

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  cartItems: many(cartItems),
  reviews: many(reviews),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("productId").notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: text("title").notNull(),
  comment: text("comment"),
  authorName: text("authorName").notNull(),
  authorEmail: text("authorEmail"),
  verified: integer("verified", { mode: 'boolean' }).default(false).notNull(),
  helpful: integer("helpful").default(0).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(cast(strftime('%s', 'now') as integer))`).notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));
