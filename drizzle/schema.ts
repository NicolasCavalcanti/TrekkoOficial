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
  passwordHash: varchar("passwordHash", { length: 256 }),
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
  maxAltitude: int("maxAltitude"),
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "hard", "expert"]).default("moderate"),
  description: text("description"),
  shortDescription: text("shortDescription"),
  hookText: text("hookText"),
  ctaText: text("ctaText"),
  guideRequired: int("guideRequired").default(0),
  entranceFee: varchar("entranceFee", { length: 64 }),
  waterPoints: json("waterPoints").$type<string[]>(),
  campingPoints: json("campingPoints").$type<string[]>(),
  bestSeason: varchar("bestSeason", { length: 128 }),
  estimatedTime: varchar("estimatedTime", { length: 64 }),
  trailType: mysqlEnum("trailType", ["linear", "circular", "traverse"]).default("linear"),
  imageUrl: text("imageUrl"),
  images: json("images").$type<string[]>(),
  mapCoordinates: json("mapCoordinates").$type<{lat: number, lng: number}>(),
  highlights: json("highlights").$type<string[]>(),
  source: varchar("source", { length: 128 }),
  status: mysqlEnum("status", ["draft", "published"]).default("draft"),
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
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  startTime: varchar("startTime", { length: 8 }), // HH:MM format
  endTime: varchar("endTime", { length: 8 }), // HH:MM format
  capacity: int("capacity").default(10),
  enrolledCount: int("enrolledCount").default(0),
  price: decimal("price", { precision: 10, scale: 2 }),
  meetingPoint: text("meetingPoint"),
  guideNotes: text("guideNotes"), // Physical level, required equipment, etc.
  includedItems: json("includedItems").$type<string[]>(), // What's included in the price
  images: json("images").$type<string[]>(), // Expedition photos
  status: mysqlEnum("status", ["draft", "published", "active", "full", "closed", "cancelled", "completed"]).default("draft"),
  completedAt: timestamp("completedAt"),
  contestationEndDate: timestamp("contestationEndDate"),
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

/**
 * CADASTUR registry - official guide database from Ministry of Tourism
 */
