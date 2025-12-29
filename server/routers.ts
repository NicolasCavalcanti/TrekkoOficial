import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

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

    participate: protectedProcedure
      .input(z.object({ expeditionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const expedition = await db.getExpeditionById(input.expeditionId);
        if (!expedition) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Expedition not found' });
        }
        
        await db.addParticipant(input.expeditionId, ctx.user.id);
        
        await db.createSystemEvent({
          type: 'EXPEDITION_INTEREST',
          message: `Interesse em expedição: ${expedition.title || 'Expedição #' + expedition.id}`,
          severity: 'info',
          actorId: ctx.user.id,
        });

        return { success: true };
      }),
  }),

  // Public guides endpoints
  guides: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        uf: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      }))
      .query(async ({ input }) => {
        return await db.getGuides(input, input.page, input.limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const guide = await db.getUserById(input.id);
        if (!guide || guide.userType !== 'guide') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Guide not found' });
        }
        const profile = await db.getGuideProfile(input.id);
        const { expeditions } = await db.getExpeditions({ guideId: input.id }, 1, 50);
        return { guide, profile, expeditions };
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
      return await db.getExpeditions({ guideId: ctx.user.id, status: undefined }, 1, 100);
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
        const id = await db.createExpedition({
          guideId: ctx.user.id,
          trailId: input.trailId,
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
          capacity: input.capacity,
          availableSpots: input.capacity,
          price: input.price?.toString(),
          meetingPoint: input.meetingPoint,
          notes: input.notes,
          status: 'published',
        });

        await db.createSystemEvent({
          type: 'EXPEDITION_CREATED',
          message: `Nova expedição criada: ${input.title || 'Expedição'}`,
          severity: 'info',
          actorId: ctx.user.id,
        });

        return { id };
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
        status: z.enum(['draft', 'published', 'cancelled']).optional(),
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
          notes: input.notes,
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
          status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
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
});

export type AppRouter = typeof appRouter;
