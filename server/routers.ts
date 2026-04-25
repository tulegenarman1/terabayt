import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { nanoid } from "nanoid";
import axios from "axios";

import { ENV } from "./_core/env";
import { invokeLLM, Message } from "./_core/llm";

// AI Cache and Rate Limiting
const aiCache = new Map<string, { response: string, timestamp: number, hits: number }>();
const userRequestCounts = new Map<string, { count: number, lastReset: number, lastRequestTime: number }>();
const LIMITS = { GUEST: 5, AUTH: 15, ADMIN: Infinity };
const RESET_INTERVAL = 24 * 60 * 60 * 1000;
const FREQUENCY_LIMIT = 2000;

const semanticGroups: Record<string, string[]> = {
  "gaming_laptop": ["игр", "гейм", "гейд", "игров", "pubg", "dota", "кс", "csgo"],
  "office_laptop": ["офис", "работ", "учеб", "документ", "excel", "word"],
  "design_laptop": ["дизайн", "фото", "видео", "монтаж", "photoshop", "adobe", "3d"],
  "smartphone": ["телефон", "смартфон", "сотов", "айфон", "iphone", "samsung", "самсунг"],
  "printer": ["принтер", "печать", "сканер", "мфу", "hp", "canon"],
  "best_choice": ["лучший", "вариант", "что взять", "что купить", "посоветуй", "рекомендуй"],
  "budget_cheap": ["дешево", "недорог", "бюджетн", "экономич"],
};

const normalizeInput = (text: string) => {
  let lowText = text.toLowerCase().trim();
  
  // Extract budget
  const priceMatch = lowText.match(/(\d+(?:\.\d+)?)\s*(?:тг|₸|тенге|тыс|k|млн|миллион)/i);
  let budgetVal = 0;
  let budgetKey = "";
  if (priceMatch) {
    budgetVal = parseFloat(priceMatch[1]);
    if (lowText.includes("млн") || lowText.includes("миллион")) budgetVal *= 1000000;
    else if (lowText.includes("тыс") || lowText.includes("k")) budgetVal *= 1000;
    budgetKey = `_price_${Math.round(budgetVal / 50000) * 50000}`;
  }

  // Semantic groups
  for (const [group, keywords] of Object.entries(semanticGroups)) {
    if (keywords.some(k => lowText.includes(k))) {
      return { key: `group_${group}${budgetKey}`, budget: budgetVal };
    }
  }

  return { key: lowText.replace(/[!?. ,/\\-]/g, "").replace(/\s+/g, "") + budgetKey, budget: budgetVal };
};

const getAdaptiveTTL = (product: any, hits: number = 0) => {
  const price = product.price || 0;
  const isLowStock = product.availability !== "in_stock";
  
  // Base TTL
  let ttlHours = 3;
  if (price > 500000) ttlHours = 1;
  else if (price < 100000) ttlHours = 6;
  
  // Hit-based adjustment (popular requests live longer)
  if (hits > 10) ttlHours *= 2;
  if (hits > 50) ttlHours *= 3;

  // Availability adjustment
  if (isLowStock) ttlHours = 0.5;
  
  return ttlHours * 60 * 60 * 1000;
};

const getRelevanceScore = (product: any, query: string, normalizedKey: string, userPrefs?: any) => {
  let score = 0;
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  
  // Personalization
  if (userPrefs) {
    if (userPrefs.brands?.includes(product.brand)) score += 5;
    if (userPrefs.categories?.includes(product.categoryId)) score += 5;
  }

  // Keyword matches
  if (name.includes(query) || brand.includes(query)) score += 10;
  if (product.featured) score += 5;
  if (product.availability === "in_stock") score += 3;
  
  // Price extraction from query
  const priceMatch = query.match(/(\d+)\s*(?:тг|₸|тенге|тыс|k)/i);
  if (priceMatch) {
    let targetPrice = parseInt(priceMatch[1]);
    if (query.includes("тыс") || query.includes("k")) targetPrice *= 1000;
    const productPrice = parseFloat(product.price);
    const diff = Math.abs(productPrice - targetPrice) / targetPrice;
    if (diff < 0.2) score += 10; // Close to budget
    else if (diff < 0.5) score += 5;
  }
  
  return score;
};

