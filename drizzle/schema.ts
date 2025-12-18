import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Supports TREKKER, GUIDE, and ADMIN roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["trekker", "guide"]).default("trekker").notNull(),
  bio: text("bio"),
  photoUrl: text("photoUrl"),
  cadasturNumber: varchar("cadasturNumber", { length: 64 }),
  cadasturValidated: int("cadasturValidated").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Guide profiles with CADASTUR validation details
 */
export const guideProfiles = mysqlTable("guide_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cadasturNumber: varchar("cadasturNumber", { length: 64 }).notNull(),
  cadasturValidatedAt: timestamp("cadasturValidatedAt"),
  cadasturExpiresAt: timestamp("cadasturExpiresAt"),
  uf: varchar("uf", { length: 2 }),
  city: varchar("city", { length: 128 }),
  categories: json("categories").$type<string[]>(),
  languages: json("languages").$type<string[]>(),
  contactPhone: varchar("contactPhone", { length: 32 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  website: text("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuideProfile = typeof guideProfiles.$inferSelect;
export type InsertGuideProfile = typeof guideProfiles.$inferInsert;

/**
 * Trails table with hiking trail information
 */
export const trails = mysqlTable("trails", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  uf: varchar("uf", { length: 2 }).notNull(),
  city: varchar("city", { length: 128 }),
  region: varchar("region", { length: 256 }),
  park: varchar("park", { length: 256 }),
  distanceKm: decimal("distanceKm", { precision: 8, scale: 2 }),
  elevationGain: int("elevationGain"),
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "hard", "expert"]).default("moderate"),
  description: text("description"),
  imageUrl: text("imageUrl"),
  images: json("images").$type<string[]>(),
  source: varchar("source", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trail = typeof trails.$inferSelect;
export type InsertTrail = typeof trails.$inferInsert;

/**
 * Expeditions organized by guides
 */
export const expeditions = mysqlTable("expeditions", {
  id: int("id").autoincrement().primaryKey(),
  guideId: int("guideId").notNull(),
  trailId: int("trailId").notNull(),
  title: varchar("title", { length: 256 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  capacity: int("capacity").default(10),
  availableSpots: int("availableSpots").default(10),
  price: decimal("price", { precision: 10, scale: 2 }),
  meetingPoint: text("meetingPoint"),
  notes: text("notes"),
  status: mysqlEnum("status", ["draft", "published", "cancelled", "completed"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expedition = typeof expeditions.$inferSelect;
export type InsertExpedition = typeof expeditions.$inferInsert;

/**
 * User favorites for trails
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trailId: int("trailId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Expedition participation/interest
 */
export const expeditionParticipants = mysqlTable("expedition_participants", {
  id: int("id").autoincrement().primaryKey(),
  expeditionId: int("expeditionId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["interested", "confirmed", "cancelled"]).default("interested"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpeditionParticipant = typeof expeditionParticipants.$inferSelect;
export type InsertExpeditionParticipant = typeof expeditionParticipants.$inferInsert;

/**
 * System events for admin dashboard
 */
export const systemEvents = mysqlTable("system_events", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 64 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error"]).default("info"),
  actorId: int("actorId"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = typeof systemEvents.$inferInsert;
