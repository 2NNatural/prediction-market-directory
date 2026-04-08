# CONTEXT.md — Project Memory File

**Upload this file at the start of every new Claude session to restore full context.**

For what's been built, see [PROGRESS.md](PROGRESS.md).
For what comes next, see [ROADMAP.md](ROADMAP.md).

---

## Who I Am

USC student in Los Angeles. Strong interest in crypto/Web3. Attended ETHDenver. Working on this as a capstone project for a frontier blockchain course. No prior coding knowledge — using vibe coding with Claude Code. Have access to some talented engineers for advice, but would rather be time efficient if possible.

---

## Project Goal (My Words)

> "I am working on a live and updating map of prediction market application layers."

**Problem:**
> "Currently, the last thorough map I can find is from September 2025, an eternity ago with how new the technology is. Additionally, the categories are subjective, and many application layers combine multiple factors."

**What I want it to do:**
> "I want my map to be enduring by having live updates where users can submit sites, and I also want it to have synergy to show that a tool can fit in multiple categories/do multiple things at once."

**Technical constraints:**
> "I have no prior coding knowledge, I can put a month or so into learning vibe coding with Claude Code, and have access to some talented engineers for advice, but would rather be time efficient if possible"

**Budget:** Free tier preferred ($0). Supabase free tier, Vercel free tier, Anthropic API at ~$0.003/classification.

---

## Behavioral Instructions (My Exact Words)

> "I will be using this thread for several months of work and want to ensure you retain maximal context."

Keep CONTEXT.md, PROGRESS.md, and ROADMAP.md up to date at the end of every work session. These files ARE the memory.

> "I am skipping airtable building right now actually."

Pivoted from no-code (Airtable) to vibe coding with Claude Code. Do not suggest reverting to Airtable or no-code tools.

> "I am bridging a branch of this project to Claude Code. While I will still be working on this thread, I will also be seeing if Claude Code can perform the task faster/more automated."

Two parallel workstreams existed early on. Now fully in Claude Code.

> "This all looks good. Can we name the markdown file differently, so I have a better idea its purpose within the project?"

Preference for **clear, descriptive file names**. Never use auto-generated or opaque names for anything user-facing.

> "The capstone plan is made already. No need to make that, we are working on the actual product and code now."

Do not drift into academic deliverables or planning when the user wants to build. Stay focused on the product.

> "These are not code questions - just questions about the new functionality you've built."

Distinguish between operational/product questions (answer conversationally) and code tasks (execute). Not everything is a code task.

> "To confirm, you understand that you are working within the prediction-market-directory file, correct?"

Always confirm the working directory context. Working directory: `/Users/noahneri/prediction-market-directory`.

---

## API Route Names — Critical Notes

The scraping/classification route is at **`/api/analyze`** (file: `src/app/api/analyze/route.ts`). The user has referred to it as `/api/scrape` in mission briefs. There is **no `/api/scrape` route** — it does not exist. Always use `/api/analyze`.

The stats route is at **`/api/stats`** (file: `src/app/api/stats/route.ts`). Takes `?slug=<slug>` query param. Returns DeFiLlama protocol stats (TVL, Fees, Revenue, Chains).

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | ^15.5.12 |
| UI | React | ^19.2.4 |
| Styling | Tailwind CSS | ^4 |
| Components | shadcn/ui | ^3.8.5 |
| Database | Supabase (PostgreSQL) | — |
| DB Client | @supabase/supabase-js | ^2.98.0 |
| DB SSR | @supabase/ssr | ^0.8.0 |
| Language | TypeScript (strict) | ^5 |
| AI SDK | Vercel AI SDK (ai) | ^6.0.116 |
| AI Provider | @ai-sdk/anthropic | ^3.0.58 |
| Schema Validation | zod | ^4.3.6 |
| Deployment target | Vercel | — |
| Scraping | jina.ai reader (no dependency) | — |
| Script runner | tsx (via npx, no install) | — |
| Protocol Stats | DeFiLlama free API (no dependency) | — |
| Future visualization | react-force-graph-2d | not installed yet |

**shadcn components installed:** badge, card, checkbox, scroll-area, separator, button, input, dialog, sheet

**AI Model in use:** `claude-sonnet-4-5` via `generateObject`

**Node.js requirement:** 64-bit only (`process.arch` must be `x64`). The 32-bit build cannot run SWC and crashes silently.

---

## The 5-Dimension Taxonomy

The single source of truth for valid tag values is `src/types/index.ts`. DB CHECK constraints enforce these same values.

### 1. Content — What the market is about
`Sports` | `Politics` | `Pop Culture` | `Financials` | `Science/Tech` | `Governance/DAO`

### 2. Instrument — The contract structure
`Binary Spot` | `Scalar` | `Perpetual` | `Parlay` | `Conditional (Futarchy)`

### 3. Execution — How prices/orders work
`CLOB` | `AMM` | `Parimutuel`

### 4. Interface — How users interact
`Pro Terminal` | `Retail Wrapper` | `Social Wrapper` | `Agentic` | `Aggregator`

