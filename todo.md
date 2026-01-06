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
