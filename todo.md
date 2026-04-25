# Sibol — Project TODO

## Phase 1: Foundation
- [x] Global theme: pastel gradient background (lavender, blush pink, pale mint), serif + sans-serif typography, green brand colors
- [x] Database schema: users (extended), userProfiles, pathways, pathwaySteps, programs, chatMessages
- [x] tRPC procedures: profile CRUD, pathway generation, progress tracking, programs listing, chat

## Phase 2: User Onboarding & Profiling
- [x] Multi-step onboarding wizard (education, skills, location, dependents, goals)
- [x] Profile page with edit capability
- [x] Redirect new users to onboarding on first login

## Phase 3: AI Pathway Matching
- [x] LLM-powered pathway generation from user profile
- [x] Pathway display with step-by-step roadmap
- [x] Save generated pathway to database
- [x] Regenerate pathway option

## Phase 4: Progress Dashboard
- [x] Visual progress bar / milestone tracker
- [x] Current stage highlight
- [x] Mark step as complete
- [x] Next recommended action card

## Phase 5: Location-Based Resource Discovery
- [x] Google Maps integration via Manus proxy
- [x] Show nearby TESDA centers, DOLE offices, microfinance institutions
- [x] Filter by resource type (TESDA, DOLE, DSWD, Microfinance)
- [x] Location permission request flow

## Phase 6: Resource & Program Directory
- [x] Seeded list of 12 real Philippine government programs (TESDA, DOLE, SLP, DSWD, DTI, OWWA, etc.)
- [x] Filter by category (training, grants, employment, microfinance, social_protection, enterprise)
- [x] Search by keyword
- [x] Program detail view with eligibility, benefits, how to apply

## Phase 7: AI Chat Assistant
- [x] Bilingual chat (Filipino + English auto-detect)
- [x] Context-aware: knows user profile and current pathway
- [x] Chat history persisted per user
- [x] Quick question suggestions

## Phase 8: Polish & QA
- [x] Mobile-first responsive layout (375px base)
- [x] Touch-friendly tap targets (min 44px)
- [x] Sibol brand: green growth theme, logo, motto
- [x] Loading and error states on all pages
- [x] 12 Vitest unit tests passing (auth, profile, programs, pathway, chat)
- [x] Final checkpoint