### 5. Resolution — How outcomes are determined
`Centralized` | `Optimistic` | `Social` | `On-Chain` | `AI Oracle`

**Key rules:**
- Apps CAN and SHOULD have multiple tags per dimension
- Router Rule: Aggregators inherit Execution/Instrument tags of underlying protocols
- Melee Rule: Parimutuel + AMM-style pricing = tag both
- Agentic Check: API-first / bot-intended = "Agentic" in interface_tags

---

## Architecture Decisions

**`text[]` arrays, not junction tables** — Tags are fixed/domain-stable. Supabase `.overlaps()` maps to PostgreSQL `&&`. GIN-indexed. Junction tables add JOIN complexity with zero benefit at this scale.

**URL search params, not React state** — Filter state in URL = shareable links, server-side rendering, no loading spinners, browser back/forward works free. `FilterSidebar` is client, `DirectoryPage` is server.

**AND-across / OR-within filtering** — Multiple tags in same dimension = OR. Tags in different dimensions = AND. Implemented via chained `.overlaps()` calls.

**`status` column workflow** — New submissions arrive as `pending`. Only `approved` rows appear in the public directory. Manual approval via Supabase dashboard until admin portal is built.

**Service role client for INSERT** — RLS allows public SELECT only. API route uses `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_`) via `src/lib/supabase/service.ts`.

**Favicon via Google API, no Next.js Image** — AppCard and AppDetailModal use plain `<img>` with `src=https://www.google.com/s2/favicons?domain=${domain}&sz=128` and `onError` letter fallback. Deliberately avoids Next.js `<Image>` to skip needing domain allowlisting in `next.config.ts`.

**SubmitAppForm trigger prop pattern** — `SubmitAppForm` accepts an optional `trigger?: React.ReactNode`. If provided, wraps it in `<DialogTrigger asChild>`. If not, renders the default pill button. All dialog logic stays in one component; any element in the app can open it.

**Flat tag display on AppCard** — All tags rendered in a single `flex-wrap` row regardless of dimension. Active filter tags highlight as `bg-[#0A0A0A] text-white`; inactive as `bg-gray-100 text-gray-800`. `activeTagSet` built as a `Set` across all active filter arrays for O(1) lookup.

**shadcn components replaced in filter UI** — `Checkbox`, `Separator`, `ScrollArea`, and `Button` from shadcn removed from `FilterGroup.tsx` and `FilterSidebar.tsx`. Replaced with pure Tailwind. Sheet (from shadcn) IS used for the mobile drawer.

**Order-Routing Test** — AI guardrail in the analyze pipeline that rejects sites which don't actually execute trades. `isValidApplication: boolean` and optional `rejectReason` added to the Zod schema. The 5 tag dimensions are wrapped in an optional `dimensions` object — only filled if `isValidApplication` is true. Rejected sites: logged to console, return 200 `{ message, reason }`, NOT inserted into Supabase. Contact email in reject reason: `nneri@usc.edu`.

**URL normalization before dedup check** — Incoming URLs are parsed with `new URL()` and reconstructed as `origin + pathname.replace(/\/+$/, '') + search + hash` before the duplicate check. Prevents `https://polymarket.com` and `https://polymarket.com/` from being treated as different URLs.

**Mobile filter sheet** — `MobileFilterSheet.tsx` uses URL-driven filter state (same as desktop sidebar), so no state-lifting is needed. Both components stay in sync via URL params automatically. Sheet closes after each filter toggle to show results immediately.

**Bulk seed script** — `scripts/bulk-seed.ts` calls the same `/api/analyze` API route that the frontend uses. All safeguards (duplicate check, rate limiting, Order-Routing Test) apply identically. Run with `npx tsx scripts/bulk-seed.ts` while dev server is running. Logs 4 outcomes: ✓ Accepted, ↷ Skipped, ↷ Duplicate, ✗ Failed.

**App detail modal (not full page)** — User chose a modal/dialog overlay over a dedicated `/directory/[slug]` page. Clicking a card opens a shadcn Dialog showing: full description (no truncation), tags grouped by dimension with section headings, and DeFiLlama protocol stats. The modal is a controlled component — AppCard manages `open` state, external link icon has `stopPropagation` so it doesn't trigger the modal.

**DeFiLlama free API for protocol stats** — `/api/stats` route matches app slugs against DeFiLlama's protocol index using exact → normalized slug → normalized name fallback. Two endpoints fetched in parallel: `/protocols` for TVL, `/overview/fees` for fees. Per-protocol detail from `/summary/fees/{slug}` for revenue. Both lists cached 10 minutes in-memory. Graceful fallback ("Protocol stats not available on DeFiLlama") when no match found.

**Stats metric iterations (Session 6)** — Started with TVL + 24h Volume + Monthly Volume. User switched to Open Interest. User switched again to final choice: **TVL, Fees (24h), Revenue (24h), Chain(s)**. The `/api/stats` route and `AppDetailModal` were rewritten each time. Current state reflects the final choice.

---

## Key File Map

