import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
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
  getAdminMetrics: vi.fn().mockResolvedValue({ trails: 10, expeditions: 5, guides: 3, reservations: 20, revenue: 1500 }),
  getSystemEvents: vi.fn().mockResolvedValue([]),
  createSystemEvent: vi.fn().mockResolvedValue(undefined),
  seedSampleData: vi.fn().mockResolvedValue(undefined),
  seedInitialData: vi.fn().mockResolvedValue(undefined),
  getAllExpeditions: vi.fn().mockResolvedValue({ expeditions: [], total: 0 }),
  updateExpedition: vi.fn().mockResolvedValue(undefined),
  deleteExpedition: vi.fn().mockResolvedValue(undefined),
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

function createUserContext(): TrpcContext {
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

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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

describe("admin.metrics", () => {
  it("denies access to unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.metrics()).rejects.toThrow();
  });

  it("denies access to regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.metrics()).rejects.toThrow();
  });

  it("allows admin users to view metrics", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.metrics();

    expect(result).toHaveProperty("trails");
    expect(result).toHaveProperty("expeditions");
    expect(result).toHaveProperty("guides");
    expect(result).toHaveProperty("reservations");
    expect(result).toHaveProperty("revenue");
  });
});

describe("admin.events", () => {
  it("denies access to unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.events({ limit: 10 })).rejects.toThrow();
  });

  it("denies access to regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.events({ limit: 10 })).rejects.toThrow();
  });

  it("allows admin users to view events", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.events({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin.seedData", () => {
  it("denies access to regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.seedData()).rejects.toThrow();
  });

  it("allows admin users to seed data", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.seedData();

    expect(result).toHaveProperty("success");
  });
});

describe("admin.expeditions", () => {
  it("denies list access to regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.expeditions.list({ page: 1, limit: 10 })).rejects.toThrow();
  });

  it("allows admin to list expeditions", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.expeditions.list({ page: 1, limit: 10 });

    expect(result).toHaveProperty("expeditions");
    expect(result).toHaveProperty("total");
  });
});
