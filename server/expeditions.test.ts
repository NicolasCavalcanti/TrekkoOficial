import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getExpeditions: vi.fn(),
  getExpeditionById: vi.fn(),
  getExpeditionWithDetails: vi.fn(),
  getExpeditionParticipants: vi.fn(),
  isUserEnrolled: vi.fn(),
  enrollInExpedition: vi.fn(),
  cancelEnrollment: vi.fn(),
  getTrailById: vi.fn(),
  getUserById: vi.fn(),
  getGuideProfile: vi.fn(),
  seedInitialData: vi.fn(),
  createSystemEvent: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "user",
    userType: "trekker",
    cadasturNumber: null,
    cadasturValidated: 0,
    bio: null,
    photoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    passwordHash: null,
    ...overrides,
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createGuideContext(): TrpcContext {
  return createAuthContext({
    id: 2,
    openId: "guide-user",
    userType: "guide",
    cadasturNumber: "12345678",
    cadasturValidated: 1,
  });
}

function createAdminContext(): TrpcContext {
  return createAuthContext({
    id: 3,
    openId: "admin-user",
    role: "admin",
  });
}

describe("expeditions.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated expedition list for public users", async () => {
    const mockExpeditions = [
      {
        id: 1,
        trailId: 1,
        guideId: 2,
        title: "Expedição Monte Roraima",
        startDate: new Date("2025-02-15"),
        endDate: new Date("2025-02-20"),
        capacity: 10,
        enrolledCount: 5,
        price: "1500.00",
        status: "active",
      },
    ];

    vi.mocked(db.getExpeditions).mockResolvedValue({
      expeditions: mockExpeditions,
      total: 1,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.list({ page: 1, limit: 12 });

    expect(result.expeditions).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.expeditions[0].title).toBe("Expedição Monte Roraima");
  });

  it("filters expeditions by search text", async () => {
    vi.mocked(db.getExpeditions).mockResolvedValue({
      expeditions: [],
      total: 0,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.expeditions.list({ search: "Roraima", page: 1, limit: 12 });

    expect(db.getExpeditions).toHaveBeenCalled();
    const callArgs = vi.mocked(db.getExpeditions).mock.calls[0];
    expect(callArgs[0].search).toBe("Roraima");
  });

  it("filters expeditions by date range", async () => {
    vi.mocked(db.getExpeditions).mockResolvedValue({
      expeditions: [],
      total: 0,
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date("2025-02-01");
    const endDate = new Date("2025-02-28");

    await caller.expeditions.list({ startDate, endDate, page: 1, limit: 12 });

    expect(db.getExpeditions).toHaveBeenCalled();
    const callArgs = vi.mocked(db.getExpeditions).mock.calls[0];
    expect(callArgs[0].startDate).toEqual(startDate);
    expect(callArgs[0].endDate).toEqual(endDate);
  });
});

describe("expeditions.getDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns expedition details with trail and guide info", async () => {
    const mockResult = {
      expedition: {
        id: 1,
        trailId: 1,
        guideId: 2,
        title: "Expedição Monte Roraima",
        description: "Uma aventura incrível",
        guideNotes: "Trazer equipamento de camping",
        startDate: new Date("2025-02-15"),
        endDate: new Date("2025-02-20"),
        startTime: "06:00",
        endTime: "18:00",
        capacity: 10,
        enrolledCount: 5,
        price: "1500.00",
        status: "active",
        meetingPoint: "Boa Vista, RR",
        includedItems: "Alimentação, transporte",
        images: null,
      },
      trail: {
        id: 1,
        name: "Monte Roraima",
        city: "Uiramutã",
        uf: "RR",
        imageUrl: "/trails/roraima.jpg",
        images: null,
        distanceKm: 48,
        elevationGain: 2000,
      },
      guide: {
        id: 2,
        name: "Guide Name",
        email: "guide@example.com",
        cadasturNumber: "12345678",
        photoUrl: null,
      },
    };

    vi.mocked(db.getExpeditionWithDetails).mockResolvedValue(mockResult as any);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.getDetails({ id: 1 });

    expect(result.expedition.title).toBe("Expedição Monte Roraima");
    expect(result.trail.name).toBe("Monte Roraima");
    expect(result.guide.name).toBe("Guide Name");
  });

  it("throws error for non-existent expedition", async () => {
    vi.mocked(db.getExpeditionWithDetails).mockResolvedValue(null);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.expeditions.getDetails({ id: 999 })).rejects.toThrow();
  });
});

