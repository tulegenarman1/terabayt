import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { nanoid } from "nanoid";

import { ENV } from "./_core/env";
import { invokeLLM, Message } from "./_core/llm";

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
      .mutation(({ input }) => db.createBrand(input)),
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
    getByCategory: publicProcedure.input(z.number()).query(({ input }) => db.getProductsByCategory(input)),
    getByBrandId: publicProcedure.input(z.number()).query(({ input }) => db.getProductsByBrandId(input)),
    getByModel: publicProcedure.input(z.object({ brandId: z.number(), model: z.string() })).query(({ input }) => db.getProductsByModel(input.brandId, input.model)),
    search: publicProcedure.input(z.string().min(1).max(100)).query(({ input }) => db.searchProducts(input)),
    featured: publicProcedure.query(() => db.getFeaturedProducts()),
    create: adminProcedure
      .input(z.object({
        categoryId: z.number(),
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
      .mutation(({ input }) => {
        return db.createProduct({
          categoryId: input.categoryId,
          brandId: input.brandId,
          name: input.name,
          brand: input.brand,
          model: input.model || "Standard",
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
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          categoryId: z.number().optional(),
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
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getCategoryById(input)),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => {
        return db.createCategory(input);
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => {
        return db.updateCategory(input.id, input.data);
      }),
    delete: adminProcedure
      .input(z.number())
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
      .mutation(async ({ input }) => {
        try {
          console.log("[AI Chat] Request received, fetching products...");
          const products = await db.getAllProducts();
          const categories = await db.getAllCategories();
          
          console.log(`[AI Chat] Found ${products.length} products and ${categories.length} categories`);

          const productsContext = products.slice(0, 50).map(p => ({
            name: p.name,
            price: p.price,
            brand: p.brand,
            specs: p.specs ? (typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs) : {},
            availability: p.availability,
            link: `https://terabayt.kz/product/${p.id}`
          }));

          const systemPrompt = `Вы — эксперт-консультант магазина Terabayt.kz. Ваша задача — помочь пользователю подобрать идеальную электронику, компьютерную технику или смартфоны из нашего ассортимента, а также отвечать на вопросы о магазине.

КОНТАКТНАЯ ИНФОРМАЦИЯ:
- Адрес в Алматы: ул. Сауранбаева, 5
- Адрес в Шымкенте (Аксу): ул. Абылай Хана, 58А
- WhatsApp: +7 707 200 22 25
- Instagram: @terabayt.kz_aksu
- TikTok: @terabayt.kz

ИНФОРМАЦИЯ О МАГАЗИНЕ:
- Terabayt.kz — ведущий магазин электроники и компьютерной техники в Казахстане.

ПРЕИМУЩЕСТВА:
- Гарантия: Официальная гарантия 12 месяцев на всю электронику, смартфоны и принтеры.
- Доставка: Быстрая доставка по всему Казахстану.
- Бонус: При покупке компьютера или ноутбука бесплатно устанавливаем Windows, драйверы и базовый пакет программ (Office, антивирус) в подарок.

ВАШИ ПРАВИЛА:
1. Будьте вежливы, профессиональны и отвечайте максимально КРАТКО и по делу.
2. Не пишите длинных приветствий или лишнего текста, если пользователь не просит подробного объяснения.
3. Рекомендуйте только те товары, которые есть в нашем списке (контексте).
4. Если пользователь спрашивает о чем-то, чего нет в ассортименте, вежливо сообщите об этом и предложите ближайшую альтернативу.
5. Учитывайте бюджет пользователя и его цели (игры, работа, учеба, дизайн).
6. Дайте краткое обоснование, почему вы рекомендуете именно эту модель.
7. Отвечайте на языке пользователя (русский или казахский).
8. Если вы рекомендуете товар, обязательно указывайте его цену и основные характеристики.
9. Всегда предоставляйте контактные данные, если пользователь спрашивает, как с вами связаться или где вы находитесь.
10. Подробные и длинные ответы давайте ТОЛЬКО если пользователь просит сравнить товары или детально рассказать о характеристиках.

ДОСТУПНЫЕ ТОВАРЫ (первые 50):
${JSON.stringify(productsContext, null, 2)}

КАТЕГОРИИ:
${categories.map(c => c.name).join(", ")}

Начните диалог с приветствия, если это первое сообщение. Помогайте пользователю найти именно то, что ему нужно.`;

          console.log("[AI Chat] Invoking LLM...");
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              ...input.messages.map(m => ({ role: m.role as any, content: m.content }))
            ],
          });

          console.log("[AI Chat] LLM response received successfully");
          return {
            message: response.choices[0].message.content,
          };
        } catch (error) {
          console.error("[AI Chat] Error in mutation:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Произошла ошибка при работе с ИИ",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
