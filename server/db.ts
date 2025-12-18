import { eq, and, like, or, gte, lte, sql, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  trails, Trail, InsertTrail,
  expeditions, Expedition, InsertExpedition,
  favorites, Favorite, InsertFavorite,
  guideProfiles, GuideProfile, InsertGuideProfile,
  systemEvents, SystemEvent, InsertSystemEvent,
  expeditionParticipants, ExpeditionParticipant, InsertExpeditionParticipant
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByCadastur(cadasturNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.cadasturNumber, cadasturNumber.toUpperCase().trim())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(data: {
  name: string;
  email: string;
  passwordHash: string;
  userType: 'trekker' | 'guide';
  cadasturNumber?: string;
  cadasturValidated?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const openId = `email_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    loginMethod: 'email',
    userType: data.userType,
    cadasturNumber: data.cadasturNumber?.toUpperCase().trim(),
    cadasturValidated: data.cadasturValidated || 0,
    role: 'user',
  });
  
  return { id: Number(result[0].insertId), openId };
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function getGuides(filters?: { uf?: string; search?: string }, page = 1, limit = 12) {
  const db = await getDb();
  if (!db) return { guides: [], total: 0 };

  const conditions = [eq(users.userType, "guide")];
  
  if (filters?.search) {
    conditions.push(like(users.name, `%${filters.search}%`));
  }

  const offset = (page - 1) * limit;
  
  const guidesResult = await db.select()
    .from(users)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.createdAt));

  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(...conditions));

  return {
    guides: guidesResult,
    total: Number(countResult[0]?.count || 0)
  };
}

// ============ TRAIL QUERIES ============

export async function getTrails(filters?: {
  search?: string;
  uf?: string;
  difficulty?: string;
  maxDistance?: number;
}, page = 1, limit = 12) {
  const db = await getDb();
  if (!db) return { trails: [], total: 0 };

  const conditions = [];
  
  if (filters?.search) {
    conditions.push(
      or(
        like(trails.name, `%${filters.search}%`),
        like(trails.city, `%${filters.search}%`),
        like(trails.region, `%${filters.search}%`)
      )
    );
  }
  
  if (filters?.uf) {
    conditions.push(eq(trails.uf, filters.uf));
  }
  
  if (filters?.difficulty) {
    conditions.push(eq(trails.difficulty, filters.difficulty as any));
  }
  
  if (filters?.maxDistance) {
    conditions.push(lte(trails.distanceKm, filters.maxDistance.toString()));
  }

  const offset = (page - 1) * limit;
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const trailsResult = await db.select()
    .from(trails)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(asc(trails.name));

  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(trails)
    .where(whereClause);

  return {
    trails: trailsResult,
    total: Number(countResult[0]?.count || 0)
  };
}

export async function getTrailById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trails).where(eq(trails.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTrail(data: InsertTrail) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(trails).values(data);
  return result[0].insertId;
}

export async function getDistinctUFs() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ uf: trails.uf }).from(trails).orderBy(asc(trails.uf));
  return result.map(r => r.uf);
}

export async function getCitiesWithTrails() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ 
    city: trails.city, 
    uf: trails.uf 
  }).from(trails).orderBy(asc(trails.city));
  return result;
}

// ============ EXPEDITION QUERIES ============

export async function getExpeditions(filters?: {
  search?: string;
  uf?: string;
  startDate?: Date;
  endDate?: Date;
  guideId?: number;
  status?: string;
}, page = 1, limit = 12) {
  const db = await getDb();
  if (!db) return { expeditions: [], total: 0 };

  const conditions = [];
  
  if (filters?.guideId) {
    conditions.push(eq(expeditions.guideId, filters.guideId));
  }
  
  if (filters?.status) {
    conditions.push(eq(expeditions.status, filters.status as any));
  } else {
    conditions.push(eq(expeditions.status, "published"));
  }
  
  if (filters?.startDate) {
    conditions.push(gte(expeditions.startDate, filters.startDate));
  }
  
  if (filters?.endDate) {
    conditions.push(lte(expeditions.startDate, filters.endDate));
  }

  const offset = (page - 1) * limit;
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const expeditionsResult = await db.select()
    .from(expeditions)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(asc(expeditions.startDate));

  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(expeditions)
    .where(whereClause);

  return {
    expeditions: expeditionsResult,
    total: Number(countResult[0]?.count || 0)
  };
}

export async function getExpeditionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(expeditions).where(eq(expeditions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createExpedition(data: InsertExpedition) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(expeditions).values(data);
  return result[0].insertId;
}

export async function updateExpedition(id: number, data: Partial<InsertExpedition>) {
  const db = await getDb();
  if (!db) return;
  await db.update(expeditions).set({ ...data, updatedAt: new Date() }).where(eq(expeditions.id, id));
}

export async function deleteExpedition(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(expeditions).where(eq(expeditions.id, id));
}

export async function getExpeditionsByTrailId(trailId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(expeditions)
    .where(and(eq(expeditions.trailId, trailId), eq(expeditions.status, "published")))
    .orderBy(asc(expeditions.startDate));
}

// ============ FAVORITES QUERIES ============

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
}

export async function addFavorite(userId: number, trailId: number) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.trailId, trailId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(favorites).values({ userId, trailId });
  }
}

export async function removeFavorite(userId: number, trailId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.trailId, trailId)));
}

export async function isFavorite(userId: number, trailId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.trailId, trailId)))
    .limit(1);
  return result.length > 0;
}

// ============ GUIDE PROFILE QUERIES ============

export async function getGuideProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guideProfiles).where(eq(guideProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGuideProfile(data: InsertGuideProfile) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(guideProfiles).values(data);
  return result[0].insertId;
}

export async function updateGuideProfile(userId: number, data: Partial<InsertGuideProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.update(guideProfiles).set({ ...data, updatedAt: new Date() }).where(eq(guideProfiles.userId, userId));
}

// ============ EXPEDITION PARTICIPANTS ============

export async function addParticipant(expeditionId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select()
    .from(expeditionParticipants)
    .where(and(eq(expeditionParticipants.expeditionId, expeditionId), eq(expeditionParticipants.userId, userId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(expeditionParticipants).values({ expeditionId, userId });
  }
}

export async function getParticipants(expeditionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(expeditionParticipants)
    .where(eq(expeditionParticipants.expeditionId, expeditionId));
}

// ============ SYSTEM EVENTS ============

export async function createSystemEvent(data: InsertSystemEvent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(systemEvents).values(data);
}

export async function getSystemEvents(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(systemEvents)
    .orderBy(desc(systemEvents.createdAt))
    .limit(limit);
}

// ============ ADMIN METRICS ============

export async function getAdminMetrics() {
  const db = await getDb();
  if (!db) return { trails: 0, expeditions: 0, guides: 0, reservations: 0, revenue: 0 };

  const trailsCount = await db.select({ count: sql<number>`count(*)` }).from(trails);
  const expeditionsCount = await db.select({ count: sql<number>`count(*)` })
    .from(expeditions)
    .where(or(eq(expeditions.status, "published"), eq(expeditions.status, "draft")));
  const guidesCount = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.userType, "guide"));
  const reservationsCount = await db.select({ count: sql<number>`count(*)` }).from(expeditionParticipants);
  const revenueResult = await db.select({ total: sql<number>`COALESCE(SUM(price), 0)` })
    .from(expeditions)
    .where(eq(expeditions.status, "completed"));

  return {
    trails: Number(trailsCount[0]?.count || 0),
    expeditions: Number(expeditionsCount[0]?.count || 0),
    guides: Number(guidesCount[0]?.count || 0),
    reservations: Number(reservationsCount[0]?.count || 0),
    revenue: Number(revenueResult[0]?.total || 0)
  };
}

// ============ SEED DATA ============

export async function seedInitialData() {
  const db = await getDb();
  if (!db) return;

  // Check if trails exist
  const existingTrails = await db.select({ count: sql<number>`count(*)` }).from(trails);
  if (Number(existingTrails[0]?.count) > 0) return;

  // Seed sample trails
  const sampleTrails: InsertTrail[] = [
    { name: "Trilha do Pico da Bandeira", uf: "MG", city: "Alto Caparaó", region: "Serra do Caparaó", distanceKm: "12.5", difficulty: "hard", description: "Terceiro ponto mais alto do Brasil com vistas espetaculares." },
    { name: "Trilha da Pedra do Baú", uf: "SP", city: "São Bento do Sapucaí", region: "Serra da Mantiqueira", distanceKm: "4.0", difficulty: "moderate", description: "Formação rochosa impressionante com escadas de ferro." },
    { name: "Trilha do Vale do Pati", uf: "BA", city: "Andaraí", region: "Chapada Diamantina", distanceKm: "25.0", difficulty: "hard", description: "Uma das trilhas mais bonitas do Brasil." },
    { name: "Trilha da Praia do Sancho", uf: "PE", city: "Fernando de Noronha", region: "Arquipélago", distanceKm: "1.5", difficulty: "easy", description: "Acesso à praia mais bonita do Brasil." },
    { name: "Trilha dos Saltos", uf: "GO", city: "Alto Paraíso", region: "Chapada dos Veadeiros", distanceKm: "11.0", difficulty: "moderate", description: "Cachoeiras e piscinas naturais incríveis." },
    { name: "Trilha do Morro do Pai Inácio", uf: "BA", city: "Palmeiras", region: "Chapada Diamantina", distanceKm: "3.0", difficulty: "easy", description: "Vista panorâmica da Chapada Diamantina." },
    { name: "Trilha da Cachoeira da Fumaça", uf: "BA", city: "Vale do Capão", region: "Chapada Diamantina", distanceKm: "12.0", difficulty: "moderate", description: "Segunda maior cachoeira do Brasil." },
    { name: "Trilha do Pico dos Marins", uf: "SP", city: "Piquete", region: "Serra da Mantiqueira", distanceKm: "14.0", difficulty: "hard", description: "Pico com 2.420m de altitude." },
    { name: "Trilha das Sete Quedas", uf: "SP", city: "Brotas", region: "Interior Paulista", distanceKm: "5.0", difficulty: "easy", description: "Sequência de cachoeiras em meio à mata." },
    { name: "Trilha do Monte Roraima", uf: "RR", city: "Uiramutã", region: "Tríplice Fronteira", distanceKm: "48.0", difficulty: "expert", description: "Tepui milenar na fronteira Brasil-Venezuela-Guiana." },
    { name: "Trilha da Pedra da Gávea", uf: "RJ", city: "Rio de Janeiro", region: "Tijuca", distanceKm: "5.0", difficulty: "hard", description: "Maior bloco de pedra à beira-mar do mundo." },
    { name: "Trilha do Pico do Paraná", uf: "PR", city: "Campina Grande do Sul", region: "Serra do Mar", distanceKm: "8.0", difficulty: "hard", description: "Ponto mais alto do Sul do Brasil." },
  ];

  for (const trail of sampleTrails) {
    await db.insert(trails).values(trail);
  }

  // Create system event for seeding
  await db.insert(systemEvents).values({
    type: "SYSTEM",
    message: "Dados iniciais carregados com sucesso",
    severity: "info"
  });
}
