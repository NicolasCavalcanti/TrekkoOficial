import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Helper function to add business days (excluding weekends)
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Saturday (6) and Sunday (0)
      addedDays++;
    }
  }
  return result;
}

// Admin procedure - requires admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Guide procedure - requires guide user type
const guideProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.userType !== 'guide') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Guide access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Email/password registration
    register: publicProcedure
      .input(z.object({
        name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
        email: z.string().email('E-mail inválido'),
        password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
        userType: z.enum(['trekker', 'guide']),
        cadasturNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const bcrypt = await import('bcryptjs');
        
        // Check if email already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: 'CONFLICT', message: 'E-mail já cadastrado' });
        }

        // For guides, validate CADASTUR against the official database
        let cadasturData = null;
        if (input.userType === 'guide') {
          if (!input.cadasturNumber) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Número CADASTUR é obrigatório para guias' });
          }
          
          // Check if CADASTUR is already used
          const existingGuide = await db.getUserByCadastur(input.cadasturNumber);
          if (existingGuide) {
            throw new TRPCError({ code: 'CONFLICT', message: 'CADASTUR já vinculado a outra conta' });
          }
          
          // Validate against official CADASTUR registry
          const validation = await db.isCadasturValid(input.cadasturNumber);
          if (!validation.valid) {
            throw new TRPCError({ 
              code: 'BAD_REQUEST', 
              message: validation.reason || 'CADASTUR inválido ou não encontrado' 
            });
          }
          cadasturData = validation.data;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create user
        const { id, openId } = await db.createUserWithPassword({
          name: input.name,
          email: input.email,
          passwordHash,
          userType: input.userType,
          cadasturNumber: input.cadasturNumber,
          cadasturValidated: input.userType === 'guide' ? 1 : 0,
        });

        // Create guide profile if guide with CADASTUR data
        if (input.userType === 'guide' && input.cadasturNumber && cadasturData) {
          await db.createGuideProfile({
            userId: id,
            cadasturNumber: input.cadasturNumber,
            cadasturValidatedAt: new Date(),
            cadasturExpiresAt: cadasturData.validUntil || undefined,
            uf: cadasturData.uf,
            city: cadasturData.city,
            categories: cadasturData.categories,
            languages: cadasturData.languages,
            contactPhone: cadasturData.phone,
            contactEmail: cadasturData.email,
            website: cadasturData.website,
          });
        }

        // Log event
        await db.createSystemEvent({
          type: input.userType === 'guide' ? 'GUIDE_REGISTERED' : 'USER_REGISTERED',
          message: `Novo ${input.userType === 'guide' ? 'guia' : 'trekker'} cadastrado: ${input.name}`,
          severity: 'info',
          actorId: id,
        });

        // Create session cookie using SDK for consistent format
        const { sdk } = await import('./_core/sdk');
        const token = await sdk.createSessionToken(openId, { name: input.name });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return { success: true, userId: id };
      }),

    // Email/password login
    login: publicProcedure
      .input(z.object({
        email: z.string().email('E-mail inválido'),
        password: z.string().min(1, 'Senha é obrigatória'),
      }))
      .mutation(async ({ ctx, input }) => {
        const bcrypt = await import('bcryptjs');
        
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'E-mail ou senha incorretos' });
        }

        const validPassword = await bcrypt.compare(input.password, user.passwordHash);
        if (!validPassword) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'E-mail ou senha incorretos' });
        }

        // Update last signed in
        await db.updateUserProfile(user.id, { lastSignedIn: new Date() });

        // Create session cookie using SDK for consistent format
        const { sdk } = await import('./_core/sdk');
        const token = await sdk.createSessionToken(user.openId, { name: user.name || '' });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return { success: true, userId: user.id };
      }),

    // Validate CADASTUR number (public endpoint for step 1 of guide registration)
    validateCadastur: publicProcedure
      .input(z.object({
        cadasturNumber: z.string().min(1, 'Número CADASTUR é obrigatório'),
      }))
      .mutation(async ({ input }) => {
        const cadastur = input.cadasturNumber.replace(/\s+/g, '').toUpperCase();
        
        // Check if already used by another user
        const existingGuide = await db.getUserByCadastur(cadastur);
        if (existingGuide) {
          throw new TRPCError({ code: 'CONFLICT', message: 'CADASTUR já vinculado a outra conta' });
        }

        // Validate against the official CADASTUR registry database
        const validation = await db.isCadasturValid(cadastur);
        
        if (!validation.valid) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: validation.reason || 'CADASTUR inválido ou não encontrado' 
          });
        }

        const cadasturData = validation.data!;
        
        return {
          valid: true,
          cadasturNumber: cadastur,
          guideData: {
            name: cadasturData.fullName,
            uf: cadasturData.uf,
            city: cadasturData.city,
            phone: cadasturData.phone,
            email: cadasturData.email,
            website: cadasturData.website,
            validUntil: cadasturData.validUntil,
            languages: cadasturData.languages,
            categories: cadasturData.categories,
            segments: cadasturData.segments,
            operatingCities: cadasturData.operatingCities,
            isDriverGuide: cadasturData.isDriverGuide === 1,
          }
        };
      }),
  }),

  // User profile management
  user: router({
    // Public endpoint to get user info by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const guideProfile = ctx.user.userType === 'guide' 
        ? await db.getGuideProfile(ctx.user.id) 
        : null;
      return { user, guideProfile };
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        bio: z.string().optional(),
        cadasturNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, {
          name: input.name,
          email: input.email,
          bio: input.bio,
          cadasturNumber: input.cadasturNumber,
        });
        
        // If updating to guide with CADASTUR
        if (input.cadasturNumber && ctx.user.userType !== 'guide') {
          await db.updateUserProfile(ctx.user.id, { userType: 'guide', cadasturValidated: 1 });
        }
        
        return { success: true };
      }),

    uploadPhoto: protectedProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64
        const buffer = Buffer.from(input.base64, 'base64');
        
        // Check size (5MB limit)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'File size exceeds 5MB limit' });
        }

        const ext = input.mimeType.split('/')[1];
        const fileKey = `profile-photos/${ctx.user.id}-${nanoid()}.${ext}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.updateUserProfile(ctx.user.id, { photoUrl: url });
        
        return { url };
      }),

    removePhoto: protectedProcedure.mutation(async ({ ctx }) => {
      await db.updateUserProfile(ctx.user.id, { photoUrl: null });
      return { success: true };
    }),

    becomeGuide: protectedProcedure
      .input(z.object({
        cadasturNumber: z.string().min(1),
        uf: z.string().length(2).optional(),
        city: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Update user to guide type
        await db.updateUserProfile(ctx.user.id, {
          userType: 'guide',
          cadasturNumber: input.cadasturNumber,
          cadasturValidated: 1,
        });

        // Create guide profile
        await db.createGuideProfile({
          userId: ctx.user.id,
          cadasturNumber: input.cadasturNumber,
          uf: input.uf,
          city: input.city,
          cadasturValidatedAt: new Date(),
        });

        await db.createSystemEvent({
          type: 'GUIDE_REGISTERED',
          message: `Novo guia registrado: ${ctx.user.name || 'Usuário'}`,
          severity: 'info',
          actorId: ctx.user.id,
        });

        return { success: true };
      }),
  }),

  // Public trails endpoints
  trails: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        uf: z.string().optional(),
        difficulty: z.string().optional(),
        maxDistance: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      }))
      .query(async ({ input }) => {
        return await db.getTrails(input, input.page, input.limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const trail = await db.getTrailById(input.id);
        if (!trail) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Trail not found' });
        }
        const relatedExpeditions = await db.getExpeditionsByTrailId(input.id);
        return { trail, relatedExpeditions };
      }),

    getUFs: publicProcedure.query(async () => {
      return await db.getDistinctUFs();
    }),

    getCities: publicProcedure.query(async () => {
      return await db.getCitiesWithTrails();
    }),
  }),

  // Public expeditions endpoints
  expeditions: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        uf: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      }))
      .query(async ({ input }) => {
        return await db.getExpeditions(input, input.page, input.limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const expedition = await db.getExpeditionById(input.id);
        if (!expedition) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Expedition not found' });
        }
        const trail = await db.getTrailById(expedition.trailId);
        const guide = await db.getUserById(expedition.guideId);
        return { expedition, trail, guide };
      }),

    // Get expedition with full details (for detail page)
    getDetails: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await db.getExpeditionWithDetails(input.id);
        if (!result) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Expedition not found' });
        }
        return result;
      }),

    // Check if current user is enrolled
    isEnrolled: protectedProcedure
      .input(z.object({ expeditionId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isUserEnrolled(input.expeditionId, ctx.user.id);
      }),

    // Enroll in expedition
    enroll: protectedProcedure
      .input(z.object({ expeditionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.enrollInExpedition(input.expeditionId, ctx.user.id);
        
        if (result.success) {
          const expedition = await db.getExpeditionById(input.expeditionId);
          await db.createSystemEvent({
            type: 'EXPEDITION_ENROLLMENT',
            message: `Nova inscrição em expedição: ${expedition?.title || 'Expedição #' + input.expeditionId}`,
            severity: 'info',
            actorId: ctx.user.id,
          });
        }
        
        return result;
      }),

    // Cancel enrollment
    cancelEnrollment: protectedProcedure
      .input(z.object({ expeditionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.cancelEnrollment(input.expeditionId, ctx.user.id);
        
        if (result.success) {
          const expedition = await db.getExpeditionById(input.expeditionId);
          await db.createSystemEvent({
            type: 'EXPEDITION_CANCELLATION',
            message: `Cancelamento de inscrição: ${expedition?.title || 'Expedição #' + input.expeditionId}`,
            severity: 'info',
            actorId: ctx.user.id,
          });
        }
        
        return result;
      }),

    // Get participants (only for guide owner or admin)
    getParticipants: protectedProcedure
      .input(z.object({ expeditionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const expedition = await db.getExpeditionById(input.expeditionId);
        if (!expedition) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Expedition not found' });
        }
        
        // Only guide owner or admin can see participants
        if (expedition.guideId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Não autorizado a ver participantes' });
        }
        
        return await db.getExpeditionParticipants(input.expeditionId);
      }),

    // Legacy participate endpoint (kept for compatibility)
    participate: protectedProcedure
      .input(z.object({ expeditionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.enrollInExpedition(input.expeditionId, ctx.user.id);
      }),

    // Guide financial endpoints
    getGuideStats: guideProcedure.query(async ({ ctx }) => {
      return await db.getGuideFinancialStats(ctx.user.id);
    }),

    getGuideReservations: guideProcedure.query(async ({ ctx }) => {
      return await db.getGuideReservations(ctx.user.id);
    }),

    getGuidePayouts: guideProcedure.query(async ({ ctx }) => {
      return await db.getGuidePayouts(ctx.user.id);
    }),
  }),

  // Public guides endpoints
  guides: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        cadasturCode: z.string().optional(),
        uf: z.string().optional(),
        city: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      }))
      .query(async ({ input }) => {
        return await db.getGuides(input, input.page, input.limit);
      }),

    getCities: publicProcedure
      .input(z.object({
        uf: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getGuideCities(input.uf);
      }),

    getById: publicProcedure
      .input(z.object({ cadasturNumber: z.string() }))
      .query(async ({ input }) => {
        // Get CADASTUR registry data
        const cadasturData = await db.getCadasturByCertificate(input.cadasturNumber);
        if (!cadasturData) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Guide not found' });
        }
        
        // Check if guide is registered on Trekko
        const trekkoUser = await db.getUserByCadastur(input.cadasturNumber);
        const isVerified = !!trekkoUser;
        
        // Get expeditions if registered
        let expeditions: any[] = [];
        if (trekkoUser) {
          const result = await db.getExpeditions({ guideId: trekkoUser.id }, 1, 50);
          expeditions = result.expeditions;
        }
        
        return { 
          guide: {
            id: cadasturData.id,
            name: cadasturData.fullName,
            cadasturNumber: cadasturData.certificateNumber,
            uf: cadasturData.uf,
            city: cadasturData.city,
            phone: cadasturData.phone,
            email: cadasturData.email,
            website: cadasturData.website,
            languages: cadasturData.languages,
            categories: cadasturData.categories,
            segments: cadasturData.segments,
            validUntil: cadasturData.validUntil,
            isDriverGuide: cadasturData.isDriverGuide === 1,
            isVerified,
            bio: trekkoUser?.bio || null,
            photoUrl: trekkoUser?.photoUrl || null,
          },
          expeditions 
        };
      }),

    // Get guide's own verification/PIX data
    getMyVerification: guideProcedure.query(async ({ ctx }) => {
      return await db.getGuideVerification(ctx.user.id);
    }),

    // Save guide PIX data
    savePixData: guideProcedure
      .input(z.object({
        documentType: z.enum(['cpf', 'cnpj']),
        documentNumber: z.string().min(11).max(14),
        pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
        pixKey: z.string().min(1),
        pixKeyHolderName: z.string().min(3),
        acceptedIntermediationTerms: z.boolean(),
        acceptedPayoutTerms: z.boolean(),
        acceptedContestationPolicy: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validate PIX key matches document for CPF/CNPJ keys
        if ((input.pixKeyType === 'cpf' || input.pixKeyType === 'cnpj') && 
            input.pixKey !== input.documentNumber) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'A chave PIX deve pertencer ao mesmo CPF/CNPJ cadastrado' 
          });
        }

        // All terms must be accepted
        if (!input.acceptedIntermediationTerms || !input.acceptedPayoutTerms || !input.acceptedContestationPolicy) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Todos os termos devem ser aceitos' 
          });
        }

        await db.saveGuidePixData(ctx.user.id, {
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          pixKeyType: input.pixKeyType,
          pixKey: input.pixKey,
          pixKeyHolderName: input.pixKeyHolderName,
          pixKeyDocument: input.documentNumber, // Same as document for validation
          acceptedIntermediationTerms: 1,
          acceptedPayoutTerms: 1,
          acceptedContestationPolicy: 1,
          termsAcceptedAt: new Date(),
        });

        return { success: true };
      }),
  }),

  // Favorites
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const favs = await db.getUserFavorites(ctx.user.id);
      const trailIds = favs.map(f => f.trailId);
      const trailsData = await Promise.all(trailIds.map(id => db.getTrailById(id)));
      return trailsData.filter(Boolean);
    }),

    add: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addFavorite(ctx.user.id, input.trailId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFavorite(ctx.user.id, input.trailId);
        return { success: true };
      }),

    check: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isFavorite(ctx.user.id, input.trailId);
      }),
  }),

  // Guide expedition management
  guide: router({
    myExpeditions: guideProcedure.query(async ({ ctx }) => {
      return await db.getExpeditions({ guideId: ctx.user.id, showAll: true }, 1, 100);
    }),

    createExpedition: guideProcedure
      .input(z.object({
        trailId: z.number(),
        title: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        capacity: z.number().default(10),
        price: z.number().optional(),
        meetingPoint: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log('[CreateExpedition] Input:', JSON.stringify(input, null, 2));
        console.log('[CreateExpedition] User:', ctx.user.id, ctx.user.userType);
        try {
          const id = await db.createExpedition({
            guideId: ctx.user.id,
            trailId: input.trailId,
            title: input.title,
            startDate: input.startDate,
            endDate: input.endDate,
            capacity: input.capacity,
            enrolledCount: 0,
            price: input.price?.toString(),
            meetingPoint: input.meetingPoint,
            guideNotes: input.notes,
            status: 'active',
          });

          await db.createSystemEvent({
            type: 'EXPEDITION_CREATED',
            message: `Nova expedição criada: ${input.title || 'Expedição'}`,
            severity: 'info',
            actorId: ctx.user.id,
          });

          return { id };
        } catch (error) {
          console.error('[CreateExpedition] Error:', error);
          throw error;
        }
      }),

    updateExpedition: guideProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        capacity: z.number().optional(),
        price: z.number().optional(),
        meetingPoint: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['draft', 'active', 'full', 'closed', 'cancelled']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const expedition = await db.getExpeditionById(input.id);
        if (!expedition || expedition.guideId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
        }

        await db.updateExpedition(input.id, {
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
          capacity: input.capacity,
          price: input.price?.toString(),
          meetingPoint: input.meetingPoint,
          guideNotes: input.notes,
          status: input.status,
        });

        return { success: true };
      }),

    deleteExpedition: guideProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const expedition = await db.getExpeditionById(input.id);
        if (!expedition || expedition.guideId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
        }

        await db.deleteExpedition(input.id);
        return { success: true };
      }),

    // Mark expedition as completed (starts contestation period)
    completeExpedition: guideProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const expedition = await db.getExpeditionById(input.id);
        if (!expedition || expedition.guideId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Não autorizado' });
        }

        if (expedition.status !== 'active' && expedition.status !== 'full') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Expedição não pode ser concluída neste status' });
        }

        // Calculate contestation end date (2 business days from now)
        const contestationEndDate = addBusinessDays(new Date(), 2);

        await db.updateExpedition(input.id, { 
          status: 'completed',
          completedAt: new Date(),
          contestationEndDate,
        });

        // Update all paid reservations to "awaiting_contestation" status
        await db.updateReservationsForExpedition(input.id, 'paid', {
          status: 'awaiting_contestation',
          contestationEndDate,
        });

        await db.createSystemEvent({
          type: 'EXPEDITION_COMPLETED',
          message: `Expedição #${input.id} concluída. Período de contestação até ${contestationEndDate.toLocaleDateString('pt-BR')}`,
          severity: 'info',
          actorId: ctx.user.id,
        });

        return { success: true, contestationEndDate };
      }),

    // Get financial summary for guide
    financialSummary: guideProcedure.query(async ({ ctx }) => {
      return await db.getGuideFinancialStats(ctx.user.id);
    }),

    // Get reservations for guide's expeditions
    reservations: guideProcedure
      .input(z.object({
        status: z.enum(['all', 'pending', 'paid', 'awaiting_contestation', 'released', 'contested', 'refunded']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getGuideReservations(ctx.user.id, input?.status);
      }),

    // Get payouts history
    payouts: guideProcedure.query(async ({ ctx }) => {
      return await db.getGuidePayouts(ctx.user.id);
    }),
  }),

  // Admin endpoints
  admin: router({
    metrics: adminProcedure.query(async () => {
      return await db.getAdminMetrics();
    }),

    events: adminProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await db.getSystemEvents(input.limit);
      }),

    expeditions: router({
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          limit: z.number().default(20),
          status: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return await db.getExpeditions({ status: input.status || undefined }, input.page, input.limit);
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['draft', 'active', 'full', 'closed', 'cancelled']).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          await db.updateExpedition(input.id, { status: input.status });
          
          await db.createSystemEvent({
            type: 'EXPEDITION_UPDATED',
            message: `Expedição #${input.id} atualizada pelo admin`,
            severity: 'info',
            actorId: ctx.user.id,
          });

          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await db.deleteExpedition(input.id);
          
          await db.createSystemEvent({
            type: 'EXPEDITION_DELETED',
            message: `Expedição #${input.id} removida pelo admin`,
            severity: 'warning',
            actorId: ctx.user.id,
          });

          return { success: true };
        }),
    }),

    trails: router({
      create: adminProcedure
        .input(z.object({
          name: z.string(),
          uf: z.string().length(2),
          city: z.string().optional(),
          region: z.string().optional(),
          distanceKm: z.number().optional(),
          difficulty: z.enum(['easy', 'moderate', 'hard', 'expert']).optional(),
          description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const id = await db.createTrail({
            name: input.name,
            uf: input.uf,
            city: input.city,
            region: input.region,
            distanceKm: input.distanceKm?.toString(),
            difficulty: input.difficulty,
            description: input.description,
          });

          await db.createSystemEvent({
            type: 'TRAIL_CREATED',
            message: `Nova trilha criada: ${input.name}`,
            severity: 'info',
            actorId: ctx.user.id,
          });

          return { id };
        }),
    }),

    seedData: adminProcedure.mutation(async ({ ctx }) => {
      await db.seedInitialData();
      
      await db.createSystemEvent({
        type: 'DATA_SEEDED',
        message: 'Dados de exemplo carregados',
        severity: 'info',
        actorId: ctx.user.id,
      });

      return { success: true };
    }),
  }),

  // Blog endpoints
  blog: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      }))
      .query(async ({ input }) => {
        return await db.getBlogPosts(
          { category: input.category, search: input.search, featured: input.featured },
          input.page,
          input.limit
        );
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Post não encontrado' });
        }
        // Increment view count
        await db.incrementBlogPostViews(post.id);
        return post;
      }),

    getRelated: publicProcedure
      .input(z.object({ postId: z.number(), category: z.string() }))
      .query(async ({ input }) => {
        return await db.getRelatedBlogPosts(input.postId, input.category);
      }),

    // Admin endpoints for blog management
    create: adminProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        content: z.string(),
        excerpt: z.string().optional(),
        category: z.enum(['trilhas-destinos', 'guias-praticos', 'planejamento-seguranca', 'equipamentos', 'conservacao-ambiental', 'historias-inspiracao']).optional(),
        imageUrl: z.string().optional(),
        images: z.array(z.string()).optional(),
        authorName: z.string().optional(),
        readingTime: z.number().optional(),
        relatedTrailIds: z.array(z.number()).optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        featured: z.boolean().optional(),
        status: z.enum(['draft', 'published']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createBlogPost({
          slug: input.slug,
          title: input.title,
          subtitle: input.subtitle,
          content: input.content,
          excerpt: input.excerpt,
          category: input.category,
          imageUrl: input.imageUrl,
          images: input.images,
          authorId: ctx.user.id,
          authorName: input.authorName || 'TREKKO',
          readingTime: input.readingTime || 5,
          relatedTrailIds: input.relatedTrailIds,
          tags: input.tags,
          metaTitle: input.metaTitle || input.title,
          metaDescription: input.metaDescription || input.excerpt,
          featured: input.featured ? 1 : 0,
          status: input.status || 'draft',
          publishedAt: input.status === 'published' ? new Date() : undefined,
        });

        await db.createSystemEvent({
          type: 'BLOG_POST_CREATED',
          message: `Novo post criado: ${input.title}`,
          severity: 'info',
          actorId: ctx.user.id,
        });

        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        category: z.enum(['trilhas-destinos', 'guias-praticos', 'planejamento-seguranca', 'equipamentos', 'conservacao-ambiental', 'historias-inspiracao']).optional(),
        imageUrl: z.string().optional(),
        images: z.array(z.string()).optional(),
        authorName: z.string().optional(),
        readingTime: z.number().optional(),
        relatedTrailIds: z.array(z.number()).optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        featured: z.boolean().optional(),
        status: z.enum(['draft', 'published']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = { ...data };
        
        if (input.featured !== undefined) {
          updateData.featured = input.featured ? 1 : 0;
        }
        
        if (input.status === 'published') {
          const existing = await db.getBlogPostById(id);
          if (existing && !existing.publishedAt) {
            updateData.publishedAt = new Date();
          }
        }

        await db.updateBlogPost(id, updateData as any);
        return { success: true };
      }),
  }),

  // ============================================
  // PAYMENT SYSTEM ROUTES
  // ============================================
  
  payments: router({
    // Get platform settings (public for display purposes)
    getSettings: publicProcedure.query(async () => {
      const platformFee = await db.getPlatformSetting('platform_fee_percent') || '10';
      const policy = await db.getDefaultCancellationPolicy();
      return {
        platformFeePercent: Number(platformFee),
        cancellationPolicy: policy,
      };
    }),

    // Get cancellation policies
    getCancellationPolicies: publicProcedure.query(async () => {
      return await db.getCancellationPolicies();
    }),

    // Create checkout session for expedition reservation
    createCheckout: protectedProcedure
      .input(z.object({
        expeditionId: z.number(),
        quantity: z.number().min(1).max(10),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          console.log('[Payment] Creating checkout for expedition:', input.expeditionId, 'quantity:', input.quantity);
          console.log('[Payment] MERCADOPAGO_ACCESS_TOKEN exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);
          
          // Initialize Mercado Pago client
          const mpClient = new MercadoPagoConfig({ 
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
          });
          const preference = new Preference(mpClient);

        // Get expedition details
        const expedition = await db.getExpeditionById(input.expeditionId);
        if (!expedition) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Expedição não encontrada' });
        }

        // Check if expedition is available for booking
        if (!expedition.status || !['published', 'active'].includes(expedition.status)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Expedição não está disponível para reservas' });
        }

        // Check available spots
        const paidReservations = await db.getPaidReservationsForExpedition(input.expeditionId);
        const totalBooked = paidReservations.reduce((sum, r) => sum + r.quantity, 0);
        const availableSpots = (expedition.capacity || 10) - totalBooked;

        if (input.quantity > availableSpots) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Apenas ${availableSpots} vagas disponíveis` 
          });
        }

        // Get trail info for display
        const trail = await db.getTrailById(expedition.trailId);

        // Calculate amounts
        const unitPrice = Number(expedition.price) || 0;
        const totalAmount = unitPrice * input.quantity;
        const platformFeePercent = Number(await db.getPlatformSetting('platform_fee_percent') || '10');
        const platformFee = totalAmount * (platformFeePercent / 100);

        // Set expiration time
        const expiryMinutes = Math.max(30, Number(await db.getPlatformSetting('reservation_expiry_minutes') || '30'));
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        // Create reservation record
        const reservationId = await db.createReservation({
          expeditionId: input.expeditionId,
          userId: ctx.user.id,
          quantity: input.quantity,
          unitPrice: unitPrice.toString(),
          totalAmount: totalAmount.toString(),
          status: 'pending_payment',
          expiresAt,
        });

        // Generate external reference for Mercado Pago
        const externalReference = `reservation_${reservationId}_${Date.now()}`;

        // Create Mercado Pago Preference
        const preferenceData = await preference.create({
          body: {
            items: [{
              id: `expedition_${input.expeditionId}`,
              title: expedition.title || `Expedição: ${trail?.name || 'Trilha'}`,
              description: `${input.quantity} vaga(s) - ${new Date(expedition.startDate).toLocaleDateString('pt-BR')}`,
              picture_url: trail?.imageUrl && trail.imageUrl.startsWith('http') ? trail.imageUrl : undefined,
              quantity: input.quantity,
              unit_price: unitPrice,
              currency_id: 'BRL',
            }],
            payer: {
              email: ctx.user.email || undefined,
              name: ctx.user.name || undefined,
            },
            back_urls: {
              success: `${ctx.req.headers.origin}/reservas?success=true&reservation=${reservationId}`,
              failure: `${ctx.req.headers.origin}/expedicao/${input.expeditionId}?cancelled=true`,
              pending: `${ctx.req.headers.origin}/reservas?pending=true&reservation=${reservationId}`,
            },
            auto_return: 'approved',
            external_reference: externalReference,
            notification_url: `${ctx.req.headers.origin}/api/webhooks/mercadopago`,
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: expiresAt.toISOString(),
            payment_methods: {
              excluded_payment_methods: [],
              excluded_payment_types: [],
              installments: 12,
              default_installments: 1,
            },
            metadata: {
              user_id: ctx.user.id.toString(),
              reservation_id: reservationId.toString(),
              expedition_id: input.expeditionId.toString(),
            },
          },
        });

        // Update reservation with Mercado Pago preference ID
        await db.updateReservation(reservationId, {
          mpPreferenceId: preferenceData.id,
          mpExternalReference: externalReference,
        });

        // Create audit log
        await db.createAuditLog({
          entityType: 'reservation',
          entityId: reservationId,
          action: 'checkout_created',
          newValue: JSON.stringify({ preferenceId: preferenceData.id, amount: totalAmount }),
          actorId: ctx.user.id,
          actorType: 'user',
        });

        return {
          checkoutUrl: preferenceData.init_point,
          reservationId,
          expiresAt,
        };
        } catch (error) {
          console.error('[Payment] Checkout error:', error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error instanceof Error ? error.message : 'Erro ao criar checkout' 
          });
        }
      }),

    // Get user's reservations
    myReservations: protectedProcedure.query(async ({ ctx }) => {
      const reservations = await db.getUserReservations(ctx.user.id);
      
      // Enrich with expedition and trail data
      const enriched = await Promise.all(reservations.map(async (r) => {
        const expedition = await db.getExpeditionById(r.expeditionId);
        const trail = expedition ? await db.getTrailById(expedition.trailId) : null;
        const guide = expedition ? await db.getUserById(expedition.guideId) : null;
        
        return {
          ...r,
          expedition: expedition ? {
            id: expedition.id,
            title: expedition.title,
            startDate: expedition.startDate,
            endDate: expedition.endDate,
            meetingPoint: expedition.meetingPoint,
          } : null,
          trail: trail ? {
            id: trail.id,
            name: trail.name,
            imageUrl: trail.imageUrl,
            city: trail.city,
            uf: trail.uf,
          } : null,
          guide: guide ? {
            id: guide.id,
            name: guide.name,
            photoUrl: guide.photoUrl,
          } : null,
        };
      }));

      return enriched;
    }),

    // Get single reservation details
    getReservation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const reservation = await db.getReservationById(input.id);
        if (!reservation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reserva não encontrada' });
        }

        // Check ownership (user or guide of the expedition)
        const expedition = await db.getExpeditionById(reservation.expeditionId);
        if (reservation.userId !== ctx.user.id && expedition?.guideId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }

        const trail = expedition ? await db.getTrailById(expedition.trailId) : null;
        const guide = expedition ? await db.getUserById(expedition.guideId) : null;
        const payments = await db.getPaymentsForReservation(input.id);

        return {
          ...reservation,
          expedition,
          trail,
          guide: guide ? { id: guide.id, name: guide.name, photoUrl: guide.photoUrl, email: guide.email } : null,
          payments,
        };
      }),

    // Open contestation for a reservation
    openContestation: protectedProcedure
      .input(z.object({
        reservationId: z.number(),
        reason: z.enum(['expedition_not_completed', 'different_from_description', 'safety_issues', 'guide_no_show', 'partial_service', 'other']),
        description: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const reservation = await db.getReservationById(input.reservationId);
        if (!reservation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reserva não encontrada' });
        }

        // Check ownership
        if (reservation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }

        // Check if in contestation period (completed_contestation status)
        if (reservation.status !== 'completed_contestation') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Reserva não está no período de contestação' });
        }

        // Check if contestation period hasn't expired
        if (reservation.contestationEndsAt && new Date(reservation.contestationEndsAt) < new Date()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Período de contestação expirado' });
        }

        // Update reservation status to in_dispute
        await db.updateReservation(input.reservationId, {
          status: 'in_dispute',
        });

        // Create audit log
        await db.createAuditLog({
          entityType: 'reservation',
          entityId: input.reservationId,
          action: 'contestation_opened',
          newValue: JSON.stringify({ reason: input.reason, description: input.description }),
          actorId: ctx.user.id,
          actorType: 'user',
        });

        return { success: true, message: 'Contestação aberta com sucesso' };
      }),

    // Cancel reservation (by user)
    cancelReservation: protectedProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Initialize Mercado Pago client for refunds
        const mpClient = new MercadoPagoConfig({ 
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
        });
        const payment = new Payment(mpClient);

        const reservation = await db.getReservationById(input.id);
        if (!reservation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reserva não encontrada' });
        }

        // Check ownership
        if (reservation.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }

        // Check if cancellable
        if (!['pending_payment', 'paid'].includes(reservation.status)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Reserva não pode ser cancelada' });
        }

        const expedition = await db.getExpeditionById(reservation.expeditionId);
        if (!expedition) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Expedição não encontrada' });
        }

        let refundAmount = 0;
        let refundPercent = 0;

        // If paid, calculate refund based on policy
        if (reservation.status === 'paid' && reservation.mpPaymentId) {
          const refundCalc = await db.calculateRefundAmount(input.id, expedition.startDate);
          refundAmount = refundCalc.refundAmount;
          refundPercent = refundCalc.refundPercent;

          if (refundAmount > 0) {
            // Process refund via Mercado Pago API
            const refundResponse = await fetch(
              `https://api.mercadopago.com/v1/payments/${reservation.mpPaymentId}/refunds`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: refundAmount }),
              }
            );
            const refund = await refundResponse.json();

            await db.updateReservation(input.id, {
              status: 'refunded',
              cancelledAt: new Date(),
              cancellationReason: input.reason,
              cancelledBy: 'user',
              refundedAt: new Date(),
              refundAmount: refundAmount.toString(),
              mpRefundId: refund.id?.toString(),
            });
          } else {
            await db.updateReservation(input.id, {
              status: 'cancelled',
              cancelledAt: new Date(),
              cancellationReason: input.reason || 'Cancelado sem reembolso (fora do prazo)',
              cancelledBy: 'user',
            });
          }
        } else {
          // Just cancel pending reservation
          await db.updateReservation(input.id, {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: input.reason,
            cancelledBy: 'user',
          });
        }

        // Create audit log
        await db.createAuditLog({
          entityType: 'reservation',
          entityId: input.id,
          action: 'cancelled_by_user',
          previousValue: reservation.status,
          newValue: refundAmount > 0 ? 'refunded' : 'cancelled',
          actorId: ctx.user.id,
          actorType: 'user',
          metadata: { refundAmount, refundPercent, reason: input.reason },
        });

        return {
          success: true,
          refundAmount,
          refundPercent,
          message: refundAmount > 0 
            ? `Reserva cancelada. Reembolso de R$ ${refundAmount.toFixed(2)} (${refundPercent}%) será processado.`
            : 'Reserva cancelada. Não há reembolso disponível para este período.',
        };
      }),
  }),

  // Guide verification and financial routes
  guideFinancial: router({
    // Get guide's verification status
    getVerificationStatus: guideProcedure.query(async ({ ctx }) => {
      const verification = await db.getGuideVerification(ctx.user.id);
      return verification || { status: 'not_started' };
    }),

    // Submit/update guide verification data
    submitVerification: guideProcedure
      .input(z.object({
        bankCode: z.string().min(3),
        bankName: z.string().min(2),
        agencyNumber: z.string().min(1),
        accountNumber: z.string().min(1),
        accountType: z.enum(['checking', 'savings']),
        accountHolderName: z.string().min(3),
        accountHolderDocument: z.string().min(11), // CPF or CNPJ
        documentUrl: z.string().optional(),
        bankProofUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getGuideVerification(ctx.user.id);

        if (existing) {
          await db.updateGuideVerification(ctx.user.id, {
            ...input,
            status: 'pending', // Reset to pending for review
          });
        } else {
          await db.createGuideVerification({
            userId: ctx.user.id,
            ...input,
            status: 'pending',
          });
        }

        await db.createAuditLog({
          entityType: 'guide_verification',
          entityId: ctx.user.id,
          action: existing ? 'updated' : 'created',
          actorId: ctx.user.id,
          actorType: 'guide',
        });

        return { success: true, message: 'Dados enviados para verificação' };
      }),

    // Get guide's reservations for their expeditions
    getExpeditionReservations: guideProcedure
      .input(z.object({ expeditionId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify guide owns this expedition
        const expedition = await db.getExpeditionById(input.expeditionId);
        if (!expedition || expedition.guideId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }

        const reservations = await db.getExpeditionReservations(input.expeditionId);
        
        // Enrich with user data (limited info for privacy)
        const enriched = await Promise.all(reservations.map(async (r) => {
          const user = await db.getUserById(r.userId);
          return {
            ...r,
            user: user ? {
              name: user.name,
              // Only show contact info for paid reservations
              email: r.status === 'paid' ? user.email : undefined,
            } : null,
          };
        }));

        return enriched;
      }),

    // Get guide's financial summary
    getFinancialSummary: guideProcedure.query(async ({ ctx }) => {
      // Get all expeditions by this guide
      const result = await db.getExpeditions({ guideId: ctx.user.id });
      const expeditionIds = result.expeditions.map((e: { id: number }) => e.id);

      // Get all paid reservations for these expeditions
      let totalEarnings = 0;
      let pendingPayouts = 0;
      let completedPayouts = 0;
      let reservationCount = 0;

      for (const expId of expeditionIds) {
        const reservations = await db.getPaidReservationsForExpedition(expId);
        for (const r of reservations) {
          const platformFeePercent = Number(await db.getPlatformSetting('platform_fee_percent') || '10');
          const netAmount = Number(r.totalAmount) * (1 - platformFeePercent / 100);
          totalEarnings += netAmount;
          reservationCount++;
        }
      }

      // Get payouts
      const payouts = await db.getGuidePayouts(ctx.user.id);
      for (const p of payouts) {
        if (p.status === 'completed') {
          completedPayouts += Number(p.netAmount);
        } else if (['scheduled', 'processing'].includes(p.status)) {
          pendingPayouts += Number(p.netAmount);
        }
      }

      return {
        totalEarnings,
        pendingPayouts,
        completedPayouts,
        availableBalance: totalEarnings - completedPayouts - pendingPayouts,
        reservationCount,
        payouts,
      };
    }),
  }),

  // Admin payment management
  adminPayments: router({
    // List all reservations with filters
    listReservations: adminProcedure
      .input(z.object({
        status: z.enum(['created', 'pending_payment', 'paid', 'cancelled', 'refunded', 'no_show']).optional(),
        guideId: z.number().optional(),
        expeditionId: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        // For now, get all and filter in memory (can optimize with SQL later)
        // This is a simplified implementation
        const allReservations = await db.getUserReservations(0); // TODO: Add admin list function
        return allReservations.slice(input.offset, input.offset + input.limit);
      }),

    // List pending guide verifications
    listPendingVerifications: adminProcedure.query(async () => {
      const pending = await db.listPendingGuideVerifications();
      
      // Enrich with user data
      const enriched = await Promise.all(pending.map(async (v) => {
        const user = await db.getUserById(v.userId);
        const profile = await db.getGuideProfile(v.userId);
        return {
          ...v,
          user: user ? { id: user.id, name: user.name, email: user.email } : null,
          profile,
        };
      }));

      return enriched;
    }),

    // Approve/reject guide verification
    reviewVerification: adminProcedure
      .input(z.object({
        userId: z.number(),
        status: z.enum(['approved', 'rejected']),
        rejectionReason: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const verification = await db.getGuideVerification(input.userId);
        if (!verification) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Verificação não encontrada' });
        }

        await db.updateGuideVerification(input.userId, {
          status: input.status,
          rejectionReason: input.rejectionReason,
          notes: input.notes,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        });

        await db.createAuditLog({
          entityType: 'guide_verification',
          entityId: input.userId,
          action: `verification_${input.status}`,
          previousValue: verification.status,
          newValue: input.status,
          actorId: ctx.user.id,
          actorType: 'admin',
          metadata: { rejectionReason: input.rejectionReason, notes: input.notes },
        });

        return { success: true };
      }),

    // Update platform settings
    updateSettings: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.setPlatformSetting(input.key, input.value, ctx.user.id);
        return { success: true };
      }),

    // Get all platform settings
    getSettings: adminProcedure.query(async () => {
      return await db.getAllPlatformSettings();
    }),
  }),

  // Reviews for trails and guides
  reviews: router({
    // Get reviews for a trail or guide
    list: publicProcedure
      .input(z.object({
        targetType: z.enum(['trail', 'guide']),
        targetId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(10),
        sortBy: z.enum(['recent', 'best', 'worst']).default('recent'),
        filterStars: z.number().min(1).max(5).optional(),
        withPhotos: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getReviews(input);
      }),

    // Get rating stats for a trail or guide
    getStats: publicProcedure
      .input(z.object({
        targetType: z.enum(['trail', 'guide']),
        targetId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getRatingStats(input.targetType, input.targetId);
      }),

    // Check if user has already reviewed
    hasReviewed: protectedProcedure
      .input(z.object({
        targetType: z.enum(['trail', 'guide']),
        targetId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const review = await db.getUserReview(ctx.user.id, input.targetType, input.targetId);
        return { hasReviewed: !!review, review };
      }),

    // Create a new review
    create: protectedProcedure
      .input(z.object({
        targetType: z.enum(['trail', 'guide']),
        targetId: z.number(),
        rating: z.number().min(0).max(5),
        comment: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').max(1000, 'Comentário deve ter no máximo 1000 caracteres'),
        images: z.array(z.object({
          base64: z.string(),
          mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
        })).max(5, 'Máximo de 5 fotos permitidas').optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already reviewed this target
        const existingReview = await db.getUserReview(ctx.user.id, input.targetType, input.targetId);
        if (existingReview) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Você já avaliou este item' });
        }

        // Upload images if provided
        const imageUrls: string[] = [];
        if (input.images && input.images.length > 0) {
          for (const img of input.images) {
            const buffer = Buffer.from(img.base64, 'base64');
            if (buffer.length > 5 * 1024 * 1024) {
              throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cada imagem deve ter no máximo 5MB' });
            }
            const ext = img.mimeType.split('/')[1];
            const fileKey = `reviews/${input.targetType}/${input.targetId}/${ctx.user.id}-${nanoid()}.${ext}`;
            const { url } = await storagePut(fileKey, buffer, img.mimeType);
            imageUrls.push(url);
          }
        }

        // Create review
        const reviewId = await db.createReview({
          userId: ctx.user.id,
          targetType: input.targetType,
          targetId: input.targetId,
          rating: input.rating,
          comment: input.comment,
        });

        // Add images to review
        if (imageUrls.length > 0) {
          await db.addReviewImages(reviewId, imageUrls);
        }

        // Update rating stats
        await db.updateRatingStats(input.targetType, input.targetId);

        return { success: true, reviewId };
      }),

    // Update an existing review
    update: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        rating: z.number().min(0).max(5),
        comment: z.string().min(10).max(1000),
        imagesToRemove: z.array(z.number()).optional(),
        newImages: z.array(z.object({
          base64: z.string(),
          mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
        })).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const review = await db.getReviewById(input.reviewId);
        if (!review) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Avaliação não encontrada' });
        }
        if (review.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não pode editar esta avaliação' });
        }

        // Remove specified images
        if (input.imagesToRemove && input.imagesToRemove.length > 0) {
          await db.removeReviewImages(input.imagesToRemove);
        }

        // Upload new images
        const newImageUrls: string[] = [];
        if (input.newImages && input.newImages.length > 0) {
          const currentImages = await db.getReviewImages(input.reviewId);
          const remainingCount = currentImages.length - (input.imagesToRemove?.length || 0);
          if (remainingCount + input.newImages.length > 5) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Máximo de 5 fotos por avaliação' });
          }

          for (const img of input.newImages) {
            const buffer = Buffer.from(img.base64, 'base64');
            if (buffer.length > 5 * 1024 * 1024) {
              throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cada imagem deve ter no máximo 5MB' });
            }
            const ext = img.mimeType.split('/')[1];
            const fileKey = `reviews/${review.targetType}/${review.targetId}/${ctx.user.id}-${nanoid()}.${ext}`;
            const { url } = await storagePut(fileKey, buffer, img.mimeType);
            newImageUrls.push(url);
          }

          if (newImageUrls.length > 0) {
            await db.addReviewImages(input.reviewId, newImageUrls);
          }
        }

        // Update review
        await db.updateReview(input.reviewId, {
          rating: input.rating,
          comment: input.comment,
        });

        // Update rating stats
        await db.updateRatingStats(review.targetType, review.targetId);

        return { success: true };
      }),

    // Delete a review
    delete: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const review = await db.getReviewById(input.reviewId);
        if (!review) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Avaliação não encontrada' });
        }
        if (review.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Você não pode excluir esta avaliação' });
        }

        const { targetType, targetId } = review;
        await db.deleteReview(input.reviewId);
        await db.updateRatingStats(targetType, targetId);

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
