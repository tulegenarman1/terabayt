import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Reviews API", () => {
  const testProductId = 1;
  const testReview = {
    productId: testProductId,
    rating: 5,
    title: "Отличный ноутбук!",
    comment: "Очень доволен покупкой. Быстрый, тихий, красивый.",
    authorName: "Иван Петров",
    authorEmail: "ivan@example.com",
  };

  describe("reviews.create", () => {
    it("should create a review with valid data", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.create(testReview);
      expect(result).toBeDefined();
    });

    it("should reject review with invalid rating (< 1)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.create({
          ...testReview,
          rating: 0,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("rating");
      }
    });

    it("should reject review with invalid rating (> 5)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.create({
          ...testReview,
          rating: 6,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("rating");
      }
    });

    it("should reject review with empty title", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.create({
          ...testReview,
          title: "",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("title");
      }
    });

    it("should reject review with empty author name", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.create({
          ...testReview,
          authorName: "",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("authorName");
      }
    });

    it("should accept review with optional email", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const reviewWithoutEmail = {
        ...testReview,
        authorEmail: undefined,
      };
      const result = await caller.reviews.create(reviewWithoutEmail);
      expect(result).toBeDefined();
    });

    it("should reject review with invalid email format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.create({
          ...testReview,
          authorEmail: "not-an-email",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("email");
      }
    });

    it("should validate title length (max 255 chars)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const longTitle = "A".repeat(256);
      try {
        await caller.reviews.create({
          ...testReview,
          title: longTitle,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("title");
      }
    });

    it("should validate author name length (max 255 chars)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const longName = "A".repeat(256);
      try {
        await caller.reviews.create({
          ...testReview,
          authorName: longName,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("authorName");
      }
    });

    it("should accept all valid rating values (1-5)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      for (let rating = 1; rating <= 5; rating++) {
        const result = await caller.reviews.create({
          ...testReview,
          rating,
          title: `Review with rating ${rating}`,
        });
        expect(result).toBeDefined();
      }
    });
  });

  describe("reviews.getByProductId", () => {
    it("should return array of reviews for a product", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getByProductId(testProductId);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for product with no reviews", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getByProductId(99999);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("reviews.getAverageRating", () => {
    it("should return average rating and count", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getAverageRating(testProductId);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("avgRating");
      expect(result).toHaveProperty("count");
    });

    it("should return 0 rating for product with no reviews", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getAverageRating(99999);
      expect(result.avgRating).toBe(0);
      expect(result.count).toBe(0);
    });

    it("should calculate correct average rating", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getAverageRating(testProductId);
      if (result.count > 0) {
        expect(result.avgRating).toBeGreaterThan(0);
        expect(result.avgRating).toBeLessThanOrEqual(5);
      }
    });
  });
});
