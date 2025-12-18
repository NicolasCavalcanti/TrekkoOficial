import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions with all required exports
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({}),
  getTrails: vi.fn().mockResolvedValue({ trails: [], total: 0 }),
  getTrailById: vi.fn().mockResolvedValue({ id: 1, name: "Test Trail", city: "Rio", uf: "RJ", difficulty: "moderate" }),
  getExpeditionsByTrailId: vi.fn().mockResolvedValue([]),
  getExpeditions: vi.fn().mockResolvedValue({ expeditions: [], total: 0 }),
  getGuides: vi.fn().mockResolvedValue({ guides: [], total: 0 }),
  getGuideById: vi.fn().mockResolvedValue(null),
  getGuideProfile: vi.fn().mockResolvedValue(null),
  getGuideExpeditions: vi.fn().mockResolvedValue([]),
  getUserFavorites: vi.fn().mockResolvedValue([]),
  isFavorite: vi.fn().mockResolvedValue(false),
  addFavorite: vi.fn().mockResolvedValue(undefined),
  removeFavorite: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("trails.list", () => {
  it("returns trails list for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trails.list({});

    expect(result).toHaveProperty("trails");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.trails)).toBe(true);
  });

  it("accepts search filters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trails.list({
      search: "test",
      uf: "RJ",
      difficulty: "moderate",
      page: 1,
      limit: 10,
    });

    expect(result).toHaveProperty("trails");
    expect(result).toHaveProperty("total");
  });
});

describe("trails.getById", () => {
  it("returns trail details for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trails.getById({ id: 1 });

    expect(result).toHaveProperty("trail");
    expect(result.trail).toHaveProperty("name");
  });
});

describe("favorites", () => {
  it("requires authentication to list favorites", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.favorites.list()).rejects.toThrow();
  });

  it("allows authenticated users to list favorites", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("requires authentication to add favorites", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.favorites.add({ trailId: 1 })).rejects.toThrow();
  });

  it("allows authenticated users to add favorites", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.add({ trailId: 1 });

    expect(result).toHaveProperty("success");
  });

  it("requires authentication to check favorites", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.favorites.check({ trailId: 1 })).rejects.toThrow();
  });

  it("allows authenticated users to check favorites", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.check({ trailId: 1 });

    expect(typeof result).toBe("boolean");
  });
});

describe("expeditions.list", () => {
  it("returns expeditions list for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.list({});

    expect(result).toHaveProperty("expeditions");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.expeditions)).toBe(true);
  });
});

describe("guides.list", () => {
  it("returns guides list for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.guides.list({});

    expect(result).toHaveProperty("guides");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.guides)).toBe(true);
  });
});
