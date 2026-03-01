# Prediction Market Ecosystem Directory — AI Context Document

This file is the canonical context document for any AI model (Claude Code or otherwise) working on this project. Read this before touching any code.

---

## Project Vision

Traditional ecosystem maps categorize prediction market apps into rigid, mutually exclusive buckets (e.g., "Betting Exchanges" vs "News Aggregators"). This misrepresents the real landscape, where a single app can be an AI Agent, a Social Interface, and a Sports Market simultaneously.

We are building a **poly-functional directory** where every application is tagged across 5 independent dimensions. The result is a filterable, eventually graph-visualizable map of the prediction market application layer.

---

## The 5-Dimension Taxonomy

Every application in the `applications` table carries zero or more tags from each of these 5 dimensions. The valid tag values are enforced at the DB level via CHECK constraints and at the application level via TypeScript `as const` arrays in `src/types/index.ts`.

### 1. Content — The Subject
What the market is about.
| Tag | Notes |
|---|---|
| Sports | |
| Politics | |
| Pop Culture | |
| Financials | |
| Science/Tech | |
| Governance/DAO | |

### 2. Instrument — The Contract
The financial structure of the bet.
| Tag | Notes |
|---|---|
| Binary Spot | Yes/No, resolves at event |
| Scalar | Numeric outcome range |
| Perpetual | Never expires, funding-rate settled |
| Parlay | Multi-leg combined bet |
| Conditional (Futarchy) | "If X wins, then Y" |

### 3. Execution — The Engine
How prices are determined and orders matched.
| Tag | Notes |
|---|---|
| CLOB | Central Limit Order Book. Maker/taker. |
| AMM | Automated Market Maker / Bonding Curve. **Ex-ante pricing** — price set before trade. |
| Parimutuel | Pool-based. **Ex-post payout** — payout calculated after all bets are in. Note: Melee is a Parimutuel with AMM-style pricing, which is the exception. |

### 4. Interface — The Form Factor
How users interact with the protocol.
| Tag | Notes |
|---|---|
| Pro Terminal | Advanced UI for sophisticated traders |
| Retail Wrapper | Consumer-friendly UI |
| Social Wrapper | Social feed / community layer |
| Agentic | Headless / API-first, used by AI agents |
| Aggregator | Routes to multiple underlying protocols |

**The Router Rule:** Aggregator and interface apps inherit the Execution and Instrument tags of the protocols they route to. E.g., an aggregator that routes to Polymarket (CLOB) should also carry the CLOB tag.

### 5. Resolution — The Trust Layer
How market outcomes are determined.
| Tag | Notes |
|---|---|
| Centralized | Operator decides outcome |
| Optimistic | UMA-style optimistic oracle with dispute window |
| Social | Kleros-style crowd/jury resolution |
| On-Chain | Resolved by on-chain data (price feeds, etc.) |
| AI Oracle | AI model determines the outcome |

---

## Current Status — Phase 1 Complete

Phase 1 (MVP directory) is fully built and working. The app runs locally with `npm run dev`.

**What was built:**
- Next.js 15 app with App Router, Tailwind 4, shadcn/ui
- Supabase PostgreSQL schema with GIN-indexed `text[]` tag columns
- Server-side filtered queries using Supabase `.overlaps()`
- Multi-select sidebar filter with URL-driven state
- Card grid with active tag highlighting
- 3 seed applications: Polymarket, Sharpe.ai, Billy Bets

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| ORM/Client | `@supabase/supabase-js` + `@supabase/ssr` |
| Language | TypeScript 5 (strict) |
| Deployment target | Vercel |
| Future visualization | react-force-graph (Phase 2) |

**Important local environment note:** Next.js 15 requires **64-bit Node.js**. The 32-bit (ia32) Node build cannot run the SWC compiler and will crash silently. Verify with `node -p "process.arch"` — must print `x64`.

---

## Architecture Decisions & Rationale

### 1. `text[]` arrays, not junction tables
The `applications` table stores tags as PostgreSQL array columns (`content_tags text[]`, etc.) rather than a normalized junction table.

**Why:** The tag vocabulary is fixed and domain-stable. Tags don't need their own metadata (descriptions, icons) in Phase 1. The Supabase JS client's `.overlaps()` method maps directly to PostgreSQL `&&` (array overlap), enabling clean OR-within / AND-across queries with zero JOINs. Arrays are GIN-indexed for performance. Junction tables would add complexity (3+ extra tables, JOIN chains on every query) with no benefit at this scale.

