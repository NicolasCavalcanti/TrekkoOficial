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
  isCadasturValid: vi.fn(),
  getCadasturByCertificate: vi.fn(),
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password"),
  compare: vi.fn(),
}));

import * as db from "./db";

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

describe("CADASTUR validation with database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates a CADASTUR number found in the database", async () => {
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);
    vi.mocked(db.isCadasturValid).mockResolvedValue({
      valid: true,
      data: {
        id: 1,
        certificateNumber: "04621967990",
        fullName: "CHARLISSON RIBEIRO DE OLIVEIRA",
        uf: "AC",
        city: "Brasiléia",
        phone: "(68)99958-1845",
        email: "charliejunior-7@hotmail.com",
        website: "www.charliejunior.jimdo.com",
        validUntil: new Date("2028-05-29"),
        languages: ["Português", "Espanhol"],
        operatingCities: ["Brasiléia", "Epitaciolândia", "Tabatinga"],
        categories: ["Guia Regional"],
        segments: ["Ecoturismo", "Turismo Cultural"],
        isDriverGuide: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.validateCadastur({
      cadasturNumber: "04621967990",
    });

    expect(result.valid).toBe(true);
    expect(result.guideData.name).toBe("CHARLISSON RIBEIRO DE OLIVEIRA");
    expect(result.guideData.uf).toBe("AC");
    expect(result.guideData.city).toBe("Brasiléia");
    expect(result.guideData.languages).toEqual(["Português", "Espanhol"]);
  });

  it("rejects a CADASTUR number not found in database", async () => {
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);
    vi.mocked(db.isCadasturValid).mockResolvedValue({
      valid: false,
      reason: "CADASTUR não encontrado na base de dados",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.validateCadastur({
        cadasturNumber: "99999999999",
      })
    ).rejects.toThrow("CADASTUR não encontrado na base de dados");
  });

  it("rejects an expired CADASTUR certificate", async () => {
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);
    vi.mocked(db.isCadasturValid).mockResolvedValue({
      valid: false,
      reason: "Certificado CADASTUR expirado",
      data: {
        id: 1,
        certificateNumber: "12345678901",
        fullName: "GUIA EXPIRADO",
        uf: "SP",
        city: "São Paulo",
        phone: null,
        email: null,
        website: null,
        validUntil: new Date("2020-01-01"),
        languages: null,
        operatingCities: null,
        categories: null,
        segments: null,
        isDriverGuide: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.validateCadastur({
        cadasturNumber: "12345678901",
      })
    ).rejects.toThrow("Certificado CADASTUR expirado");
  });

  it("registers a guide with CADASTUR data from database", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);
    vi.mocked(db.isCadasturValid).mockResolvedValue({
      valid: true,
      data: {
        id: 1,
        certificateNumber: "04621967990",
        fullName: "CHARLISSON RIBEIRO DE OLIVEIRA",
        uf: "AC",
        city: "Brasiléia",
        phone: "(68)99958-1845",
        email: "charliejunior-7@hotmail.com",
        website: "www.charliejunior.jimdo.com",
        validUntil: new Date("2028-05-29"),
        languages: ["Português", "Espanhol"],
        operatingCities: ["Brasiléia", "Epitaciolândia", "Tabatinga"],
        categories: ["Guia Regional"],
        segments: ["Ecoturismo", "Turismo Cultural"],
        isDriverGuide: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    vi.mocked(db.createUserWithPassword).mockResolvedValue({ id: 1, openId: "email_123_abc" });
    vi.mocked(db.createGuideProfile).mockResolvedValue(undefined);
    vi.mocked(db.createSystemEvent).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      name: "Charlisson Oliveira",
      email: "charlisson@example.com",
      password: "password123",
      userType: "guide",
      cadasturNumber: "04621967990",
    });

    expect(result.success).toBe(true);
    expect(db.createGuideProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        cadasturNumber: "04621967990",
        uf: "AC",
        city: "Brasiléia",
        languages: ["Português", "Espanhol"],
        categories: ["Guia Regional"],
        contactPhone: "(68)99958-1845",
        contactEmail: "charliejunior-7@hotmail.com",
      })
    );
  });

  it("rejects guide registration with invalid CADASTUR", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);
    vi.mocked(db.getUserByCadastur).mockResolvedValue(undefined);
    vi.mocked(db.isCadasturValid).mockResolvedValue({
      valid: false,
      reason: "CADASTUR não encontrado na base de dados",
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Fake Guide",
        email: "fake@example.com",
        password: "password123",
        userType: "guide",
        cadasturNumber: "INVALID123",
      })
    ).rejects.toThrow("CADASTUR não encontrado na base de dados");
  });
});