export const cadasturRegistry = mysqlTable("cadastur_registry", {
  id: int("id").autoincrement().primaryKey(),
  certificateNumber: varchar("certificateNumber", { length: 64 }).notNull().unique(),
  fullName: varchar("fullName", { length: 256 }).notNull(),
  uf: varchar("uf", { length: 2 }).notNull(),
  city: varchar("city", { length: 128 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  validUntil: timestamp("validUntil"),
  languages: json("languages").$type<string[]>(),
  operatingCities: json("operatingCities").$type<string[]>(),
  categories: json("categories").$type<string[]>(),
  segments: json("segments").$type<string[]>(),
  isDriverGuide: int("isDriverGuide").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CadasturRegistry = typeof cadasturRegistry.$inferSelect;
export type InsertCadasturRegistry = typeof cadasturRegistry.$inferInsert;


/**
 * Blog posts for the TREKKO blog
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: mysqlEnum("category", [
    "trilhas-destinos",
    "guias-praticos", 
    "planejamento-seguranca",
    "equipamentos",
    "conservacao-ambiental",
    "historias-inspiracao"
  ]).default("trilhas-destinos"),
  imageUrl: text("imageUrl"),
  images: json("images").$type<string[]>(),
  authorId: int("authorId"),
  authorName: varchar("authorName", { length: 128 }),
  readingTime: int("readingTime").default(5), // minutes
  relatedTrailIds: json("relatedTrailIds").$type<number[]>(),
  tags: json("tags").$type<string[]>(),
  metaTitle: varchar("metaTitle", { length: 256 }),
  metaDescription: text("metaDescription"),
  featured: int("featured").default(0),
  viewCount: int("viewCount").default(0),
  status: mysqlEnum("status", ["draft", "published"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;


/**
 * Guide verification status for KYC/KYB
 * Guides must be approved before receiving payments
 */
export const guideVerification = mysqlTable("guide_verification", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  // Guide identification (KYC)
  documentType: mysqlEnum("documentType", ["cpf", "cnpj"]).default("cpf"),
  documentNumber: varchar("documentNumber", { length: 32 }), // CPF or CNPJ
  // PIX data for payouts
  pixKeyType: mysqlEnum("pixKeyType", ["cpf", "cnpj", "email", "phone", "random"]),
  pixKey: varchar("pixKey", { length: 256 }),
  pixKeyHolderName: varchar("pixKeyHolderName", { length: 256 }),
  pixKeyDocument: varchar("pixKeyDocument", { length: 32 }), // CPF/CNPJ of PIX key holder (must match documentNumber)
  pixKeyVerified: int("pixKeyVerified").default(0),
  // Bank account info (legacy, kept for reference)
  bankCode: varchar("bankCode", { length: 8 }),
  bankName: varchar("bankName", { length: 128 }),
  agencyNumber: varchar("agencyNumber", { length: 16 }),
  accountNumber: varchar("accountNumber", { length: 32 }),
  accountType: mysqlEnum("accountType", ["checking", "savings"]).default("checking"),
  accountHolderName: varchar("accountHolderName", { length: 256 }),
  accountHolderDocument: varchar("accountHolderDocument", { length: 32 }), // CPF or CNPJ (masked)
  // Documents
  documentUrl: text("documentUrl"), // ID document upload
  bankProofUrl: text("bankProofUrl"), // Bank statement/proof
  // Mercado Pago (for future integration)
  mpUserId: varchar("mpUserId", { length: 128 }),
  mpAccountStatus: varchar("mpAccountStatus", { length: 64 }),
  // Terms acceptance
  acceptedIntermediationTerms: int("acceptedIntermediationTerms").default(0),
  acceptedPayoutTerms: int("acceptedPayoutTerms").default(0), // D+2 payout, PIX only
  acceptedContestationPolicy: int("acceptedContestationPolicy").default(0),
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  // Admin review
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuideVerification = typeof guideVerification.$inferSelect;
export type InsertGuideVerification = typeof guideVerification.$inferInsert;

/**
 * Cancellation policies for expeditions
 */
export const cancellationPolicies = mysqlTable("cancellation_policies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  // Refund rules based on days before event
  fullRefundDays: int("fullRefundDays").default(7), // Full refund if cancelled X days before
  partialRefundDays: int("partialRefundDays").default(3), // Partial refund if cancelled X days before
  partialRefundPercent: int("partialRefundPercent").default(50), // Percentage refunded for partial
  noRefundDays: int("noRefundDays").default(0), // No refund if cancelled within X days
  isDefault: int("isDefault").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CancellationPolicy = typeof cancellationPolicies.$inferSelect;
export type InsertCancellationPolicy = typeof cancellationPolicies.$inferInsert;

/**
 * Reservations for expeditions
 */
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  expeditionId: int("expeditionId").notNull(),
  userId: int("userId").notNull(),
  quantity: int("quantity").default(1).notNull(), // Number of spots reserved
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(), // Price per person at time of booking
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(), // Total = quantity * unitPrice
  status: mysqlEnum("status", [
    "created",
    "pending_payment",
    "paid",
    "awaiting_expedition",
    "expedition_in_progress",
    "completed_contestation",
    "in_dispute",
    "payout_sent",
    "cancelled",
    "refunded",
    "no_show"
  ]).default("created").notNull(),
  // Expedition completion tracking
  expeditionCompletedAt: timestamp("expeditionCompletedAt"),
  guideConfirmedCompletion: int("guideConfirmedCompletion").default(0),
  userConfirmedCompletion: int("userConfirmedCompletion").default(0),
  contestationEndsAt: timestamp("contestationEndsAt"), // D+2 business days after completion
  payoutScheduledAt: timestamp("payoutScheduledAt"),
  payoutCompletedAt: timestamp("payoutCompletedAt"),
  // Mercado Pago references
  mpPreferenceId: varchar("mpPreferenceId", { length: 128 }),
  mpPaymentId: varchar("mpPaymentId", { length: 128 }),
  mpExternalReference: varchar("mpExternalReference", { length: 128 }),
  // Payment method used
  paymentMethod: mysqlEnum("paymentMethod", ["card", "pix", "boleto", "account_money"]),
  // Expiration for pending payments
  expiresAt: timestamp("expiresAt"),
  paidAt: timestamp("paidAt"),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
  cancelledBy: mysqlEnum("cancelledBy", ["user", "guide", "admin", "system"]),
  // Refund info
  refundedAt: timestamp("refundedAt"),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }),
  mpRefundId: varchar("mpRefundId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

/**
 * Payment records for tracking and audit
 * Stores minimal data - details fetched from Mercado Pago API when needed
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId").notNull(),
  mpPaymentId: varchar("mpPaymentId", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "refunded", "partially_refunded", "cancelled"]).default("pending").notNull(),
  // Amounts for reporting (cached from Mercado Pago)
  grossAmount: decimal("grossAmount", { precision: 10, scale: 2 }).notNull(), // Total charged
  platformFee: decimal("platformFee", { precision: 10, scale: 2 }).notNull(), // Trekko fee
  mpFee: decimal("mpFee", { precision: 10, scale: 2 }), // Mercado Pago processing fee
  netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(), // Amount to guide
  // Payment details
  paymentMethod: mysqlEnum("paymentMethod", ["card", "pix", "boleto", "account_money"]),
  paymentTypeId: varchar("paymentTypeId", { length: 64 }), // credit_card, debit_card, pix, etc.
  currency: varchar("currency", { length: 3 }).default("BRL"),
  // Metadata
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Payouts to guides (transfers)
 */
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  guideId: int("guideId").notNull(),
  reservationId: int("reservationId"), // Link to the reservation being paid out
  status: mysqlEnum("status", ["scheduled", "processing", "sent", "failed", "completed", "blocked"]).default("scheduled").notNull(),
  // Amount breakdown
  grossAmount: decimal("grossAmount", { precision: 10, scale: 2 }).notNull(), // Total from user
  platformFee: decimal("platformFee", { precision: 10, scale: 2 }).notNull(), // Trekko 4% fee
  gatewayFee: decimal("gatewayFee", { precision: 10, scale: 2 }), // Mercado Pago fee
  netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(), // Amount to guide
  currency: varchar("currency", { length: 3 }).default("BRL"),
  // PIX transfer details
  pixKey: varchar("pixKey", { length: 256 }),
  pixKeyType: varchar("pixKeyType", { length: 32 }),
  pixTransactionId: varchar("pixTransactionId", { length: 128 }),
  pixReceiptUrl: text("pixReceiptUrl"),
  pixEndToEndId: varchar("pixEndToEndId", { length: 64 }), // E2E ID from PIX transfer
  // Scheduling
  scheduledDate: timestamp("scheduledDate").notNull(),
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  // Related payments
  paymentIds: json("paymentIds").$type<number[]>(),
  // Error handling
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

/**
 * Audit log for payment-related actions
 */
export const paymentAuditLog = mysqlTable("payment_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["reservation", "payment", "payout", "guide_verification"]).notNull(),
  entityId: int("entityId").notNull(),
  action: varchar("action", { length: 64 }).notNull(), // e.g., "status_changed", "refund_initiated"
  previousValue: text("previousValue"),
  newValue: text("newValue"),
  actorId: int("actorId"), // User who performed the action (null for system)
  actorType: mysqlEnum("actorType", ["user", "guide", "admin", "system"]).default("system"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentAuditLog = typeof paymentAuditLog.$inferSelect;
export type InsertPaymentAuditLog = typeof paymentAuditLog.$inferInsert;

/**
 * Platform settings for payment configuration
 */
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;

/**
 * Contestations/disputes for reservations
 * Users can open a dispute within 2 business days after expedition completion
 */
export const contestations = mysqlTable("contestations", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId").notNull(),
  userId: int("userId").notNull(), // User who opened the contestation
  guideId: int("guideId").notNull(), // Guide being contested
  status: mysqlEnum("status", ["open", "under_review", "resolved_user", "resolved_guide", "closed"]).default("open").notNull(),
  reason: mysqlEnum("reason", [
    "expedition_not_completed",
    "different_from_description",
    "safety_issues",
    "guide_no_show",
    "poor_service",
    "other"
  ]).notNull(),
  description: text("description").notNull(),
  evidenceUrls: json("evidenceUrls").$type<string[]>(), // Photos, screenshots, etc.
  // Guide response
  guideResponse: text("guideResponse"),
  guideResponseAt: timestamp("guideResponseAt"),
  guideEvidenceUrls: json("guideEvidenceUrls").$type<string[]>(),
  // Resolution
  resolution: text("resolution"),
  resolvedBy: int("resolvedBy"), // Admin who resolved
  resolvedAt: timestamp("resolvedAt"),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }), // Amount refunded to user if any
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contestation = typeof contestations.$inferSelect;
export type InsertContestation = typeof contestations.$inferInsert;
