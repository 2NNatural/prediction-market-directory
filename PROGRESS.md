# PROGRESS.md — Build Changelog

---

## Session 7 — 2026-04-08 — Text Search + Network Graph + Bulk Seed Batch 2

### New Files
| File | What it does |
|------|-------------|
| `src/components/directory/SearchBar.tsx` | Debounced client component (300ms). Reads/writes `q` URL param via `useSearchParams`. Renders a text input with search icon. On change, replaces URL with updated `q` param (removes param when empty). |
| `src/components/directory/NetworkGraph.tsx` | Hub-and-spoke force graph using `react-force-graph-2d` (dynamic import, `ssr: false`). 6 Content tag hubs, app nodes connect to hubs only (not each other) — O(n) edges. Monochrome styling: black app nodes with white text, larger gray dashed-stroke hub circles, gray dashed edges. ResizeObserver tracks container width. Category tabs filter visible subgraph. Network density stat + legend bar at bottom. `mounted` state guard wraps only `<ForceGraph2D>`, not the container div. |
| `src/components/directory/ViewToggle.tsx` | Grid/Graph pill toggle. Reads/writes `view` URL param. Preserves all other params (filters, search) on toggle. |
| `src/components/directory/DirectoryClient.tsx` | Thin client wrapper. Dynamically imports `NetworkGraph` with `ssr: false`. Holds modal state. Renders `AppGrid` (default) or `NetworkGraph` based on `view` param. |
| `scripts/seed-batch-2.ts` | Second bulk seed batch — 62 URLs. Same pattern as `bulk-seed.ts`, calls `/api/analyze` with 5s delay. Results: 16 accepted, 20 skipped (Order-Routing Test), 15 duplicate, 11 failed. |

### Modified Files
| File | What changed |
|------|-------------|
| `src/lib/queries/applications.ts` | Added optional `search` parameter. When provided, applies Supabase `.or()` filter across `name` (ilike) and `description` (ilike). Client-side post-sort by match tier: exact name match → name starts-with → name contains → description-only. |
| `src/app/directory/page.tsx` | Now reads `q` and `view` from searchParams in addition to filter params. Passes `search` to `getApplications()`. Renders `SearchBar`, `ViewToggle`, and `DirectoryClient` (which conditionally shows grid or graph). |

### Implementation Decisions
- **Search first, graph second** — User explicitly requested building search before the graph. First attempt combined both and was rolled back (`a6ab7c6`).
- **Name-priority ranking** — User said "a search for 'Polymarket' currently returns 10+ results related to Polymarket in their description. I want it to return the Polymarket official site as the first result." Solved with 4-tier client-side sort after Supabase filter.
- **Hub-and-spoke topology, not shared-tag edges** — First graph attempt connected apps sharing any tag, producing O(n²) edges and an unreadable cluster ("overly clustered, with virtually every item connecting to every other item"). Redesigned: 6 Content tag hubs as anchor nodes, apps connect only to their Content hubs. Clean, readable, O(n) edges.
- **Monochrome graph styling** — User provided a Variant "Market Connectivity" video as design reference. Simplified to: black app nodes, gray hub circles with dashed stroke, gray dashed edges. No color coding by dimension.
- **Static mockup before production build** — User requested "Preview your solutions and UI before actually implementing." Built a standalone HTML/JS mockup at `graph-preview/index.html` and deployed to Perplexity hosting for approval before touching the codebase.
- **`mounted` guard placement** — Initially wrapped the entire container div in a `mounted` check, which hid the container from ResizeObserver → dimensions stayed 0×0 → blank graph. Fix: mount guard wraps only `<ForceGraph2D>`, container div always renders.

### Bug Fixes
- **Canvas not filling width** — `ForceGraph2D` rendered at 0×0 because `containerRef.current.offsetWidth` was 0 on first render. Fixed by adding initial dimension state from `window.innerWidth` and letting ResizeObserver update.
- **Blank graph after canvas fix** — The `if (!mounted) return null` guard hid the entire component including the container div. ResizeObserver never fired because there was nothing to observe. Fixed by moving the mount guard to wrap only the `<ForceGraph2D>` component, keeping the container div always in the DOM.

