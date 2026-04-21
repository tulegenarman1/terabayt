import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Admin Authentication", () => {
  it("should reject login with wrong credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.login({ username: "wrong", password: "wrong" });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should accept login with correct credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.login({ username: "terabaytkz", password: "terabayt8283" });
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });
});

describe("API Structure", () => {
  it("should have all required procedures", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    expect(caller.products).toBeDefined();
    expect(caller.products.list).toBeDefined();
    expect(caller.products.search).toBeDefined();
    expect(caller.products.featured).toBeDefined();
    expect(caller.products.create).toBeDefined();

    expect(caller.categories).toBeDefined();
    expect(caller.categories.list).toBeDefined();
    expect(caller.categories.create).toBeDefined();

    expect(caller.cart).toBeDefined();
    expect(caller.cart.getItems).toBeDefined();
    expect(caller.cart.addItem).toBeDefined();

    expect(caller.admin).toBeDefined();
    expect(caller.admin.login).toBeDefined();
    expect(caller.admin.logout).toBeDefined();
  });
});
