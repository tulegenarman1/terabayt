import { eq, desc, like, and, avg, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { InsertUser, users, products, categories, brands, cartItems, reviews, Product, Category, Brand, CartItem, Review, InsertProduct, InsertCategory, InsertBrand, InsertCartItem, InsertReview } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      const dbPath = "sqlite.db";
      const client = createClient({
        url: `file:${dbPath}`,
      });
      _db = drizzle(client);
      console.log(`[Database] Connected to ${dbPath}`);
      
      // Attempt to sync schema manually on connection
      await syncSchemaManually(client);
      
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function syncSchemaManually(client: any) {
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS "brands" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "logo" text,
        "description" text,
        "createdAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
        "updatedAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "brands_name_unique" ON "brands" ("name");`,
      `CREATE TABLE IF NOT EXISTS "categories" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "description" text,
        "createdAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
        "updatedAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_unique" ON "categories" ("name");`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_unique" ON "categories" ("slug");`,
      `CREATE TABLE IF NOT EXISTS "products" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "categoryId" integer NOT NULL,
        "brandId" integer NOT NULL DEFAULT 0,
        "name" text NOT NULL,
        "brand" text NOT NULL,
        "model" text NOT NULL,
        "price" real NOT NULL,
        "discountPrice" real,
        "description" text,
        "specs" text,
        "images" text,
        "videoUrl" text,
        "availability" text DEFAULT 'in_stock' NOT NULL,
        "kaspiLink" text,
        "featured" integer DEFAULT 0 NOT NULL,
        "createdAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
        "updatedAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "openId" text NOT NULL,
        "name" text,
        "email" text,
        "loginMethod" text,
        "role" text DEFAULT 'user' NOT NULL,
        "createdAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
        "updatedAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
        "lastSignedIn" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_openId_unique" ON "users" ("openId");`,
      `CREATE TABLE IF NOT EXISTS "cartItems" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "productId" integer NOT NULL,
        "quantity" integer DEFAULT 1 NOT NULL,
        "sessionId" text NOT NULL,
        "createdAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
        "updatedAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS "reviews" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "productId" integer NOT NULL,
        "rating" integer NOT NULL,
        "title" text NOT NULL,
        "comment" text,
        "authorName" text NOT NULL,
        "authorEmail" text,
        "verified" integer DEFAULT 0 NOT NULL,
        "helpful" integer DEFAULT 0 NOT NULL,
        "createdAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
        "updatedAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
      );`
    ];

    for (const sql of tables) {
      await client.execute(sql);
    }
    
    // Add missing brandId column if needed
    const info = await client.execute("PRAGMA table_info(products)");
    const hasBrandId = info.rows.some((r: any) => r.name === "brandId");
    if (!hasBrandId) {
      await client.execute("ALTER TABLE products ADD COLUMN brandId integer NOT NULL DEFAULT 0");
    }
    
    console.log("[Database] Schema sync successful");
  } catch (e) {
    console.error("[Database] Schema sync failed:", e);
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await getUserByOpenId(user.openId);
    
    const values: InsertUser = {
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: user.lastSignedIn ?? new Date(),
      role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(users).set(values).where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values({
        ...values,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Brands queries
export async function getAllBrands() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brands).orderBy(desc(brands.createdAt));
}

export async function getBrandById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBrand(data: InsertBrand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Explicitly extract fields and provide defaults to avoid 'undefined'
  const values: any = {
    name: data.name || "",
    logo: data.logo || null,
    description: data.description || null,
  };
  
  return db.insert(brands).values(values);
}

export async function updateBrand(id: number, data: Partial<InsertBrand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(brands).set(data).where(eq(brands.id, id));
}

export async function deleteBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(brands).where(eq(brands.id, id));
}

// Products queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId)).orderBy(desc(products.createdAt));
}

export async function getProductsByBrandId(brandId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.brandId, brandId)).orderBy(desc(products.createdAt));
}

export async function getProductsByModel(brandId: number, model: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(
    and(eq(products.brandId, brandId), eq(products.model, model))
  ).orderBy(desc(products.createdAt));
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(like(products.name, `%${query}%`)).orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.featured, true)).orderBy(desc(products.createdAt));
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Extract fields and provide defaults to avoid 'undefined' and 'null' for ID
  const values: any = {
    categoryId: data.categoryId,
    brandId: data.brandId,
    name: data.name || "",
    brand: data.brand || "",
    model: data.model || "Standard",
    price: data.price,
    discountPrice: data.discountPrice || null,
    description: data.description || null,
    specs: data.specs || null,
    images: data.images || [],
    videoUrl: data.videoUrl || null,
    availability: data.availability || "in_stock",
    kaspiLink: data.kaspiLink || null,
    featured: data.featured ?? false,
  };
  
  return db.insert(products).values(values);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// Categories queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(desc(categories.createdAt));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const values: any = {
    name: data.name || "",
    slug: data.slug || "",
    description: data.description || null,
  };
  
  return db.insert(categories).values(values);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(eq(categories.id, id));
}

// Cart queries
export async function getCartItems(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
}

export async function addToCart(data: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const values: any = {
    productId: data.productId,
    quantity: data.quantity ?? 1,
    sessionId: data.sessionId,
  };
  
  return db.insert(cartItems).values(values);
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
}

// Reviews
export async function getReviewsByProductId(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const values: any = {
    productId: review.productId,
    rating: review.rating,
    title: review.title || "",
    comment: review.comment || null,
    authorName: review.authorName || "Anonymous",
    authorEmail: review.authorEmail || null,
    verified: review.verified ?? false,
    helpful: review.helpful ?? 0,
  };
  
  return db.insert(reviews).values(values);
}

export async function getAverageRating(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    avgRating: avg(reviews.rating),
    count: count(reviews.id),
  }).from(reviews).where(eq(reviews.productId, productId));
  const data = result[0];
  return {
    avgRating: data?.avgRating ? parseFloat(String(data.avgRating)) : 0,
    count: data?.count ? parseInt(String(data.count)) : 0,
  };
}


// Update all products Kaspi link
export async function updateAllKaspiLink(kaspiLink: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set({ kaspiLink });
}

export async function toggleFeatured(id: number, isFeatured: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set({ featured: isFeatured }).where(eq(products.id, id));
}
