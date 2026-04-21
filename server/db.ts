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
      const client = createClient({
        url: "file:sqlite.db",
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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
  return db.insert(brands).values(data);
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
  const result = await db.insert(products).values(data);
  return result;
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
  return db.insert(categories).values(data);
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
  return db.insert(cartItems).values(data);
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
  return db.insert(reviews).values(review);
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