**When to reconsider:** If tags ever need per-tag metadata (icons, descriptions, sort order), add a `dimension_tags` lookup table. The `text[]` columns on `applications` don't need to change — the text value is the join key.

### 2. URL search params, not React state
Filter state is stored in URL query parameters (e.g., `/directory?execution=CLOB&content=Sports`), not in React `useState`.

**Why:** Links are shareable and bookmarkable out of the box. The directory page (`app/directory/page.tsx`) is a Next.js **Server Component** that reads `searchParams` and runs the Supabase query server-side — no client-side data fetching, no loading spinners, better SEO. Browser back/forward navigation works correctly for free. The sidebar (`FilterSidebar.tsx`) is a client component that calls `router.push()` on checkbox change; the page re-renders on the server with new data.

### 3. AND-across-dimensions / OR-within via chained `.overlaps()`
Filtering logic: selecting multiple tags in the **same** dimension shows apps matching **any** of those tags (OR). Selecting tags in **different** dimensions shows only apps matching **all** selected dimensions (AND).

**Implementation:** Each `.overlaps('column', arrayOfSelectedTags)` call maps to SQL `column && '{tag1, tag2}'::text[]` (has any element in common). Chaining multiple `.overlaps()` calls in Supabase JS adds AND conditions between them. This gives OR-within / AND-across for free.

```ts
// "Show apps that have (CLOB or AMM) AND (Sports)"
query = query.overlaps('execution_tags', ['CLOB', 'AMM'])
query = query.overlaps('content_tags', ['Sports'])
```

### 4. Server / Client component split
| Component | Type | Reason |
|---|---|---|
| `app/directory/page.tsx` | Server | Awaits searchParams, calls Supabase, no browser APIs |
| `components/directory/AppGrid.tsx` | Server | Pure rendering, receives pre-fetched data as props |
| `components/directory/AppCard.tsx` | Client | Future interactivity (click handlers, hover) |
| `components/directory/FilterSidebar.tsx` | Client | Uses `useRouter`, `usePathname` |
| `components/directory/FilterGroup.tsx` | Client | Checkbox `onCheckedChange` handlers |
| `lib/queries/applications.ts` | Server-only | Imports `next/headers` via server Supabase client |

---

## File Map

```
prediction-market-directory/
├── CLAUDE.md                                   ← This file
├── .env.local                                  ← Supabase credentials (gitignored)
├── supabase/
│   ├── schema.sql                              ← Full DDL: table, indexes, constraints, RLS
│   └── seed.sql                               ← 3 sample apps INSERT
└── src/
    ├── types/
    │   └── index.ts                            ← ALL domain types: tag constants, Application, FilterState, DimensionConfig, DIMENSION_CONFIGS
    ├── lib/
    │   ├── utils.ts                            ← cn(), parseSearchParams(), buildFilterUrl(), toggleTag()
    │   ├── supabase/
    │   │   ├── server.ts                       ← createSupabaseServerClient() — for Server Components
    │   │   └── client.ts                       ← createSupabaseBrowserClient() — for Client Components
    │   └── queries/
    │       └── applications.ts                 ← fetchApplications(filters: FilterState) — the main query
    ├── app/
    │   ├── globals.css                         ← Tailwind + shadcn/ui CSS variables
    │   ├── layout.tsx                          ← Root layout, Inter font, metadata
    │   ├── page.tsx                            ← Root route — redirects to /directory
    │   └── directory/
    │       └── page.tsx                        ← SERVER: parses searchParams → fetches → renders sidebar + grid
    └── components/
        ├── ui/                                 ← shadcn/ui generated components (badge, card, checkbox, scroll-area, separator, button) — do not hand-edit
        └── directory/
            ├── FilterSidebar.tsx               ← CLIENT: renders all 5 FilterGroups, owns URL push logic
            ├── FilterGroup.tsx                 ← CLIENT: checkbox list for a single dimension
            ├── AppGrid.tsx                     ← SERVER: responsive grid of AppCards, empty state
            └── AppCard.tsx                     ← CLIENT: card showing app name, URL, description, dimension badges
```

