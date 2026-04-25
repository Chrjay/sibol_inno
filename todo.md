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

## Phase 9: Firebase Migration
- [x] Install firebase and firebase-admin packages
- [x] Store Firebase config as environment secrets
- [x] Create Firebase client initialization file
- [x] Create Firebase Admin SDK initialization (server-side)
- [x] Replace Manus OAuth login with Firebase Google Sign-In
- [x] Replace useAuth hook to use Firebase Auth state
- [x] Replace all Drizzle/MySQL queries with Firestore collections
- [x] Update tRPC context to verify Firebase ID tokens
- [x] Update all tRPC procedures (profile, pathway, programs, chat) to use Firestore
- [x] Seed programs into Firestore
- [x] Run tests and verify end-to-end flow

## Phase 10: Firebase Security Rules + Proper Login System
- [x] Write Firestore security rules (users can only read/write their own data, programs are public read)
- [x] Apply security rules via firebase-admin on server startup
- [x] Add Email/Password sign-in support to FirebaseAuthContext
- [x] Add sign-up with email/password to FirebaseAuthContext
- [x] Add password reset (forgot password) flow
- [x] Build dedicated Login page with Google + Email/Password tabs
- [x] Build Sign-Up page with name, email, password fields
- [x] Build Forgot Password page
- [x] Update App.tsx routes for /login, /signup, /forgot-password
- [x] Update AppLayout to redirect to /login instead of /
- [x] Update Home landing page CTA to go to /login
- [x] Run tests and verify auth flows

## Phase 11: Google Sign-In Fix
- [x] Switch signInWithGoogle from signInWithPopup to signInWithRedirect (works in iframe/preview)
- [x] Handle getRedirectResult on app load to complete the sign-in after redirect returns

## Phase 12: Google Auth iframe Fix
- [ ] Switch back to signInWithPopup for Google Sign-In (redirect fails in iframe)
- [ ] Add "Open in new tab" hint on login page for users in preview/iframe context
- [ ] Ensure popup works correctly when app is opened directly (not in iframe)