```
src/types/index.ts                               ← SINGLE SOURCE OF TRUTH for all tags and types
src/lib/queries/applications.ts                 ← Main DB query (filters by status='approved')
src/lib/supabase/server.ts                      ← Server component Supabase client
src/lib/supabase/service.ts                     ← Service role client (INSERT, bypasses RLS)
src/lib/supabase/client.ts                      ← Browser Supabase client
src/lib/scraper.ts                              ← jina.ai URL scraper
src/lib/ai/schema.ts                            ← Zod schema: isValidApplication, rejectReason, dimensions (optional)
src/lib/ai/prompt.ts                            ← System prompt with taxonomy rules + Order-Routing Test
src/lib/utils.ts                                ← cn(), parseSearchParams(), buildFilterUrl(), toggleTag()
src/app/globals.css                             ← Tailwind + shadcn CSS vars + .custom-scrollbar utility
src/app/layout.tsx                              ← Root layout: Inter font, Navbar, bg-[#FAFAFA] body
src/app/directory/page.tsx                      ← Server: reads searchParams, fetches, renders
src/app/api/analyze/route.ts                    ← POST /api/analyze: normalize URL → dedup → scrape → classify → insert
src/app/api/stats/route.ts                      ← GET /api/stats?slug=: DeFiLlama TVL + fees + revenue lookup
src/components/Navbar.tsx                       ← Client: sticky nav with logo + Submit App button only
src/components/directory/FilterSidebar.tsx      ← Client: desktop-only (hidden lg:block), URL push on toggle
src/components/directory/FilterGroup.tsx        ← Client: pure Tailwind checkbox list per dimension
src/components/directory/MobileFilterSheet.tsx  ← Client: mobile-only (lg:hidden), shadcn Sheet drawer
src/components/directory/AppCard.tsx            ← Client: clickable card, opens AppDetailModal, favicon + flat tags
src/components/directory/AppDetailModal.tsx     ← Client: controlled Dialog — full description, tags by dimension, DeFiLlama stats
src/components/directory/AppGrid.tsx            ← Server: responsive card grid + SubmitAppForm dashed card
src/components/directory/SubmitAppForm.tsx      ← Client: dialog with optional trigger prop, handles rejected phase
scripts/bulk-seed.ts                            ← Script: loops TARGET_URLS, POST to /api/analyze, 5s delay, 4 outcome states
supabase/schema.sql                             ← Full DDL
supabase/seed.sql                               ← Seed apps
supabase/migrations/add-status-column.sql       ← Migration: adds status column (already run)
```

---

## Environment Variables

```bash
# .env.local — never commit this file
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key        # public, browser-safe
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key            # server-only, bypasses RLS
ANTHROPIC_API_KEY=sk-ant-...                               # server-only, AI classification
```

Get Supabase keys from: Dashboard → Settings → API. Use the **anon/public** key for `ANON_KEY`, the **service_role** key for `SERVICE_ROLE_KEY`.
Get Anthropic key from: console.anthropic.com. Free $5 credit on signup. ~$0.003 per URL classification.

---

## Current Status (as of 2026-04-07)

- Phase 1 (MVP directory): **Complete**
- Scraping & AI tagging pipeline: **Complete and live**
- Frontend overhaul: **Complete**
- Mobile responsive filter: **Complete** — shadcn Sheet drawer on mobile
- Order-Routing Test guardrail: **Complete** — non-execution apps rejected pre-insert
- Bulk seed script: **Complete** — `scripts/bulk-seed.ts`, 200 URLs queued and processed
- App detail modal: **Complete** — click card to expand, shows full description + DeFiLlama stats (TVL, Fees, Revenue)
- DeFiLlama integration: **Complete** — `/api/stats` route fetching TVL, Fees (24h), Revenue (24h), Chains
- Deployment: **Live** — https://prediction-market-directory.vercel.app/directory
- Admin portal: **Not built** — manual approval via Supabase Table Editor

### Manual Approval Workflow (until admin portal exists)
1. Supabase Dashboard → Table Editor → `applications`
2. Find rows with `status = 'pending'`
3. Click the status cell → change to `approved` or `rejected`

### Known Limitations
- Rate limiting is in-memory (`Map`) — resets on every server restart/cold start (not production-grade)
- No email notifications when submissions are approved
- `logo_url` is null for all rows — favicons are derived live from the URL field, not stored
- `urlCooldowns` Map is not shared across serverless function instances on Vercel
- jina.ai: if it's down, submissions fail with 502; no fallback
- DeFiLlama stats only available for protocols in their index — newer/centralized apps won't have data
- DeFiLlama protocol cache and fees cache are in-memory (10min TTL) — reset on cold start like rate limiting

---

## Reference Maps (Inspiration)
- [polymark.et](https://polymark.et)
- [Messari Crypto prediction market map](https://x.com/MessariCrypto/status/1970182183718687152)
- [Saul Munn Notion map](https://saul-munn.notion.site/Map-of-the-Prediction-Market-Forecasting-Ecosystem-4ffddd0f10d64fdb92235b374ec5e3f1)
- [Mikey0x_ Twitter map](https://x.com/Mikey0x_/status/1823025965598969876)