describe("expeditions.getParticipants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns participants list for expedition guide", async () => {
    const mockExpedition = {
      id: 1,
      guideId: 2,
      trailId: 1,
      status: "active",
    };

    const mockParticipants = [
      {
        participant: { id: 1, expeditionId: 1, userId: 10, createdAt: new Date() },
        user: { id: 10, name: "Participant 1", email: "p1@example.com", photoUrl: null },
      },
    ];

    vi.mocked(db.getExpeditionById).mockResolvedValue(mockExpedition as any);
    vi.mocked(db.getExpeditionParticipants).mockResolvedValue(mockParticipants as any);

    const ctx = createGuideContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.getParticipants({ expeditionId: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].user.name).toBe("Participant 1");
  });

  it("returns participants list for admin", async () => {
    const mockExpedition = {
      id: 1,
      guideId: 2,
      trailId: 1,
      status: "active",
    };

    const mockParticipants = [
      {
        participant: { id: 1, expeditionId: 1, userId: 10, createdAt: new Date() },
        user: { id: 10, name: "Participant 1", email: "p1@example.com", photoUrl: null },
      },
    ];

    vi.mocked(db.getExpeditionById).mockResolvedValue(mockExpedition as any);
    vi.mocked(db.getExpeditionParticipants).mockResolvedValue(mockParticipants as any);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.getParticipants({ expeditionId: 1 });

    expect(result).toHaveLength(1);
  });

  it("denies access to participants for regular users", async () => {
    const mockExpedition = {
      id: 1,
      guideId: 2,
      trailId: 1,
      status: "active",
    };

    vi.mocked(db.getExpeditionById).mockResolvedValue(mockExpedition as any);

    const ctx = createAuthContext(); // Regular user, not the guide
    const caller = appRouter.createCaller(ctx);

    await expect(caller.expeditions.getParticipants({ expeditionId: 1 })).rejects.toThrow();
  });
});

describe("expeditions.enroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows authenticated user to enroll in active expedition", async () => {
    vi.mocked(db.enrollInExpedition).mockResolvedValue({ success: true });
    vi.mocked(db.createSystemEvent).mockResolvedValue(undefined);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.enroll({ expeditionId: 1 });

    expect(result.success).toBe(true);
    expect(db.enrollInExpedition).toHaveBeenCalledWith(1, 1);
  });

  it("handles enrollment failure gracefully", async () => {
    vi.mocked(db.enrollInExpedition).mockResolvedValue({ success: false, error: "Expedição lotada" });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.enroll({ expeditionId: 1 });

    expect(result.success).toBe(false);
  });
});

describe("expeditions.cancelEnrollment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows user to cancel their enrollment", async () => {
    vi.mocked(db.cancelEnrollment).mockResolvedValue({ success: true });
    vi.mocked(db.createSystemEvent).mockResolvedValue(undefined);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.cancelEnrollment({ expeditionId: 1 });

    expect(result.success).toBe(true);
    expect(db.cancelEnrollment).toHaveBeenCalledWith(1, 1);
  });

  it("handles cancellation failure gracefully", async () => {
    vi.mocked(db.cancelEnrollment).mockResolvedValue({ success: false, error: "Você não está inscrito" });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.cancelEnrollment({ expeditionId: 1 });

    expect(result.success).toBe(false);
  });
});

describe("expeditions.isEnrolled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true if user is enrolled", async () => {
    vi.mocked(db.isUserEnrolled).mockResolvedValue(true);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.isEnrolled({ expeditionId: 1 });

    expect(result).toBe(true);
  });

  it("returns false if user is not enrolled", async () => {
    vi.mocked(db.isUserEnrolled).mockResolvedValue(false);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.expeditions.isEnrolled({ expeditionId: 1 });

    expect(result).toBe(false);
  });
});
