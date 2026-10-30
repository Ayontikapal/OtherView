# OtherView V3 — Master Implementation Plan

## Overview
OtherView V3 upgrades the existing AI-powered physical accessibility inspection assistant into an account-based, persistent accessibility improvement platform built with Next.js 15, React 19, Tailwind CSS, Google Gemini multimodal AI, and Appwrite Cloud (Auth, TablesDB, Storage).

## Phase Checklist

### Phase 1: Repository Audit & Architecture Design (Completed)
- [x] Inspected existing codebase (Next.js 15, React 19, Gemini, IndexedDB, Zod schemas, test suite).
- [x] Verified working features: Gemini 4-perspective inspection, action checklist, report export, before/after reassessment, demo data.
- [x] Identified persistence gap: currently only browser IndexedDB.
- [x] Selected official `node-appwrite` SDK for secure server-side session handling, TablesDB, and Storage.

### Phase 2: Appwrite Foundation & Authentication
- [x] Install `node-appwrite`.
- [ ] Create server-side Appwrite client helper (`lib/appwrite/server.ts`):
  - Session client with HTTP-only cookie `appwrite-session`
  - Admin client with `APPWRITE_API_KEY`
  - Graceful configuration checker (`isAppwriteConfigured()`)
- [ ] Implement Auth API routes:
  - `POST /api/auth/signup`
  - `POST /api/auth/signin`
  - `POST /api/auth/signout`
  - `GET /api/auth/me`
- [ ] Implement Client Auth Context & Hook (`lib/auth/auth-context.tsx`).
- [ ] Build Login (`/login`) and Sign Up (`/signup`) pages with redirect support.
- [ ] Update Header (`components/layout/app-header.tsx`) with user avatar, name, and sign in/out controls.

### Phase 3: TablesDB Data Model & Inspection Persistence
- [ ] Design normalized schema for TablesDB:
  - `inspections` (metadata, summary, notes, file references)
  - `findings` (linked to inspection, perspective, evidence, priority, coordinates)
  - `checklist_items` (linked to inspection, action text, status)
  - `reassessments` (linked to inspection, comparisons, progress)
- [ ] Create automated database/storage provisioner (`lib/appwrite/init.ts` and `POST /api/appwrite/init`).
- [ ] Implement Private Storage helper (`lib/appwrite/storage.ts` and `/api/storage/upload`, `/api/storage/file/[id]`).
- [ ] Implement Server-side Inspection APIs with strict ownership checks:
  - `GET /api/inspections` (list only current user's inspections)
  - `POST /api/inspections` (create new inspection for current user)
  - `GET /api/inspections/[id]` (fetch inspection, verifying owner)
  - `PUT /api/inspections/[id]` (update title, notes, checklist, reassessment, verifying owner)
  - `DELETE /api/inspections/[id]` (delete inspection, related records, and files, verifying owner)
- [ ] Add dual-persistence manager (`lib/storage/inspection-service.ts`) that handles Appwrite Cloud when logged in, with IndexedDB fallback/migration.

### Phase 4: Inspection Management & Workflow Integration
- [ ] Update `/inspections` dashboard:
  - Account summary (total inspections, completed actions, cloud sync indicator)
  - Migration button ("Import browser-saved inspections to your account")
  - Delete confirmation modal
  - Loading skeletons & empty states
- [ ] Update `/inspect` workspace:
  - Save status indicators (Unsaved / Saving... / Saved to Cloud)
  - Auto-sync notes and checklist actions to Appwrite Cloud
  - Prevent accidental loss on navigate away
  - Reopen inspection without re-running Gemini AI

### Phase 5: Reassessment & Improvement Tracking
- [ ] Connect Before vs After follow-up photo flow to Appwrite Storage and TablesDB.
- [ ] Persist reassessment history under parent inspection.
- [ ] Retain cautious change labels (`appears_improved`, `still_visible`, `newly_observed`, `requires_verification`).
- [ ] Ensure Report Export (`report-modal.tsx`) prints saved reassessment data and inspection notes.

### Phase 6: Product Polish & Documentation
- [ ] Update Home page (`app/page.tsx`) with V3 value proposition, account features, and guest vs cloud indicators.
- [ ] Create comprehensive `APPWRITE_SETUP.md` with step-by-step console guide, schema explanation, and security permissions.
- [ ] Update `.env.example` with exact variable names and comments.
- [ ] Update `README.md` with V3 architecture, hackathon walkthrough, and compliance notice.

### Phase 7: Verification & Quality Assurance
- [ ] Extend automated test suite (`test-suite.mjs` + `test-v3-auth-persistence.mjs`) to test:
  - Two-user authorization isolation (User A vs User B)
  - Input validation and schema conformance
  - Persistence lifecycle (create -> update -> restore -> delete)
  - Gemini & reassessment contract validity
- [ ] Run TypeScript checks (`tsc --noEmit`).
- [ ] Run production build (`next build`).
- [ ] Prepare final implementation report.