// Admin procedure with server-side validation
const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  const adminToken = (ctx.req as any).cookies?.admin_token;
  if (!adminToken || typeof adminToken !== 'string' || adminToken.length === 0) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Admin authentication
  admin: router({
    login: publicProcedure
      .input(z.object({ 
        username: z.string().min(1).max(50), 
        password: z.string().min(1).max(100) 
      }))
      .mutation(({ input, ctx }) => {
        const username = input.username.trim();
        const password = input.password.trim();
        
        if (username === ENV.adminUsername && password === ENV.adminPassword) {
          const cookieOptions = getSessionCookieOptions(ctx.req);
          const adminToken = nanoid();
          ctx.res.cookie("admin_token", adminToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
          return { success: true, token: adminToken };
        }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный логин или пароль" });
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("admin_token", { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    isAuthenticated: publicProcedure.query(({ ctx }) => {
      const adminToken = (ctx.req as any).cookies?.admin_token;
      return { authenticated: !!adminToken };
    }),

    scrapeKaspiImage: adminProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const response = await axios.get(input.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
          });

          const html = response.data;
          
          // 1. Try OG image (most reliable for product pages)
          const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                               html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
          
          if (ogImageMatch && ogImageMatch[1]) {
            const imgUrl = ogImageMatch[1];
            const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
            const base64 = Buffer.from(imgResponse.data, 'binary').toString('base64');
            const mimeType = imgResponse.headers['content-type'] || 'image/jpeg';
            return { imageUrl: `data:${mimeType};base64,${base64}` };
          }

          // 2. Try Twitter image
          const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
          if (twitterImageMatch && twitterImageMatch[1]) {
            const imgUrl = twitterImageMatch[1];
            const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
            const base64 = Buffer.from(imgResponse.data, 'binary').toString('base64');
            const mimeType = imgResponse.headers['content-type'] || 'image/jpeg';
            return { imageUrl: `data:${mimeType};base64,${base64}` };
          }

          // 3. Fallback: search for product image classes or IDs
          // Kaspi often has images in galleries
          const galleryMatch = html.match(/item__slider-image[^>]*src=["']([^"']+)["']/i);
          if (galleryMatch && galleryMatch[1]) {
            const imgUrl = galleryMatch[1];
            const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
            const base64 = Buffer.from(imgResponse.data, 'binary').toString('base64');
            const mimeType = imgResponse.headers['content-type'] || 'image/jpeg';
            return { imageUrl: `data:${mimeType};base64,${base64}` };
          }

          throw new Error("Изображение не найдено на странице");
        } catch (error) {
          console.error("[Scrape Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Не удалось получить изображение по ссылке. Проверьте ссылку или загрузите фото вручную."
          });
        }
      }),

    scrapeKaspiDetails: adminProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const response = await axios.get(input.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 7000
          });

          const html = response.data;
          
          // 1. Extract Name
          const titleMatch = html.match(/<h1[^>]*class=["']item__card-title["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                             html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
          let name = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : "";
          
          // 2. Extract Price
          const priceMatch = html.match(/["']price["']\s*:\s*(\d+)/i) || 
                             html.match(/class=["']item__price-now["'][^>]*>([\s\S]*?)<\/div>/i);
          let price = "";
          if (priceMatch) {
            price = priceMatch[1].replace(/[^\d]/g, '');
          }

          // 3. Extract Specs
          const specs: Record<string, string> = {};
          
          // Helper to find spec by common keywords
          const findSpec = (keywords: string[]) => {
            for (const kw of keywords) {
              const regex = new RegExp(`${kw}[:\s]*<\/span>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>`, 'i');
              const match = html.match(regex);
              if (match) return match[1].replace(/<[^>]*>/g, '').trim();
            }
            return "";
          };

          // Broad spec parsing
          const specItemRegex = /<dl[^>]*class=["']specifications-list__spec["'][^>]*>[\s\S]*?<dt[^>]*>([\s\S]*?)<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/gi;
          let match;
          while ((match = specItemRegex.exec(html)) !== null) {
            const key = match[1].replace(/<[^>]*>/g, '').trim().toLowerCase();
            const val = match[2].replace(/<[^>]*>/g, '').trim();
            
            if (key.includes("процессор") || key.includes("cpu")) specs.cpu = val;
            else if (key.includes("оперативная память") || key.includes("ram")) specs.ram = val;
            else if (key.includes("накопитель") || key.includes("ssd") || key.includes("hdd")) specs.storage = val;
            else if (key.includes("видеокарта") || key.includes("gpu")) specs.gpu = val;
            else if (key.includes("экран") || key.includes("диагональ")) specs.display = val;
            else if (key.includes("операционная система") || key.includes("ось")) specs.os = val;
          }

          // 4. Extract Brand (usually from breadcrumbs or title)
          let brand = "";
          const brandMatch = name.match(/^(apple|asus|hp|lenovo|acer|msi|dell|huawei|samsung|honor)/i);
          if (brandMatch) brand = brandMatch[1];

          // 5. Image (use existing logic or just return URL for frontend to handle)
          let imageUrl = "";
          const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
          if (ogImageMatch) imageUrl = ogImageMatch[1];

          return { 
            name, 
            price, 
            specs, 
            brand,
            imageUrl
          };
        } catch (error) {
          console.error("[Scrape Details Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Не удалось получить данные о товаре. Проверьте ссылку."
          });
        }
      }),
  }),

  // Brands
  brands: router({
    list: publicProcedure.query(() => db.getAllBrands()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getBrandById(input)),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        logo: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await db.createBrand({
            ...input,
            name: input.name.trim(),
          });
        } catch (error: any) {
          const errorMsg = error.message || "";
          const causeMsg = error.cause?.message || "";
          const fullError = `${errorMsg} ${causeMsg}`.toLowerCase();
          
          if (
            fullError.includes("unique constraint failed") || 
            fullError.includes("sqlite_constraint_unique") ||
            error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
            error.cause?.code === "SQLITE_CONSTRAINT_UNIQUE"
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Бренд с таким названием уже существует."
            });
          }
          throw error;
        }
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          logo: z.string().optional(),
          description: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateBrand(input.id, input.data)),
    delete: adminProcedure
      .input(z.number())
      .mutation(({ input }) => db.deleteBrand(input)),
  }),

  // Products
  products: router({
    list: publicProcedure.query(() => db.getAllProducts()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getProductById(input)),
    getByCategory: publicProcedure.input(z.string()).query(({ input }) => db.getProductsByCategory(input)),
    getByBrandId: publicProcedure.input(z.number()).query(({ input }) => db.getProductsByBrandId(input)),
    getByModel: publicProcedure.input(z.object({ brandId: z.number(), model: z.string() })).query(({ input }) => db.getProductsByModel(input.brandId, input.model)),
    search: publicProcedure.input(z.string().min(1).max(100)).query(({ input }) => db.searchProducts(input)),
    featured: publicProcedure.query(() => db.getFeaturedProducts()),
    create: adminProcedure
      .input(z.object({
        categoryId: z.string(),
        brandId: z.number(),
        name: z.string(),
        brand: z.string(),
        model: z.string().optional(),
        price: z.string(),
        discountPrice: z.string().optional(),
        description: z.string().optional(),
        specs: z.any().optional(),
        images: z.array(z.string()).optional(),
        videoUrl: z.string().optional(),
        availability: z.enum(["in_stock", "out_of_stock", "coming_soon"]).optional(),
        kaspiLink: z.string().optional(),
        featured: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await db.createProduct({
            categoryId: input.categoryId,
            brandId: input.brandId,
            name: input.name.trim(),
            brand: input.brand.trim(),
            model: (input.model || "Standard").trim(),
            price: input.price as any,
            discountPrice: input.discountPrice as any,
            description: input.description,
            specs: input.specs,
            images: input.images || [],
            videoUrl: input.videoUrl,
            availability: input.availability || "in_stock",
            kaspiLink: input.kaspiLink,
            featured: input.featured || false,
          });
        } catch (error: any) {
          const errorMsg = error.message || "";
          const causeMsg = error.cause?.message || "";
          const fullError = `${errorMsg} ${causeMsg}`.toLowerCase();
          
          if (
            fullError.includes("unique constraint failed") || 
            fullError.includes("sqlite_constraint_unique") ||
            error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
            error.cause?.code === "SQLITE_CONSTRAINT_UNIQUE"
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Товар с таким названием уже существует."
            });
          }
          throw error;
        }
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          categoryId: z.string().optional(),
          brandId: z.number().optional(),
          name: z.string().optional(),
          brand: z.string().optional(),
          model: z.string().optional(),
          price: z.string().optional(),
          discountPrice: z.string().optional(),
          description: z.string().optional(),
          specs: z.any().optional(),
          images: z.array(z.string()).optional(),
          videoUrl: z.string().optional(),
          availability: z.enum(["in_stock", "out_of_stock", "coming_soon"]).optional(),
          kaspiLink: z.string().optional(),
          featured: z.boolean().optional(),
        }),
      }))
      .mutation(({ input }) => {
        return db.updateProduct(input.id, input.data as any);
      }),
    delete: adminProcedure
      .input(z.number())
      .mutation(({ input }) => {
        return db.deleteProduct(input);
      }),
    updateAllKaspiLink: adminProcedure
      .input(z.string().url())
      .mutation(({ input }) => db.updateAllKaspiLink(input)),
    toggleFeatured: adminProcedure
      .input(z.object({
        id: z.number(),
        isFeatured: z.boolean(),
      }))
      .mutation(({ input }) => db.toggleFeatured(input.id, input.isFeatured)),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(() => db.getAllCategories()),
    getById: publicProcedure.input(z.string()).query(({ input }) => db.getCategoryById(input)),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        icon: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await db.createCategory({
            ...input,
            name: input.name.trim(),
            slug: input.slug.trim(),
          });
        } catch (error: any) {
          const errorMsg = error.message || "";
          const causeMsg = error.cause?.message || "";
          const fullError = `${errorMsg} ${causeMsg}`.toLowerCase();
          
          if (
            fullError.includes("unique constraint failed") || 
            fullError.includes("sqlite_constraint_unique") ||
            error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
            error.cause?.code === "SQLITE_CONSTRAINT_UNIQUE"
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Категория с таким названием или ссылкой уже существует. Пожалуйста, измените существующую категорию вместо создания новой."
            });
          }
          throw error;
        }
      }),
    update: adminProcedure
      .input(z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          icon: z.string().optional(),
          description: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => {
        return db.updateCategory(input.id, input.data);
      }),
    delete: adminProcedure
      .input(z.string())
      .mutation(({ input }) => {
        return db.deleteCategory(input);
      }),
  }),

  // Cart
  cart: router({
    getItems: publicProcedure
      .input(z.string())
      .query(({ input }) => db.getCartItems(input)),
    addItem: publicProcedure
      .input(z.object({
        productId: z.number(),
        sessionId: z.string(),
        quantity: z.number().optional(),
      }))
      .mutation(({ input }) => db.addToCart({
        productId: input.productId,
        sessionId: input.sessionId,
        quantity: input.quantity || 1,
      })),
    updateItem: publicProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number(),
      }))
      .mutation(({ input }) => db.updateCartItem(input.id, input.quantity)),
    removeItem: publicProcedure
      .input(z.number())
      .mutation(({ input }) => db.removeFromCart(input)),
    clear: publicProcedure
      .input(z.string())
      .mutation(({ input }) => db.clearCart(input)),
  }),

  // Reviews
  reviews: router({
    getByProductId: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getReviewsByProductId(input)),
    getAverageRating: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getAverageRating(input)),
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().min(1).max(255),
        comment: z.string().optional(),
        authorName: z.string().min(1).max(255),
        authorEmail: z.string().email().optional(),
      }))
      .mutation(({ input }) => {
        return db.createReview({
          productId: input.productId,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
          authorName: input.authorName,
          authorEmail: input.authorEmail,
          verified: false,
          helpful: 0,
        });
      }),
  }),

  // AI Assistant
  ai: router({
    test: publicProcedure.mutation(async () => {
      try {
        console.log("[AI Test] Calling LLM...");
        const response = await invokeLLM({
          messages: [{ role: "user", content: "Привет! Ты работаешь?" }],
        });
        return { message: response.choices[0].message.content };
      } catch (error: any) {
        console.error("[AI Test] Error:", error);
        return { error: error.message };
      }
    }),
    chat: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        let limitedProducts: any[] = [];
        let aiUsed = false;
        let reason = "";
        let confidenceScore = 0;
        let finalResponse = "";
        let savings = 0;
        const abTestGroup = Math.random() < 0.2 ? "ai_forced" : "optimized";
        const startTime = Date.now();
        
        const userIp = ctx.req.ip || "anonymous";
        const rawMessage = input.messages[input.messages.length - 1]?.content || "";

        try {
          const { key: normalizedKey, budget } = normalizeInput(rawMessage);

          if (rawMessage.length < 5 || normalizedKey.length < 3) {
            return { message: "Пожалуйста, напишите более подробный запрос." };
          }
          
          // 1. Caching & Adaptive TTL
          const cached = aiCache.get(normalizedKey);
          if (cached) {
            cached.hits++; // Track frequency
            // Dynamic check will happen after getting products
          }

          // 2. Rate Limiting
          const isAdmin = !!(ctx.req as any).cookies?.admin_token;
          const isAuth = !!ctx.user;
          const userLimit = isAdmin ? LIMITS.ADMIN : (isAuth ? LIMITS.AUTH : LIMITS.GUEST);

          const now = Date.now();
          const userStats = userRequestCounts.get(userIp) || { count: 0, lastReset: now, lastRequestTime: 0 };
          
          if (now - userStats.lastRequestTime < FREQUENCY_LIMIT && !isAdmin) {
            throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Слишком часто!" });
          }

          if (now - userStats.lastReset > RESET_INTERVAL) {
            userStats.count = 0;
            userStats.lastReset = now;
          }

          if (userStats.count >= userLimit && !isAdmin) {
            throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Лимит запросов исчерпан." });
          }
          userStats.lastRequestTime = now;

          // 3. Personalized Filtering & Sorting
          const products = await db.getAllProducts();
          const query = rawMessage.toLowerCase();
          
          // Basic personalization (can be expanded with actual user history from DB)
          const userPrefs = isAuth ? { brands: [], categories: [] } : undefined;

          limitedProducts = products
            .map(p => ({ ...p, score: getRelevanceScore(p, query, normalizedKey, userPrefs) }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

          if (limitedProducts.length === 0) {
            limitedProducts = products.filter(p => p.featured).slice(0, 3);
          }

          // 4. Adaptive TTL Check
          const top1 = limitedProducts[0];
          const currentTTL = top1 ? getAdaptiveTTL(top1, cached?.hits || 0) : 3 * 60 * 60 * 1000;
          
          if (cached && (now - cached.timestamp < currentTTL)) {
            console.log(`[AI Cache] Adaptive hit: ${normalizedKey} (TTL: ${currentTTL/1000/60}m)`);
            return { message: cached.response };
          }

          // 5. Confidence & Simple Scenario Logic
          const top2 = limitedProducts[1];
          confidenceScore = top2 ? top1.score / top2.score : 10;
          const isSimpleScenario = budget > 0 && budget < 100000; // Hardcoded simple scenario: cheap budget
          const isHighConfidence = top1.score >= 10 && (confidenceScore > 1.3 || !top2);

          if (abTestGroup === "optimized") {
            if (isSimpleScenario || isHighConfidence) {
              aiUsed = true; // Still use AI for "normal" feeling answers
              reason = isSimpleScenario ? "simple_scenario" : "high_confidence";
              savings = 0.5; // Partial savings logic if needed, but we want quality
            } else {
              aiUsed = true;
              reason = "low_confidence";
            }
          } else {
            aiUsed = true;
            reason = "ab_test_forced";
          }

          if (aiUsed) {
            const productsContext = limitedProducts.map(p => {
              const specs = p.specs ? (typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs) : {};
              const specsStr = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(", ");
              return { 
                name: p.name, 
                price: p.price, 
                specs: specsStr,
                available: p.availability === "in_stock" ? "В наличии" : "Под заказ"
              };
            });

            const shopInfo = `
Магазин: Terabayt.kz
Доставка: По Алматы день в день, по Казахстану 2-5 дней (надежные курьерские службы).
Гарантия: Официальная гарантия 12 месяцев на всю технику.
Рассрочка: 0-0-12 и 0-0-24 через Kaspi Red, Kaspi Bank и Halyk Bank без переплат.
Бонус: При покупке ноутбука/компьютера - бесплатная установка Windows, драйверов и Office (базовый пакет программ) в подарок.
Адреса: 
● Алматы: ул. Сауранбаева, 5
● Шымкент (Аксу): ул. Абылай Хана, 58А
Контакты: +7 707 200 22 25 (WhatsApp).
Соцсети:
● Instagram: @terabayt.kz_aksu
● TikTok: @terabayt.kz
Миссия: Качественная техника должна быть доступной. Помогаем найти надежного помощника для работы, творчества и развлечений.
`;

            const systemPrompt = `Ты — TERABOT, эксперт-консультант магазина электроники Terabayt.kz. 
Твоя цель: помогать клиентам выбирать технику, отвечать логично, вежливо и профессионально.

ПРАВИЛА:
1. Используй предоставленный список ТОВАРОВ для рекомендаций.
2. ВАЖНО: Используй символ ● для любых списков, перечислений или выделения товаров. НИКОГДА не используй символ * или дефис - для списков.
3. ВАЖНО: Никогда не выводи ссылки (URL, http/https) в своем ответе. Используй только названия и текстовую информацию.
4. Всегда добавляй символ ● перед названием любого ноутбука (например: ●Ноутбук HP...).
4. Если в списке есть подходящий товар, кратко объясни, почему он подходит (по характеристикам).
5. Если товара нет в наличии, так и скажи, предложи вариант "под заказ".
6. Используй ИНФОРМАЦИЮ О МАГАЗИНЕ для ответов на вопросы о доставке, гарантии или адресах.
7. Пиши живым, человеческим языком. Не будь роботом.
8. Ответ должен быть лаконичным (2-3 предложения), но информативным.

ИНФОРМАЦИЯ О МАГАЗИНЕ: ${shopInfo}
ТОВАРЫ: ${JSON.stringify(productsContext)}`;

            const response = await invokeLLM({
              messages: [
                { role: "system", content: systemPrompt },
                ...input.messages.slice(-3) // Даем контекст последних 3 сообщений для логичности диалога
              ],
            });
            finalResponse = response.choices[0].message.content as string;
            userStats.count++;
          }

          aiCache.set(normalizedKey, { response: finalResponse, timestamp: now, hits: (cached?.hits || 0) + 1 });
          userRequestCounts.set(userIp, userStats);

          // 6. Logging to DB for Analytics
          try {
            const database = await db.getDb();
            await database.insert(aiLogs).values({
              userId: userIp,
              query: rawMessage,
              normalizedKey,
              aiUsed,
              reason,
              confidenceScore,
              response: finalResponse,
              savings,
              abTestGroup,
              responseTime: Date.now() - startTime
            });
          } catch (logErr) {
            console.error("[AI Chat] Log save error:", logErr);
          }

          return { message: finalResponse };
        } catch (error) {
          console.error("[AI Chat] Error:", error);
          if (limitedProducts.length > 0) {
            return { message: `Вот подходящие варианты:\n${limitedProducts.map(p => `● ${p.name} (${p.price} ₸)`).join("\n")}` };
          }
          if (error instanceof TRPCError) throw error;
          return { message: "Попробуйте позже." };
        }
      }),

    getAiStats: publicProcedure
      .query(async () => {
        const database = await db.getDb();
        const logs = await database.select().from(aiLogs);
        
        const total = logs.length;
        if (total === 0) return { total: 0 };

        const aiUsedCount = logs.filter(l => l.aiUsed).length;
        const savings = logs.reduce((acc, curr) => acc + curr.savings, 0);
        
        return {
          total,
          aiUsagePercent: ((aiUsedCount / total) * 100).toFixed(1) + "%",
          noAiPercent: (((total - aiUsedCount) / total) * 100).toFixed(1) + "%",
          totalSavings: savings,
          avgResponseTime: (logs.reduce((acc, curr) => acc + (curr.responseTime || 0), 0) / total).toFixed(0) + "ms"
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
