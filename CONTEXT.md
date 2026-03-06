# CONTEXT.md — Project Memory File

**Upload this file at the start of every new Claude session to restore full context.**

For the full technical spec, architecture decisions, and taxonomy details, see [CLAUDE.md](CLAUDE.md).
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

Keep CONTEXT.md, PROGRESS.md, ROADMAP.md, and CLAUDE.md up to date at the end of every work session. These files ARE the memory.

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
| Future visualization | react-force-graph-2d | not installed yet |

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

**Favicon via Google API, no Next.js Image** — AppCard uses plain `<img>` with `src=https://www.google.com/s2/favicons?domain=${domain}&sz=128` and `onError` letter fallback. Deliberately avoids Next.js `<Image>` to skip needing domain allowlisting in `next.config.ts`.

**SubmitAppForm trigger prop pattern** — `SubmitAppForm` accepts an optional `trigger?: React.ReactNode`. If provided, wraps it in `<DialogTrigger asChild>`. If not, renders the default pill button. All dialog logic stays in one component; any element in the app can open it.

**Flat tag display on AppCard** — All tags rendered in a single `flex-wrap` row regardless of dimension. Active filter tags highlight as `bg-[#0A0A0A] text-white`; inactive as `bg-gray-100 text-gray-800`. `activeTagSet` built as a `Set` across all active filter arrays for O(1) lookup.

**shadcn components replaced in filter UI** — `Checkbox`, `Separator`, `ScrollArea`, and `Button` from shadcn removed from `FilterGroup.tsx` and `FilterSidebar.tsx`. Replaced with pure Tailwind. Keeps the filter UI dependency-free.

---

## Key File Map

```
src/types/index.ts                          ← SINGLE SOURCE OF TRUTH for all tags and types
src/lib/queries/applications.ts            ← Main DB query (filters by status='approved')
src/lib/supabase/server.ts                 ← Server component Supabase client
src/lib/supabase/service.ts                ← Service role client (INSERT, bypasses RLS)
src/lib/supabase/client.ts                 ← Browser Supabase client
src/lib/scraper.ts                         ← jina.ai URL scraper
src/lib/ai/schema.ts                       ← Zod schema for LLM output
src/lib/ai/prompt.ts                       ← System prompt with taxonomy rules
src/lib/utils.ts                           ← cn(), parseSearchParams(), buildFilterUrl(), toggleTag()
src/app/globals.css                        ← Tailwind + shadcn CSS vars + .custom-scrollbar utility
src/app/layout.tsx                         ← Root layout: Inter font, Navbar, bg-[#FAFAFA] body
src/app/directory/page.tsx                 ← Server: reads searchParams, fetches, renders
src/app/api/analyze/route.ts               ← POST: scrape → classify → insert as pending
src/components/Navbar.tsx                  ← Client: sticky nav with logo, links, Submit App trigger
src/components/directory/FilterSidebar.tsx ← Client: URL push on checkbox change, sticky positioning
src/components/directory/FilterGroup.tsx   ← Client: pure Tailwind checkbox list per dimension
src/components/directory/AppCard.tsx       ← Client: card with Google favicon + letter fallback, flat tags
src/components/directory/AppGrid.tsx       ← Server: responsive card grid + SubmitAppForm dashed card
src/components/directory/SubmitAppForm.tsx ← Client: dialog with optional trigger prop
supabase/schema.sql                        ← Full DDL
supabase/seed.sql                          ← Seed apps (Polymarket, Sharpe.ai, Billy Bets + more)
supabase/migrations/add-status-column.sql  ← Migration: adds status column (already run)
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

## Current Status (as of 2026-03-06)

- Phase 1 (MVP directory): **Complete**
- Scraping & AI tagging pipeline: **Complete and live** — migration run, env vars set, tested and working
- Frontend overhaul: **Complete** — new Navbar, favicon cards, dashed submit card, pure Tailwind filter UI
- Deployment: **Not done** — local only
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
- Navbar "About" and "Newsletter" links are `href="#"` placeholders

---

## Reference Maps (Inspiration)
- [polymark.et](https://polymark.et)
- [Messari Crypto prediction market map](https://x.com/MessariCrypto/status/1970182183718687152)
- [Saul Munn Notion map](https://saul-munn.notion.site/Map-of-the-Prediction-Market-Forecasting-Ecosystem-4ffddd0f10d64fdb92235b374ec5e3f1)
- [Mikey0x_ Twitter map](https://x.com/Mikey0x_/status/1823025965598969876)