**Single source of truth:** `src/types/index.ts`. Every valid tag value, every dimension config, every TypeScript type lives here. When extending the taxonomy, start here.

---

## Database Schema Summary

```sql
-- Table: applications
-- One row per application in the directory
create table applications (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,       -- URL-safe identifier
  description     text,
  url             text,
  logo_url        text,
  content_tags    text[] not null default '{}',
  instrument_tags text[] not null default '{}',
  execution_tags  text[] not null default '{}',
  interface_tags  text[] not null default '{}',
  resolution_tags text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()   -- auto-updated via trigger
);
-- GIN indexes on all 5 tag columns (enables fast && queries)
-- CHECK constraints enforce valid tag values (see supabase/schema.sql for full list)
-- RLS enabled: public SELECT, no public INSERT/UPDATE/DELETE
-- updated_at trigger: fires on every UPDATE
```

Full DDL is in [supabase/schema.sql](supabase/schema.sql). Run this before [supabase/seed.sql](supabase/seed.sql).

---

## Local Dev Setup

### Prerequisites
- **64-bit Node.js** (verify: `node -p "process.arch"` must print `x64`)
- A Supabase project (free tier is sufficient)

### Steps
1. Clone the repo
2. `npm install`
3. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
   ```
   Get these from: Supabase Dashboard → Settings → API → use the **anon / public** key (not the service_role key)
4. In Supabase SQL Editor, run `supabase/schema.sql` then `supabase/seed.sql`
5. `npm run dev` → open `http://localhost:3000`

### Verification checklist
- `/directory` loads and shows 3 apps
- Selecting "CLOB" (Execution) shows all 3 apps
- Selecting "CLOB" + "Pro Terminal" shows only Sharpe.ai
- Selecting "AMM" shows only Billy Bets
- Copying URL with active filters and opening in new tab shows same results
- "Clear all" removes all filters

---

## Phase 2 Roadmap

These features are NOT yet built. Implement in order:

### 2a. More seed data
Add at least 10–15 real applications to make the directory useful. Edit `supabase/seed.sql` or insert directly via Supabase dashboard. Apps to consider: Augur, Manifold, Metaculus, Kalshi, dYdX Prediction, Gnosis, Zeitgeist, Hedgehog Markets.

### 2b. App detail page
Route: `/directory/[slug]`
- Server component fetching single app by slug
- Full description, all tags displayed with dimension labels
- External link button
- "Related apps" section (apps sharing tags in the same dimension)

### 2c. Network graph visualization
Replace or complement the card grid with a force-directed graph using `react-force-graph-2d`.
- Each application = a node
- Shared tags within a dimension = edges between nodes
- Node color = primary Interface tag
- Node size = number of dimensions with tags (complexity proxy)
- The existing `FilterState` drives which subgraph is visible
- Toggle between "Grid view" and "Graph view"

### 2d. Admin CRUD UI
Route: `/admin` (protected — add Supabase Auth)
- Form to add new applications with multi-select tag pickers per dimension
- Edit existing applications
- The tag pickers should be driven by `DIMENSION_CONFIGS` from `src/types/index.ts`

### 2e. Vercel deployment
- Push to GitHub
- Connect repo to Vercel
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Vercel environment variables
- Deploy

---

## Conventions

### Adding a new application
Insert a row into the `applications` table in Supabase. The tag values must exactly match the strings defined in `src/types/index.ts` and enforced by the CHECK constraints in the DB. Easiest via `supabase/seed.sql` or the Supabase Table Editor.

### Extending the taxonomy (adding a new tag)
1. Add the new tag string to the relevant `*_TAGS` array in `src/types/index.ts`
2. Update the corresponding `chk_*_tags` CHECK constraint in Supabase (alter table or drop/recreate)
3. The sidebar and AppCard will automatically render the new tag — no other changes needed

### Adding a new dimension
This is a breaking schema change. You would need to:
1. Add a new `*_tags text[]` column to the `applications` table in Supabase
2. Add the new constant array, type, and `DimensionConfig` entry in `src/types/index.ts`
3. Add the new field to the `Application` interface in `src/types/index.ts`
4. Add a new `.overlaps()` call in `src/lib/queries/applications.ts`
5. Update `DIMENSION_TO_FIELD` in `src/components/directory/AppCard.tsx`
