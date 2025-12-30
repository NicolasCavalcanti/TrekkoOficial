import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getGuides: vi.fn(),
  getCadasturByCertificate: vi.fn(),
  getUserByCadastur: vi.fn(),
  getExpeditions: vi.fn(),
}));

import * as db from "./db";

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

describe("guides.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all CADASTUR guides with verification status", async () => {
    const mockGuides = [
      {
        id: 1,
        name: "João Silva",
        cadasturNumber: "12345678",
        uf: "RJ",
        city: "Rio de Janeiro",
        phone: "(21) 99999-9999",
        email: "joao@email.com",
        website: null,
        languages: ["Português", "Inglês"],
        categories: ["Guia de Turismo"],
        segments: ["Ecoturismo"],
        validUntil: new Date("2025-12-31"),
        isVerified: true,
        isDriverGuide: false,
      },
      {
        id: 2,
        name: "Maria Santos",
        cadasturNumber: "87654321",
        uf: "SP",
        city: "São Paulo",
        phone: "(11) 88888-8888",
        email: "maria@email.com",
        website: "www.mariaguia.com.br",
        languages: ["Português"],
        categories: ["Guia de Turismo"],
        segments: ["Turismo de Aventura"],
        validUntil: new Date("2026-06-30"),
        isVerified: false,
        isDriverGuide: true,
      },
    ];

    vi.mocked(db.getGuides).mockResolvedValue({
      guides: mockGuides,
      total: 2,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.guides.list({ page: 1, limit: 12 });

    expect(result.guides).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.guides[0].isVerified).toBe(true);
    expect(result.guides[1].isVerified).toBe(false);
  });

  it("filters guides by state (UF)", async () => {
    vi.mocked(db.getGuides).mockResolvedValue({
      guides: [{
        id: 1,
        name: "João Silva",
        cadasturNumber: "12345678",
        uf: "RJ",
        city: "Rio de Janeiro",
        phone: null,
        email: null,
        website: null,
        languages: null,
        categories: null,
        segments: null,
        validUntil: null,
        isVerified: false,
        isDriverGuide: false,
      }],
      total: 1,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.guides.list({ uf: "RJ", page: 1, limit: 12 });

    expect(db.getGuides).toHaveBeenCalledWith(
      expect.objectContaining({ uf: "RJ" }),
      1,
      12
    );
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0].uf).toBe("RJ");
  });

  it("filters guides by search text (case/accent insensitive)", async () => {
    vi.mocked(db.getGuides).mockResolvedValue({
      guides: [{
        id: 1,
        name: "João Silva",
        cadasturNumber: "12345678",
        uf: "RJ",
        city: "Rio de Janeiro",
        phone: null,
        email: null,
        website: null,
        languages: null,
        categories: null,
        segments: null,
        validUntil: null,
        isVerified: false,
        isDriverGuide: false,
      }],
      total: 1,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Search with lowercase and no accent should still work
    const result = await caller.guides.list({ search: "joao", page: 1, limit: 12 });

    expect(db.getGuides).toHaveBeenCalledWith(
      expect.objectContaining({ search: "joao" }),
      1,
      12
    );
    expect(result.guides).toHaveLength(1);
  });

  it("filters guides by CADASTUR code", async () => {
    vi.mocked(db.getGuides).mockResolvedValue({
      guides: [{
        id: 1,
        name: "João Silva",
        cadasturNumber: "12345678",
        uf: "RJ",
        city: "Rio de Janeiro",
        phone: null,
        email: null,
        website: null,
        languages: null,
        categories: null,
        segments: null,
        validUntil: null,
        isVerified: false,
        isDriverGuide: false,
      }],
      total: 1,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.guides.list({ cadasturCode: "12345678", page: 1, limit: 12 });

    expect(db.getGuides).toHaveBeenCalledWith(
      expect.objectContaining({ cadasturCode: "12345678" }),
      1,
      12
    );
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0].cadasturNumber).toBe("12345678");
  });

  it("combines multiple filters", async () => {
    vi.mocked(db.getGuides).mockResolvedValue({
      guides: [{
        id: 1,
        name: "João Silva",
        cadasturNumber: "12345678",
        uf: "RJ",
        city: "Rio de Janeiro",
        phone: null,
        email: null,
        website: null,
        languages: null,
        categories: null,
        segments: null,
        validUntil: null,
        isVerified: true,
        isDriverGuide: false,
      }],
      total: 1,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.guides.list({ 
      search: "João", 
      uf: "RJ", 
      cadasturCode: "1234",
      page: 1, 
      limit: 12 
    });

    expect(db.getGuides).toHaveBeenCalledWith(
      expect.objectContaining({ search: "João", uf: "RJ", cadasturCode: "1234" }),
      1,
      12
    );
    expect(result.guides).toHaveLength(1);
  });
});

describe("guides.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns CADASTUR guide data with verification status", async () => {
    const mockCadasturData = {
      id: 1,
      certificateNumber: "12345678",
      fullName: "João Silva",
      uf: "RJ",
      city: "Rio de Janeiro",
      phone: "(21) 99999-9999",
      email: "joao@email.com",
      website: null,
      validUntil: new Date("2025-12-31"),
      languages: ["Português", "Inglês"],
      operatingCities: null,
      categories: ["Guia de Turismo"],
      segments: ["Ecoturismo"],
      isDriverGuide: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTrekkoUser = {
      id: 10,
      openId: "user-123",
      name: "João Silva",
      email: "joao@email.com",
      passwordHash: "hash",
      loginMethod: "email",
      role: "user" as const,
      userType: "guide" as const,
      bio: "Guia experiente",
      photoUrl: "https://example.com/photo.jpg",
      cadasturNumber: "12345678",
      cadasturValidated: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    vi.mocked(db.getCadasturByCertificate).mockResolvedValue(mockCadasturData);
    vi.mocked(db.getUserByCadastur).mockResolvedValue(mockTrekkoUser);
    vi.mocked(db.getExpeditions).mockResolvedValue({ expeditions: [], total: 0 });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.guides.getById({ cadasturNumber: "12345678" });

    expect(result.guide.name).toBe("João Silva");
    expect(result.guide.isVerified).toBe(true);
    expect(result.guide.bio).toBe("Guia experiente");
    expect(result.guide.photoUrl).toBe("https://example.com/photo.jpg");
  });

  it("returns CADASTUR guide without Trekko verification", async () => {
    const mockCadasturData = {
      id: 2,
      certificateNumber: "87654321",
      fullName: "Maria Santos",
      uf: "SP",
      city: "São Paulo",
      phone: "(11) 88888-8888",
      email: "maria@email.com",
      website: "www.mariaguia.com.br",
      validUntil: new Date("2026-06-30"),
      languages: ["Português"],
      operatingCities: null,
      categories: ["Guia de Turismo"],
      segments: ["Turismo de Aventura"],
      isDriverGuide: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getCadasturByCertificate).mockResolvedValue(mockCadasturData);
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.guides.getById({ cadasturNumber: "87654321" });

    expect(result.guide.name).toBe("Maria Santos");
    expect(result.guide.isVerified).toBe(false);
    expect(result.guide.isDriverGuide).toBe(true);
    expect(result.guide.bio).toBeNull();
    expect(result.expeditions).toHaveLength(0);
  });

  it("throws error for non-existent CADASTUR number", async () => {
    vi.mocked(db.getCadasturByCertificate).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.guides.getById({ cadasturNumber: "invalid" }))
      .rejects.toThrow("Guide not found");
  });
});
