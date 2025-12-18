import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getUserByEmail: vi.fn(),
  getUserByCadastur: vi.fn(),
  createUserWithPassword: vi.fn(),
  createGuideProfile: vi.fn(),
  createSystemEvent: vi.fn(),
  updateUserProfile: vi.fn(),
  seedInitialData: vi.fn(),
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password"),
  compare: vi.fn(),
}));

import * as db from "./db";
import * as bcrypt from "bcryptjs";

function createPublicContext(): TrpcContext {
  const cookies: Record<string, { value: string; options: Record<string, unknown> }> = {};
  
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies[name] = { value, options };
      },
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a new trekker successfully", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(db.createUserWithPassword).mockResolvedValue({ id: 1, openId: "email_123_abc" });
    vi.mocked(db.createSystemEvent).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      userType: "trekker",
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe(1);
    expect(db.getUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(db.createUserWithPassword).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed_password",
      userType: "trekker",
      cadasturNumber: undefined,
      cadasturValidated: 0,
    });
    expect(db.createSystemEvent).toHaveBeenCalledWith({
      type: "USER_REGISTERED",
      message: "Novo trekker cadastrado: Test User",
      severity: "info",
      actorId: 1,
    });
  });

  it("rejects registration with existing email", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 1,
      openId: "existing",
      email: "test@example.com",
      name: "Existing User",
      passwordHash: "hash",
      loginMethod: "email",
      role: "user",
      userType: "trekker",
      bio: null,
      photoUrl: null,
      cadasturNumber: null,
      cadasturValidated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        userType: "trekker",
      })
    ).rejects.toThrow("E-mail já cadastrado");
  });

  it("registers a new guide with CADASTUR", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);
    vi.mocked(db.createUserWithPassword).mockResolvedValue({ id: 2, openId: "email_456_def" });
    vi.mocked(db.createGuideProfile).mockResolvedValue(undefined);
    vi.mocked(db.createSystemEvent).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      name: "Guide User",
      email: "guide@example.com",
      password: "password123",
      userType: "guide",
      cadasturNumber: "123456789",
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe(2);
    expect(db.getUserByCadastur).toHaveBeenCalledWith("123456789");
    expect(db.createUserWithPassword).toHaveBeenCalledWith({
      name: "Guide User",
      email: "guide@example.com",
      passwordHash: "hashed_password",
      userType: "guide",
      cadasturNumber: "123456789",
      cadasturValidated: 1,
    });
    expect(db.createGuideProfile).toHaveBeenCalled();
    expect(db.createSystemEvent).toHaveBeenCalledWith({
      type: "GUIDE_REGISTERED",
      message: "Novo guia cadastrado: Guide User",
      severity: "info",
      actorId: 2,
    });
  });

  it("rejects guide registration without CADASTUR", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Guide User",
        email: "guide@example.com",
        password: "password123",
        userType: "guide",
      })
    ).rejects.toThrow("Número CADASTUR é obrigatório para guias");
  });

  it("rejects guide registration with already used CADASTUR", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(db.getUserByCadastur).mockResolvedValue({
      id: 1,
      openId: "existing",
      email: "other@example.com",
      name: "Other Guide",
      passwordHash: "hash",
      loginMethod: "email",
      role: "user",
      userType: "guide",
      bio: null,
      photoUrl: null,
      cadasturNumber: "123456789",
      cadasturValidated: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Guide User",
        email: "guide@example.com",
        password: "password123",
        userType: "guide",
        cadasturNumber: "123456789",
      })
    ).rejects.toThrow("CADASTUR já vinculado a outra conta");
  });
});

describe("auth.validateCadastur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates a new CADASTUR number", async () => {
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.validateCadastur({
      cadasturNumber: "123456789",
    });

    expect(result.valid).toBe(true);
    expect(result.cadasturNumber).toBe("123456789");
  });

  it("rejects already used CADASTUR", async () => {
    vi.mocked(db.getUserByCadastur).mockResolvedValue({
      id: 1,
      openId: "existing",
      email: "guide@example.com",
      name: "Existing Guide",
      passwordHash: "hash",
      loginMethod: "email",
      role: "user",
      userType: "guide",
      bio: null,
      photoUrl: null,
      cadasturNumber: "123456789",
      cadasturValidated: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.validateCadastur({
        cadasturNumber: "123456789",
      })
    ).rejects.toThrow("CADASTUR já vinculado a outra conta");
  });

  it("rejects invalid CADASTUR format", async () => {
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.validateCadastur({
        cadasturNumber: "123",
      })
    ).rejects.toThrow("CADASTUR inválido ou não encontrado");
  });
});

describe("auth.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in a user with correct credentials", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 1,
      openId: "email_123_abc",
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashed_password",
      loginMethod: "email",
      role: "user",
      userType: "trekker",
      bio: null,
      photoUrl: null,
      cadasturNumber: null,
      cadasturValidated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(db.updateUserProfile).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe(1);
    expect(db.updateUserProfile).toHaveBeenCalled();
  });

  it("rejects login with wrong password", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 1,
      openId: "email_123_abc",
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashed_password",
      loginMethod: "email",
      role: "user",
      userType: "trekker",
      bio: null,
      photoUrl: null,
      cadasturNumber: null,
      cadasturValidated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "test@example.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("E-mail ou senha incorretos");
  });

  it("rejects login with non-existent email", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "nonexistent@example.com",
        password: "password123",
      })
    ).rejects.toThrow("E-mail ou senha incorretos");
  });
});
