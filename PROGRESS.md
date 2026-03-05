# PROGRESS.md — Build Changelog

---

## Session 1 — 2026-03-04 — Initial MVP

**What was built:**

- Next.js 15 app with App Router, TypeScript strict, Tailwind CSS 4, shadcn/ui
- Supabase PostgreSQL schema with 5 `text[]` tag columns, GIN indexes, CHECK constraints, RLS
- `applications` table with `id`, `name`, `slug`, `description`, `url`, `logo_url`, 5 tag arrays, timestamps
- Auto-updating `updated_at` trigger
- `src/types/index.ts` — single source of truth: all tag constants, `Application` interface, `FilterState`, `DimensionConfig`, `DIMENSION_CONFIGS`
- `src/lib/supabase/server.ts` — server component Supabase client
- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/queries/applications.ts` — `fetchApplications(filters)` with chained `.overlaps()` (AND-across / OR-within)
- `src/lib/utils.ts` — `cn()`, `parseSearchParams()`, `buildFilterUrl()`, `toggleTag()`
- `src/app/directory/page.tsx` — server component: reads searchParams, fetches, renders sidebar + grid
- `src/components/directory/FilterSidebar.tsx` — client: URL-push on checkbox change, "Clear all"
- `src/components/directory/FilterGroup.tsx` — client: checkbox list per dimension
- `src/components/directory/AppGrid.tsx` — server: responsive 1/2/3-col grid, empty state
- `src/components/directory/AppCard.tsx` — client: app card with dimension badges, active filter highlighting
- `supabase/schema.sql` — full DDL
- `supabase/seed.sql` — 3 seed apps: Polymarket, Sharpe.ai, Billy Bets
- shadcn components: badge, card, checkbox, scroll-area, separator, button

**Architecture decisions made:**
- `text[]` arrays over junction tables (tags are fixed, `.overlaps()` maps to `&&`, zero JOIN complexity)
- URL search params over React state (shareable links, server-side rendering, browser nav)
- AND-across / OR-within via chained `.overlaps()` calls

**Verification:**
- `/directory` loads 3 apps
- CLOB filter shows all 3; CLOB + Pro Terminal shows only Sharpe.ai; AMM shows only Billy Bets
- URL copy/paste preserves filter state; "Clear all" resets

---

## Session 2 — 2026-03-04 — Scraping & AI Tagging Pipeline

**What was built:**

| File | What it does |
|------|-------------|
| `supabase/migrations/add-status-column.sql` | Adds `status` column (pending/approved/rejected), migrates existing rows to approved |
| `src/types/index.ts` | Added `APPLICATION_STATUSES`, `ApplicationStatus`, `status` field on `Application` interface |
| `src/lib/queries/applications.ts` | Added `.eq('status', 'approved')` — pending/rejected apps hidden from public directory |
| `src/lib/supabase/service.ts` | Service role client using `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS for INSERT |
| `src/lib/scraper.ts` | `scrapeUrl(url)` — validates URL (http/https only, SSRF protection), fetches via jina.ai reader, 15s timeout, truncates to 8000 chars |
| `src/lib/ai/schema.ts` | Zod schema importing tag constants from `types/index.ts`; enforces exact valid tag values via `z.enum()` |
| `src/lib/ai/prompt.ts` | System prompt with full taxonomy, Router Rule, Melee Rule, Agentic Check, Mention Market Rule |
| `src/app/api/analyze/route.ts` | POST /api/analyze — validate URL, check duplicate, scrape, classify, check slug collision, insert as pending |
| `src/components/directory/SubmitAppForm.tsx` | Client dialog: idle→loading→success/error states, reuses Badge component for tag display |
| `src/app/directory/page.tsx` | Added "Submit App" button in header triggering dialog |

**New npm packages:**
- `ai` ^6.0.116 (Vercel AI SDK core — `generateObject`)
- `@ai-sdk/anthropic` ^3.0.58 (Claude provider)
- `zod` ^4.3.6 (schema validation)

**New shadcn components:**
- `src/components/ui/input.tsx`
- `src/components/ui/dialog.tsx`

**Implementation decisions:**
- jina.ai reader chosen over cheerio (no dependency, returns clean markdown, acts as proxy)
- `generateObject` with Zod schema — automatic retry on validation failure, no manual parsing
- In-memory `Map` for rate limiting (5-min cooldown per URL) — not production-grade, acceptable for MVP
- Service role key (not public anon key) used for INSERT to keep RLS locked down
- Slug collision handled by appending random 4-char hex suffix

**TypeScript fix made:**
- `searchParams` type changed from union to `Promise<...>` only (Next.js 15 requirement)
- `analysis` type changed from `unknown` to explicit `ApplicationAnalysis` import

---

## Known Issues / Limitations (Open)

| Issue | Severity | Notes |
|-------|----------|-------|
| In-memory rate limiting | Low | Resets on server restart; not shared across Vercel instances |
| No admin portal | Medium | Approval requires manual Supabase Table Editor access |
| No logo fetching | Low | `logo_url` is null for all submitted apps |
| jina.ai dependency | Medium | If jina.ai is down, submissions fail with 502; no fallback |
| No email on approval | Low | Users don't know when their submission is approved |