### Commits
- `a6ab7c6` — Reverted bad combined search+graph attempt
- `377f9f7` — Text search with name-priority ranking
- `6d10156` — Hub-and-spoke network graph
- `9f05d19` — Fix graph canvas sizing (initial dimensions)
- `3d4e3aa` — Fix blank graph (mount guard moved to wrap only ForceGraph2D)

**TypeScript check:** `npx tsc --noEmit` — no errors after each commit.

---

## Session 6 — 2026-04-07 — App Detail Modal + DeFiLlama Stats

### New Files
| File | What it does |
|------|-------------|
| `src/components/directory/AppDetailModal.tsx` | Controlled shadcn Dialog opened by AppCard. Shows: favicon + name + external link header, full untruncated description, tags grouped by dimension (Content/Instrument/Execution/Interface/Resolution) with section headings, and a stats grid fetched from `/api/stats` on mount with loading skeletons. Gracefully shows "Protocol stats not available on DeFiLlama" when no match found. Props: `application`, `open`, `onOpenChange` — parent controls open state. |
| `src/app/api/stats/route.ts` | GET endpoint taking `?slug=<slug>`. Fetches DeFiLlama `/protocols` for TVL and `/overview/fees` + `/summary/fees/{slug}` for fees/revenue — in parallel. Matches by exact slug → normalized slug → normalized name. Both protocol lists cached 10min in-memory. Returns `{ found, tvl, fees24h, revenue24h, chains }` or `{ found: false }`. |

### Modified Files
| File | What changed |
|------|-------------|
| `src/components/directory/AppCard.tsx` | Card body now clickable with `cursor-pointer`, opens `AppDetailModal` via `useState<boolean>`. Renders `<AppDetailModal>` alongside the `<article>` in a fragment. External link icon already had `onClick={(e) => e.stopPropagation()}` so it navigates directly without triggering the modal. |

### Implementation Decisions
- **Modal overlay, not full page** — User chose modal/dialog when asked. Stays on directory page, no URL navigation. Faster UX, no need for a `/directory/[slug]` route (yet).
- **DeFiLlama free API** — No API key needed, no cost. `/protocols` for TVL, `/overview/fees` for fees list, `/summary/fees/{slug}` for per-protocol revenue detail. All free endpoints.
- **Metric iterations** — Started with TVL + 24h Volume + Monthly Volume (from `/overview/dexs`). User switched to Open Interest (from `/overview/open-interest`). User switched again to final: **TVL, Fees (24h), Revenue (24h)**. Route and modal rewritten each time. Three commits total for this feature.
- **Slug matching** — Uses the app's `slug` field from our DB (not the URL domain) to match against DeFiLlama. Exact match first, then normalized (lowercase, strip hyphens/spaces/dots).
- **10-minute cache** — Both the full protocols list and fees overview list are cached in-memory with a 10-minute TTL. Per-protocol fees detail (`/summary/fees/{slug}`) is fetched fresh each request.
- **Stats section always shows** — Even if DeFiLlama has no data, the section renders with a muted "not available" message rather than hiding entirely.

### Commits
- `3e54b3d` — Initial modal + stats (TVL + volume)
- `3bc5fd7` — Switched to Open Interest
- `e708e73` — Final: switched to TVL + Fees + Revenue

**TypeScript check:** `npx tsc --noEmit` — no errors after each commit.

---

## Session 5 — 2026-03-09 — Bulk Seeding, Order-Routing Test, Mobile Responsive

### New Files
| File | What it does |
|------|-------------|
| `scripts/bulk-seed.ts` | Loops `TARGET_URLS` array, POSTs each to `/api/analyze` with 5s delay. Logs 4 outcomes: ✓ Accepted, ↷ Skipped (Order-Routing Test rejection), ↷ Duplicate, ✗ Failed. Run with `npx tsx scripts/bulk-seed.ts` while dev server is running. |
| `src/components/directory/MobileFilterSheet.tsx` | Mobile-only (`lg:hidden`) shadcn Sheet drawer with full filter UI. Same URL-push logic as FilterSidebar. Closes after each toggle. Shows active filter count badge on trigger button. |
| `src/components/ui/sheet.tsx` | Auto-generated by `npx shadcn@latest add sheet` |

