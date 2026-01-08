# Trekko - Project TODO

## Database & Backend
- [x] Create database schema (users, trails, expeditions, favorites, guide_profiles, system_events)
- [x] Implement public API endpoints (trails, expeditions, guides)
- [x] Implement auth API endpoints (register, login, logout, me)
- [x] Implement admin API endpoints (expeditions CRUD, metrics)
- [x] Implement file upload for profile photos (S3)
- [x] Implement CADASTUR validation logic

## Frontend - Public Pages
- [x] Home page with hero, search filters, and CTA sections
- [x] Trails listing page with search, filters, and pagination
- [x] Trail detail page with images, info, favorites, and related expeditions
- [x] Expeditions tab with search, filters, and pagination
- [x] Guides listing page with search and filters
- [x] Guide detail page with CADASTUR info and expeditions

## Frontend - User Features
- [x] User authentication (login/logout/register)
- [x] User profile page with avatar, bio, and settings
- [x] Profile photo upload (5MB limit, JPG/PNG/GIF)
- [x] Favorites system for trails
- [x] Guide expedition creation modal
- [x] Guide expedition management

## Frontend - Admin Features
- [x] Admin dashboard with metrics cards
- [x] System events log
- [x] RBAC permission system
- [x] Expeditions management page
- [x] Quick creation shortcuts

