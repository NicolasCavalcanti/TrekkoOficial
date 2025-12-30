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
