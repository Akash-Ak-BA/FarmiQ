# Changelog

All notable changes to FarmiQ are documented here.

## [v1.0.0] — 2026-11-21 (Initial Production Release)

### Added — Step 1: Project Setup & Database
- Next.js 14 (App Router, TypeScript, Tailwind CSS) initialized
- MySQL 8.4 database with 21-table schema (`farmiq_schema.sql`)
- Prisma ORM with full schema mapping
- Database health check endpoint (`/api/health`)

### Added — Step 2: Static UI (13 Screens)
- Sign In (`/signin`), Create Account (`/create-account`)
- Home (`/home`), Notifications (`/notifications`)
- My Crops (`/crops`), Crop Detail (`/crops/detail`)
- Crop Damage Check (`/scan`), Chatbot (`/ask`)
- Weather (`/weather`), Market Prices (`/market-prices`)
- Inventory (`/inventory`), Marketplace (`/marketplace`)
- Sell Product (`/marketplace/sell`)
- Full multilingual translations: English, தமிழ் (Tamil), తెలుగు (Telugu)
- Light / Dark theme toggle

### Added — Step 3: Accounts & Security
- bcrypt password hashing (salt rounds = 10)
- SHA-256 session tokens, HTTP-only cookies, 1-year stay signed in
- `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Settings page with language, theme, and logout
- Row-level privacy helper `scopeToUser(userId)`

### Enhanced — User Improvements (Pre-Step 4)
- Dynamic real date on Home screen
- Farmer profile photo (upload in Settings, displayed on Home)
- Add Crop page with field size input and harvest date prediction
- Tasks grouped by crop (Paddy / Tomato / Groundnut) with next 5 tasks each
- Completing a task auto-logs it into Daily Log
- Daily Log total spend breakdowns by crop
- Real Open-Meteo weather integration with GPS + district lookup
- Add Inventory Item page with photo verification on "Use"
- Live Marketplace with 100 km radius filter from MySQL listings

### Added — Crop Check (Step 4 prep)
- Photo confirmation before analysis ("Is this photo clear and okay?")
- Dynamic multi-defect diagnosis — unique result per image signature
- Dynamic natural remedy + chemical advisory + safety note
- CIBRC safety advisory disclaimer added to results

### Added — Chatbot Improvements
- Harvest countdown answers ("56 days until harvest") without scheduling
- Future-only task scheduling (never schedules past dates)
- Tamil and Telugu language harvest answers

### Added — Step 4: Live MySQL Integration
- `/api/crops` (GET + POST) — live crop list and crop creation
- `/api/crops/[id]` (GET + PATCH) with ownership verification
- `/api/crops/[id]/checkin` (POST) — crop monitoring check-ins to MySQL
- `/api/crop-master` — reference crop data from MySQL
- `src/lib/crop-service.ts` — crop serialization, `ensureDefaultFarmAndCrops()`
- Crops page reads from MySQL (falls back to sample data gracefully)
- Crop Detail: crop tabs selector, task schedule from DB, check-in modal
- Add Crop: fetches crop master from DB, saves to MySQL with 5 lifecycle tasks
- 15/15 automated verification tests passing (`scripts/test-step4-crops.js`)

### Added — Security & Compliance (This Release)
- Ownership enforcement on all `/api/crops/[id]` and `/api/crops/[id]/checkin` routes
- Input validation: BigInt ID guard, enum allowlists, string length limits
- `PrivacyPolicyModal` component on Settings page
- `AgriculturalDisclaimer` component placed on Scan, Chatbot, Weather, Marketplace
- Settings page: app version details (v1.0.0, build, tech stack, compliance)
- `README.md` — full project documentation
- `PRIVACY_POLICY.md` — DPDP Act 2023 compliant
- `TERMS_OF_USE.md` — marketplace and advisory terms
- `AGRICULTURAL_DISCLAIMER.md` — ICAR/CIBRC/IMD statutory notices
- `SECURITY.md` — security audit summary
