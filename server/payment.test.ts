import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({}),
  getExpeditionById: vi.fn(),
  getTrailById: vi.fn(),
  getPaidReservationsForExpedition: vi.fn(),
  getPlatformSetting: vi.fn(),
  createReservation: vi.fn(),
  updateReservation: vi.fn(),
  createAuditLog: vi.fn(),
  getCancellationPolicies: vi.fn(),
  getDefaultCancellationPolicy: vi.fn(),
  // Add other required mocks
  getTrails: vi.fn().mockResolvedValue({ trails: [], total: 0 }),
  getExpeditions: vi.fn().mockResolvedValue({ expeditions: [], total: 0 }),
  getGuides: vi.fn().mockResolvedValue({ guides: [], total: 0 }),
  getUserFavorites: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
}));

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/test',
          }),
        },
      },
    })),
  };
});

import * as db from './db';

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    userType: "trekker",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

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

const mockExpedition = {
  id: 90001,
  guideId: 2,
  trailId: 1,
  title: 'Expedição Monte Roraima - Janeiro 2026',
  description: 'Uma aventura incrível pelo Monte Roraima',
  startDate: new Date('2026-02-15'),
  endDate: new Date('2026-02-22'),
  capacity: 10,
  price: '2500.00',
  status: 'active',
  enrolledCount: 0,
};

const mockTrail = {
  id: 1,
  name: 'Monte Roraima',
  uf: 'RR',
  city: 'Uiramutã',
  imageUrl: 'https://example.com/roraima.jpg',
};

describe('payments.createCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(db.getExpeditionById).mockResolvedValue(mockExpedition as any);
    vi.mocked(db.getTrailById).mockResolvedValue(mockTrail as any);
    vi.mocked(db.getPaidReservationsForExpedition).mockResolvedValue([]);
    vi.mocked(db.getPlatformSetting).mockResolvedValue('30');
    vi.mocked(db.createReservation).mockResolvedValue(1);
    vi.mocked(db.updateReservation).mockResolvedValue(undefined);
    vi.mocked(db.createAuditLog).mockResolvedValue(1);
  });

  it('creates a checkout session successfully', async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.payments.createCheckout({
      expeditionId: 90001,
      quantity: 1,
    });

    expect(result).toHaveProperty('checkoutUrl');
    expect(result).toHaveProperty('reservationId');
    expect(result).toHaveProperty('expiresAt');
    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/test');
    expect(result.reservationId).toBe(1);
  });

  it('throws error when expedition not found', async () => {
    vi.mocked(db.getExpeditionById).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.payments.createCheckout({
        expeditionId: 99999,
        quantity: 1,
      })
    ).rejects.toThrow('Expedição não encontrada');
  });

  it('throws error when expedition is cancelled', async () => {
    vi.mocked(db.getExpeditionById).mockResolvedValue({
      ...mockExpedition,
      status: 'cancelled',
    } as any);

    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.payments.createCheckout({
        expeditionId: 90001,
        quantity: 1,
      })
    ).rejects.toThrow('Expedição não está disponível para reservas');
  });

  it('throws error when expedition is draft', async () => {
    vi.mocked(db.getExpeditionById).mockResolvedValue({
      ...mockExpedition,
      status: 'draft',
    } as any);

    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.payments.createCheckout({
        expeditionId: 90001,
        quantity: 1,
      })
    ).rejects.toThrow('Expedição não está disponível para reservas');
  });

  it('allows checkout for published expeditions', async () => {
    vi.mocked(db.getExpeditionById).mockResolvedValue({
      ...mockExpedition,
      status: 'published',
    } as any);

    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.payments.createCheckout({
      expeditionId: 90001,
      quantity: 1,
    });

    expect(result).toHaveProperty('checkoutUrl');
  });

  it('throws error when not enough spots available', async () => {
    vi.mocked(db.getPaidReservationsForExpedition).mockResolvedValue([
      { quantity: 8 } as any,
    ]);

    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.payments.createCheckout({
        expeditionId: 90001,
        quantity: 5,
      })
    ).rejects.toThrow('Apenas 2 vagas disponíveis');
  });

  it('creates reservation with correct total amount', async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await caller.payments.createCheckout({
      expeditionId: 90001,
      quantity: 2,
    });

    expect(db.createReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        expeditionId: 90001,
        userId: 1,
        quantity: 2,
        unitPrice: '2500',
        totalAmount: '5000',
        status: 'pending_payment',
      })
    );
  });

  it('updates reservation with Stripe session ID', async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await caller.payments.createCheckout({
      expeditionId: 90001,
      quantity: 1,
    });

    expect(db.updateReservation).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        stripeCheckoutSessionId: 'cs_test_123',
      })
    );
  });

  it('creates audit log for checkout', async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await caller.payments.createCheckout({
      expeditionId: 90001,
      quantity: 1,
    });

    expect(db.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'reservation',
        entityId: 1,
        action: 'checkout_created',
        actorId: 1,
        actorType: 'user',
      })
    );
  });
});

describe('payments.getCancellationPolicies', () => {
  it('returns cancellation policies', async () => {
    vi.mocked(db.getCancellationPolicies).mockResolvedValue([
      {
        id: 1,
        name: 'Política Padrão',
        daysBeforeStart: 7,
        refundPercent: '100.00',
        description: 'Reembolso integral até 7 dias antes',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ]);

    const caller = appRouter.createCaller(createPublicContext());

    const policies = await caller.payments.getCancellationPolicies();
    expect(policies).toHaveLength(1);
    expect(policies[0].refundPercent).toBe('100.00');
  });
});