### Modified Files
| File | What changed |
|------|-------------|
| `src/components/Navbar.tsx` | Removed "About" and "Newsletter" `<a>` tags. Right side now only contains Submit App pill button. |
| `src/lib/ai/schema.ts` | Restructured: added `isValidApplication: boolean`, `rejectReason?: string` at top level. Wrapped 5 tag arrays in `dimensions: z.object({...}).optional()`. Dimensions only filled when `isValidApplication` is true. |
| `src/lib/ai/prompt.ts` | Appended THE ORDER-ROUTING TEST clause: AI must set `isValidApplication: false` for news aggregators, analytics dashboards, portfolio trackers, affiliate/redirect-only sites. `rejectReason` must end with `'If you believe this was rejected in error, please contact nneri@usc.edu'`. |
| `src/app/api/analyze/route.ts` | Added URL normalization (strip trailing slashes via `new URL()` reconstruction). Updated 409 duplicate response to `{ message, reason }` format with contact email. Added early return after Order-Routing Test: if `!analysis.isValidApplication`, log reason + return 200 `{ message, reason }` without DB insert. Tag fields now accessed via `analysis.dimensions!.*`. |
| `src/components/directory/SubmitAppForm.tsx` | Added `rejected` phase to `SubmitState` union. After `res.ok`, checks `!json.application` — if missing, sets `rejected` phase with `json.reason`. Shows rejection reason in amber text. Handles 409 duplicate gracefully (shows reason in error state). |
| `src/app/directory/page.tsx` | Added `MobileFilterSheet` import and render below app count, inside `<div>` alongside h1. |

### Implementation Decisions
- URL normalization strips trailing slashes before dedup check — prevents `https://x.com` and `https://x.com/` being treated as different URLs
- Order-Routing Test returns 200 (not 4xx) for rejected-but-valid requests — bulk seed script and frontend both handle this gracefully
- Mobile Sheet closes on each filter toggle — user sees updated results immediately rather than manually closing
- shadcn Sheet used for mobile drawer (pure Tailwind would require building an overlay/animation from scratch)
- `npx tsx` used to run seed script — no tsx install needed, just `npx`

### Bug Fixes
- Bulk seed script crashed on `json.application.name` when API returned 200 + `{ message, reason }` (Order-Routing Test rejection). Fixed by splitting success branch: check `json.application` before reading `.name`.
- `SubmitAppForm` crashed with "Cannot read properties of undefined (reading 'name')" when API returned 200 with no `application` key. Fixed by adding `rejected` phase.

**TypeScript check:** `npx tsc --noEmit` — no errors.

---

## Session 4 — 2026-03-06 — Frontend Overhaul

### New Files
| File | What it does |
|------|-------------|
| `src/components/Navbar.tsx` | Sticky nav: "P" black rounded-lg logo + "PM Directory" text, "About" + "Newsletter" placeholder links (later removed), Submit App pill button |

### Modified Files
| File | What changed |
|------|-------------|
| `src/app/globals.css` | Added `.custom-scrollbar` utility: 4px scrollbar width, transparent track, `#E5E5E5` thumb |
| `src/app/layout.tsx` | Added `<Navbar />` above `{children}`; body className now `bg-[#FAFAFA] min-h-screen flex flex-col` |
| `src/components/directory/SubmitAppForm.tsx` | Added optional `trigger?: React.ReactNode` prop — if provided wraps in `<DialogTrigger asChild>`, otherwise renders default outline button |
| `src/components/directory/FilterGroup.tsx` | Removed shadcn `Checkbox` + `Separator`. Replaced with pure Tailwind custom checkboxes: `w-4 h-4 border rounded` div with SVG checkmark when checked. Group hover states via CSS group class. |
| `src/components/directory/FilterSidebar.tsx` | Removed `ScrollArea` + shadcn `Button`. New wrapper: `w-64 flex-shrink-0 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pb-10`. "FILTERS" label + plain text "Reset" button. |
| `src/components/directory/AppCard.tsx` | Full rewrite: Google favicon API with `useState(false)` imgError → letter fallback. External link icon top-right. Flat tag display — all 5 dimensions combined into one `flex-wrap` row. Active filter tags: `bg-[#0A0A0A] text-white`; inactive: `bg-gray-100 text-gray-800`. |
| `src/components/directory/AppGrid.tsx` | Added `<SubmitAppForm>` with dashed card trigger appended after all app cards. |
| `src/app/directory/page.tsx` | New layout: `flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 flex gap-12`. Added footer. |

