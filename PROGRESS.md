# PROGRESS.md — Build Changelog

---

## Session 4 — 2026-03-06 — Frontend Overhaul

**What was built:**

### New Files
| File | What it does |
|------|-------------|
| `src/components/Navbar.tsx` | Sticky nav: "P" black rounded-lg logo + "PM Directory" text, "About" + "Newsletter" placeholder links, Submit App pill button (opens SubmitAppForm dialog) |

### Modified Files
| File | What changed |
|------|-------------|
| `src/app/globals.css` | Added `.custom-scrollbar` utility: 4px scrollbar width, transparent track, `#E5E5E5` thumb |
| `src/app/layout.tsx` | Added `<Navbar />` above `{children}`; body className now `bg-[#FAFAFA] min-h-screen flex flex-col` |
| `src/components/directory/SubmitAppForm.tsx` | Added optional `trigger?: React.ReactNode` prop — if provided wraps in `<DialogTrigger asChild>`, otherwise renders default outline button |
| `src/components/directory/FilterGroup.tsx` | Removed shadcn `Checkbox` + `Separator`. Replaced with pure Tailwind custom checkboxes: `w-4 h-4 border rounded` div with SVG checkmark when checked. Group hover states via CSS group class. |
| `src/components/directory/FilterSidebar.tsx` | Removed `ScrollArea` + shadcn `Button`. New wrapper: `w-64 flex-shrink-0 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pb-10`. "FILTERS" label + plain text "Reset" button. |
| `src/components/directory/AppCard.tsx` | Full rewrite: Google favicon API (`https://www.google.com/s2/favicons?domain=${domain}&sz=128`) with `useState(false)` imgError → letter fallback. External link icon top-right. Flat tag display — all 5 dimensions combined into one `flex-wrap` row. Active filter tags: `bg-[#0A0A0A] text-white`; inactive: `bg-gray-100 text-gray-800`. |
| `src/components/directory/AppGrid.tsx` | Added `<SubmitAppForm>` with dashed card trigger appended after all app cards. Appears in both normal and empty states. `SubmitCardContent` helper renders plus icon + "Submit an App" text. |
| `src/app/directory/page.tsx` | Removed `SubmitAppForm` from header (moved to Navbar). New layout: `flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 flex gap-12`. FilterSidebar no longer wrapped in `<aside>` (handles its own sticky positioning). Added footer with copyright. |

**Implementation decisions:**
- Plain `<img>` for favicons (not Next.js `<Image>`) — avoids adding Google's domain to `next.config.ts` allowlist
- `SubmitAppForm` trigger prop keeps all dialog logic in one component; both Navbar + grid card open the same dialog
- All tags rendered flat on AppCard — no dimension grouping — matches the new mockup aesthetic
- `activeTagSet` built as a JavaScript `Set` (not array filter) for O(1) tag lookup during render
- Removed shadcn `Checkbox`, `Separator`, `ScrollArea`, `Button` from filter components entirely

**TypeScript check result:** `npx tsc --noEmit` — no errors.

**Other:**
- Billy Bets URL corrected directly in Supabase (no code change). Favicon auto-updates on next page load since it's derived from the `url` field.

---

## Session 3 — 2026-03-06 — Pipeline Activation & Verification

**What was done:**
- Ran `supabase/migrations/add-status-column.sql` in Supabase SQL Editor — confirmed successful
- Added `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` to `.env.local`
- Tested Submit App pipeline end-to-end — **confirmed working**

**Pipeline is now fully live** (locally). Submissions scrape, classify, and insert as pending. Manual approval via Supabase Table Editor promotes rows to `approved` status and they appear in the directory.

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

**TypeScript fixes:**
- `searchParams` type changed from union to `Promise<...>` only (Next.js 15 requirement)
- `analysis` type changed from `unknown` to explicit `ApplicationAnalysis` import

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

## Known Issues / Limitations (Open)

| Issue | Severity | Notes |
|-------|----------|-------|
| In-memory rate limiting | Low | Resets on server restart; not shared across Vercel instances |
| No admin portal | Medium | Approval requires manual Supabase Table Editor access |
| `logo_url` not stored | Low | Favicons are derived live from the URL field via Google API; `logo_url` column is null for all rows |
| jina.ai dependency | Medium | If jina.ai is down, submissions fail with 502; no fallback |
| No email on approval | Low | Users don't know when their submission is approved |
| Navbar links are placeholders | Low | "About" and "Newsletter" both link to `href="#"` |