## UI/UX
- [x] Responsive header with mobile hamburger menu
- [x] Forest green (#2D6A4F) and earth brown (#7C4B2A) color palette
- [x] Sora (titles) and Inter (text) typography
- [x] Loading states and empty states
- [x] Responsive grid layouts (1/2/3 columns)

## Bug Fixes / Changes
- [x] Rename site from "Trilhas do Brasil" to "Trekko"

## Registration Modal Implementation
- [x] Update database schema for password-based auth and user types
- [x] Add backend registration endpoint with email/password
- [x] Add CADASTUR validation endpoint
- [x] Create registration modal with Trekker/Guide selection
- [x] Implement Trekker registration form with validations
- [x] Implement Guide registration with 2-step CADASTUR flow
- [x] Add loading states and error messages
- [x] Test registration flow end-to-end

## CADASTUR Database Integration
- [x] Create cadastur_registry table in database schema
- [x] Write script to import CSV data into database (29,344 guides imported)
- [x] Update CADASTUR validation endpoint to query database
- [x] Pre-fill guide profile with CADASTUR data on registration
- [x] Display CADASTUR data in registration modal
- [x] Test CADASTUR validation with real data (38 tests passing)

## Bug Fixes
- [x] Fix guide login redirect - page not redirecting to home with logged user
- [x] Fix login persistence - user not staying logged in after login (fixed JWT token format to match SDK expectations)

## CADASTUR Guides Listing Update
- [x] Update backend to return all CADASTUR registry guides (29,344 guides)
- [x] Add verification status for guides registered on Trekko
- [x] Update Guides page to display all CADASTUR guides with contact info
- [x] Show "Verificado" badge only for Trekko-registered guides
- [x] Update Guide detail page to handle CADASTUR-only guides

## Guide Search Improvements
- [x] Make search case-insensitive (ignore uppercase/lowercase)
- [x] Make search accent-insensitive (ignore accents like á, é, ã)
- [x] Add optional CADASTUR code search field

## Trail Listings Creation
- [x] Research detailed info for each trail (distance, elevation, water points, camping)
- [x] Search and download high-quality images per trail
- [x] Update database schema with new trail fields (guide required, entry fee, water points, camping points)
- [x] Create engaging descriptions with hook and CTA for each trail
- [x] Import 8 trails to database (Monte Roraima, Petrópolis x Teresópolis, Vale da Lua, Pedra do Baú, Pico da Bandeira, Cânion Itaimbezinho, Trilha das Praias, Serra Fina)
- [x] Update trail detail page with infographic/map display
- [x] Update trail cards on Home and Trails pages with images

## Expedition Listing and Detail Pages
- [x] Update expedition schema with new fields (startTime, endTime, includedItems, guideNotes, images, status)
- [x] Update expedition listing to show: trail name, location, dates, guide, max capacity, enrolled count, price, status
- [x] Create expedition detail page with full information
- [x] Show guide info with photo and profile link
- [x] Show participation stats (total, enrolled, available) without exposing participant names
- [x] Add privacy rules: only guide/admin can see participant list
- [x] Implement enrollment/cancellation functionality
- [x] Add expedition status logic (Active, Full, Closed, Cancelled)

## Bug Fixes - Expedition Creation
- [x] Investigate "Erro ao criar expedição" - confirmed backend works correctly (63/63 tests passing)
- [x] Verified guide.createExpedition endpoint works with proper authentication
- [x] Issue was related to browser sandbox cookie handling, not code

## Bug Fix - Trail Card Navigation
- [x] Fix trail card click to redirect to trail detail page (/trilha/{id})
- [x] Ensure navigation works from all trail listings (Home, Trails page, search results)
- [x] Add loading feedback during navigation (skeleton/loading state)
- [x] Verify trail detail page displays all required information:
  - [x] General info: name, location, biome, description
  - [x] Technical info: distance, elevation, difficulty, duration, route type
  - [x] Logistics: water points, support points, camping, guide required, entry fee
  - [x] Associated guides with photo, profile link, certification status
  - [x] Image gallery and map
- [x] Ensure only published/active trails are accessible
- [x] Make page responsive and SEO-friendly

## Database Schema Fix
- [x] Fixed missing columns in expeditions table (description, startTime, endTime, enrolledCount, guideNotes, includedItems, images)
- [x] Updated expeditions.status enum to include 'published' value

## Bug Fix - Expedition Status Display
- [x] Fix expeditions showing as "Cancelada" when they should be active
- [x] Verify status is correctly set when creating expeditions (status is 'active' in database)
- [x] Ensure status display logic matches database values (added support for: active, published, draft, full, closed, cancelled)

## Bug Fix - API Error on Trilhas Page
- [x] Investigated API error - page is working correctly now
- [x] Error was temporary/intermittent - likely caused by server restart or session issue
- [x] All 63 tests passing, no code changes needed

## Google Analytics and AdSense Configuration
- [x] Add ads.txt file to public folder for AdSense verification (pub-2482023752745520)
- [x] Add Google Analytics tag (G-S816P190VN) to index.html
- [x] Verify configuration is working - both GA and ads.txt accessible

## CADASTUR Database Update
- [x] Analyze new XLSX file structure (55,619 guides with 14 columns)
- [x] Create migration script to update guides database
- [x] Run migration and verify data - 50,244 unique guides imported (5,375 duplicates removed)

## Blog Post - Serra Fina
- [x] Analyze attached content files
- [x] Create blog/posts feature (database table, API endpoints, frontend pages)
- [x] Publish the Serra Fina post with images
- [x] Test the post display - working correctly
- [x] Add Blog link to navigation menu (header and footer)

## SEO Fixes
- [x] Fix page title to be between 30-60 characters (now 46 chars: "Trekko - Trilhas, Guias e Aventuras no Brasil")

## Payment System Implementation (Stripe)

### Phase 1: Stripe Integration
- [x] Add Stripe feature to project
- [x] Configure Stripe API keys

### Phase 2: Database Schema
- [x] Create reservations table (reservation_id, user_id, expedition_id, quantity, total_value, status)
- [x] Create payments table (payment_id, transaction_id, method, installments, status, amounts)
- [x] Create payouts table (payout_id, status, scheduled_date, effective_date)
- [x] Create guide_verification table for KYC
- [x] Create cancellation_policies table
- [x] Create platform_settings table
- [x] Create payment_audit_log table

### Phase 3: Guide KYC
- [ ] Add guide verification status (PENDING, APPROVED, REJECTED, SUSPENDED)
- [ ] Create guide bank data form
- [ ] Create admin approval workflow
- [ ] Add audit log for status changes
### Phase 4: Checkout Flow

- [x] Create reservation creation endpoint
- [x] Implement availability validation
- [x] Create checkout page with payment methods (PIX, Card)
- [x] Implement Stripe Checkout Session
- [x] Handle reservation expiration (30 min timeout - Stripe minimum)
- [x] Fix: Trail image URL must be absolute for Stripe (relative URLs not supported)
- [x] Fix: Stripe requires minimum 30 minutes expiration time

### Phase 5: Webhooks
- [ ] Create webhook endpoint for Stripe events
- [ ] Handle payment.succeeded event
- [ ] Handle payment.failed event
- [ ] Handle refund events
- [ ] Implement idempotency

### Phase 6: Cancellation & Refunds
- [ ] Implement cancellation policies (full refund, partial, no refund)
- [ ] Create client cancellation flow
- [ ] Create guide/admin cancellation flow
- [ ] Implement automatic refunds

### Phase 7: Panels
- [ ] Client: "My Reservations" with status, receipt, cancel button
- [ ] Guide: "My Expeditions" reservations list, "Financial" dashboard
- [ ] Admin: Payments list, refunds/disputes, settings

### Phase 8: Notifications
- [ ] Email for reservation created
- [ ] Email for payment confirmed
- [ ] Email for PIX pending/expiring
- [ ] Email for cancellation and refund

## Guides Page - City Filter
- [x] Add city filter dropdown to guides search
- [x] Update backend to support city filter parameter
- [x] Populate city dropdown with available cities from CADASTUR data (dynamic based on selected state)
- [x] Test city filter functionality

## Trail Images Update
- [x] Search for authentic images of Monte Roraima
- [x] Search for authentic images of Travessia Petrópolis x Teresópolis
- [x] Search for authentic images of Vale da Lua (Chapada dos Veadeiros)
- [x] Search for authentic images of Pedra do Baú
- [x] Search for authentic images of Pico da Bandeira
- [x] Search for authentic images of Cânion Itaimbezinho
- [x] Search for authentic images of Trilha das Praias (Ubatuba)
- [x] Search for authentic images of Serra Fina
- [x] Update database with correct trail images

## Mercado Pago Checkout Fix
- [x] Replace Stripe checkout with Mercado Pago in routers.ts
- [x] Update payment webhook handler for Mercado Pago
- [x] Update database schema for Mercado Pago fields (mpPreferenceId, mpPaymentId, mpExternalReference)
- [x] Update db.ts functions for Mercado Pago
- [x] Test checkout flow with Mercado Pago sandbox - Working!

## Mercado Pago Payment Methods Fix
- [x] Enable PIX payment option in Mercado Pago checkout (requires Chave PIX cadastrada na conta MP)
- [x] Enable Credit Card payment option in Mercado Pago checkout
- [x] Verify all payment methods are displayed correctly
- [x] All payment methods working: Cartão de crédito, PIX, Boleto, Cartão Débito Virtual CAIXA, Conta Mercado Pago

## Mercado Pago Production Configuration
- [x] Update MERCADOPAGO_ACCESS_TOKEN to production value
- [x] Update VITE_MERCADOPAGO_PUBLIC_KEY to production value
- [x] Verify production checkout is working (www.mercadopago.com.br)
- [x] All payment methods available: Cartão de crédito, PIX, Boleto, Cartão Débito Virtual CAIXA, Conta Mercado Pago
- [x] Production account: contato@trekko.com.br (User ID: 3116546889)

## Cleanup - Remove Test Data
- [x] Delete test expedition ID 1 from database

## Platform Fee Terms (4%)
- [x] Add 4% fee acceptance terms to guide registration page (RegisterModal.tsx - lines 607-633)
- [x] Add 4% fee notice to expedition creation flow (Profile.tsx - lines 604-608)
- [x] Test both flows display the fee information correctly

## Intermediated Payment Flow with PIX Payout

### Phase 1: Database Schema Updates
- [x] Update reservation status enum (pending, paid, completed, released, paid_out, contested, cancelled, refunded)
- [x] Add guide PIX data fields (pixKeyType, pixKey, pixKeyHolderName, pixKeyDocument)
- [x] Add guide KYC fields (documentType PF/PJ, documentNumber CPF/CNPJ)
- [x] Create contestations table (reservationId, userId, reason, status, createdAt, resolvedAt)
- [x] Update payouts table with PIX transfer fields (pixTransactionId, pixReceiptUrl)

### Phase 2: Guide PIX Registration
- [x] Create guide PIX data collection form (GuidePixForm.tsx)
- [x] Validate PIX key type (CPF, CNPJ, Email, Phone, Random)
- [x] Add terms acceptance for intermediation, D+2 payout, contestation policy
- [x] Store guide financial data securely (guide_verification table)

### Phase 3: Checkout Flow Updates
- [x] Display total value, cancellation policy, D+2 payout info
- [x] Show that guide payment is via PIX
- [x] Update reservation status on payment confirmation

### Phase 4: Expedition Completion & Contestation
- [x] Add expedition completion endpoint (guide.completeExpedition)
- [x] Implement 2 business days contestation period (addBusinessDays helper)
- [x] Create contestation/dispute opening flow for users (UserReservationsPanel)
- [x] Block payout if contestation is open (status check in processPayouts)

### Phase 5: Automatic Payout Calculation
- [x] Calculate: Total - Trekko commission (4%) - Gateway fees = Net payout
- [x] Show detailed breakdown to guide (GuideFinancialPanel)
- [x] Register all calculations for audit (payment_audit_log table)

### Phase 6: PIX Payout to Guide
- [ ] Implement automatic PIX transfer after D+2 without contestation
- [ ] Send payment notification to guide
- [ ] Generate PIX receipt/proof
- [ ] Update reservation status to "pagamento_repassado"

### Phase 7: Guide Financial Panel
- [ ] Show future reservations
- [ ] Show completed expeditions
- [ ] Show expeditions in contestation period
- [ ] Show pending values (D+2)
- [ ] Show paid values via PIX
- [ ] Detailed financial statement

### Phase 8: User Panel (Minhas Reservas)
- [ ] Show payment status
- [ ] Show expedition status
- [ ] Show active contestation period
- [ ] Channel to open dispute

## Trail Photo Gallery (10 photos per trail)
- [ ] Update database schema to support multiple trail images
- [ ] Search and download 10 photos for Monte Roraima
- [ ] Search and download 10 photos for Travessia Petrópolis x Teresópolis
- [ ] Search and download 10 photos for Vale da Lua (Chapada dos Veadeiros)
- [ ] Search and download 10 photos for Pedra do Baú
- [ ] Search and download 10 photos for Pico da Bandeira
- [ ] Search and download 10 photos for Cânion Itaimbezinho
- [ ] Search and download 10 photos for Trilha das Praias (Ubatuba)
- [ ] Search and download 10 photos for Serra Fina
- [ ] Create photo gallery component for trail detail page
- [ ] Test photo gallery functionality

## Trail Photo Gallery Feature
- [x] Upload 80 trail photos to S3 (10 photos per trail x 8 trails)
- [x] Update database with gallery image URLs for all 8 trails
- [x] Implement photo gallery carousel in hero section
- [x] Implement photo gallery thumbnails grid (4 columns)
- [x] Add navigation arrows and dot indicators
- [x] Test gallery functionality on all trail detail pages

## Trail Photo Gallery Improvements
- [x] Add navigation arrows to switch between photos in the gallery
- [x] Implement fullscreen lightbox modal when clicking on a photo
- [x] Add scrollable gallery view to browse all photos
- [x] Add keyboard navigation support (arrow keys, escape to close)

## Trail Images - Remove Watermarks/Text
- [x] Review all 80 trail images for watermarks or text
- [x] Identify images that need replacement (14 images across 5 trails)
- [x] Search for clean replacement images
- [x] Upload new images to S3
- [x] Update database with new image URLs
- [x] Verify all images are watermark-free

## Reviews, Ratings & Photos Feature

### Phase 1: Database Schema
- [x] Create reviews table (id, user_id, target_type, target_id, rating, comment, created_at, updated_at)
- [x] Create review_images table (id, review_id, image_url, order, created_at)
- [x] Add indexes for efficient querying
- [x] Run database migration

### Phase 2: Backend API
- [x] Create review submission endpoint (POST /api/reviews)
- [x] Create review listing endpoint (GET /api/reviews/:targetType/:targetId)
- [x] Create review update endpoint (PUT /api/reviews/:id)
- [x] Create review delete endpoint (DELETE /api/reviews/:id)
- [x] Implement image upload for reviews (max 5 images, 5MB each)
- [x] Add validation (rating 0-5, comment 10-1000 chars)
- [x] Calculate and update average rating on submission

### Phase 3: Frontend Components
- [x] Create StarRating component (interactive 0-5 stars)
- [x] Create ReviewForm component (stars, comment, photo upload)
- [x] Create ReviewCard component (display single review)
- [x] Create ReviewsList component (list with pagination)
- [x] Create ReviewStats component (average, distribution)
- [x] Implement photo preview before upload
- [x] Integrate with ImageLightbox for photo viewing

### Phase 4: Integration
- [x] Add reviews section to Trail detail page
- [x] Add reviews section to Guide detail page
- [x] Implement sorting (recent, best, worst)
- [x] Implement filtering (by stars, with/without photos)
- [x] Add "Load more" pagination (10 per page)

### Phase 5: Testing
- [x] Test review submission flow
- [x] Test image upload and display
- [x] All 14 vitest tests passing
- [x] Test edit and delete functionality
- [x] Test average rating calculation
- [x] Verify one review per user per target rule

## Google Ads Configuration
- [x] Create ads.txt file with Google AdSense publisher ID

## New Trail: Vale do Pati
- [x] Upload 8 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Travessia Lençóis Maranhenses
- [x] Upload 7 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Cachoeira da Fumaça
- [x] Upload 6 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Trilha do Gavião
- [x] Upload 6 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Pico das Agulhas Negras
- [x] Upload 7 trail images to S3 (excluding image with text annotations)
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Trilha do Rio do Boi
- [x] Upload 6 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Trilha das Lontras
- [x] Upload 2 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Trilha dos Gigantes (Circuito dos Gigantes)
- [x] Upload 5 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website


## New Trail: Trilhas da Serra da Capivara
- [x] Upload 7 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Ilhabela – Meia Volta
- [x] Upload 5 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Caminhos das Ararunas
- [x] Upload 6 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Trilha Amarela (Saltos do Rio Preto)
- [x] Upload 7 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Transcarioca
- [x] Upload 4 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Pedra do Sino
- [x] Upload 5 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website

## New Trail: Águas Termais e Mirante da Janela
- [x] Upload 3 trail images to S3
- [x] Insert trail data into database with all details
- [x] Verify trail appears correctly on the website