**TypeScript check:** `npx tsc --noEmit` — no errors.

**Other:** Billy Bets URL corrected directly in Supabase. Favicon auto-updates since it's derived from `url` field.

---

## Session 3 — 2026-03-06 — Pipeline Activation & Verification

- Ran `supabase/migrations/add-status-column.sql` in Supabase SQL Editor — confirmed successful
- Added `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` to `.env.local`
- Tested Submit App pipeline end-to-end — **confirmed working**

---

## Session 2 — 2026-03-04 — Scraping & AI Tagging Pipeline

| File | What it does |
|------|-------------|
| `supabase/migrations/add-status-column.sql` | Adds `status` column (pending/approved/rejected), migrates existing rows to approved |
| `src/types/index.ts` | Added `APPLICATION_STATUSES`, `ApplicationStatus`, `status` field on `Application` interface |
| `src/lib/queries/applications.ts` | Added `.eq('status', 'approved')` — pending/rejected apps hidden from public directory |
| `src/lib/supabase/service.ts` | Service role client using `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS for INSERT |
| `src/lib/scraper.ts` | `scrapeUrl(url)` — validates URL, fetches via jina.ai reader, 15s timeout, truncates to 8000 chars |
| `src/lib/ai/schema.ts` | Zod schema with tag enums from `types/index.ts` |
| `src/lib/ai/prompt.ts` | System prompt with full taxonomy, Router Rule, Melee Rule, Agentic Check, Mention Market Rule |
| `src/app/api/analyze/route.ts` | POST /api/analyze — validate URL, check duplicate, scrape, classify, check slug collision, insert as pending |
| `src/components/directory/SubmitAppForm.tsx` | Client dialog: idle→loading→success/error states |

**New packages:** `ai` ^6.0.116, `@ai-sdk/anthropic` ^3.0.58, `zod` ^4.3.6

**TypeScript fixes:** `searchParams` type → `Promise<...>` only (Next.js 15). `analysis` type → explicit `ApplicationAnalysis` import.

---

## Session 1 — 2026-03-04 — Initial MVP

- Next.js 15 app with App Router, TypeScript strict, Tailwind CSS 4, shadcn/ui
- Supabase schema: `applications` table, 5 `text[]` tag columns, GIN indexes, CHECK constraints, RLS, `updated_at` trigger
- `src/types/index.ts` — single source of truth for all tags
- Full filter sidebar + card grid with URL-driven state
- 3 seed apps: Polymarket, Sharpe.ai, Billy Bets

---

## Known Issues / Limitations (Open)

| Issue | Severity | Notes |
|-------|----------|-------|
| In-memory rate limiting | Low | Resets on server restart; not shared across Vercel instances |
| No admin portal | Medium | Approval requires manual Supabase Table Editor access |
| `logo_url` not stored | Low | Favicons derived live from URL via Google API; `logo_url` null for all rows |
| jina.ai dependency | Medium | If jina.ai is down, submissions fail with 502; no fallback |
| No email on approval | Low | Users don't know when their submission is approved |
| DeFiLlama coverage gaps | Low | Newer/centralized prediction markets may not be in DeFiLlama's index |
| DeFiLlama cache is in-memory | Low | Resets on cold start like rate limiting; not a problem at current scale |
