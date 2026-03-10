# ROADMAP.md — What's Next

Single canonical priority list. No competing roadmaps exist in other files.

---

## [NEXT] — Do These Now

### Approve pending rows from bulk seed
The bulk seed script ran 200 URLs through the pipeline. Rows with `status = 'pending'` are sitting in Supabase waiting for review.
1. Supabase Dashboard → Table Editor → `applications`
2. Filter by `status = 'pending'`
3. Approve legitimate apps → change status to `approved`
4. Reject noise → change status to `rejected`

### Admin portal (`/admin`)
Protected route to approve/reject pending submissions without touching Supabase dashboard.
- List of all pending submissions with their AI-generated tags
- Approve / Reject buttons per row
- Needs Supabase Auth (email/password or magic link)
- Form to manually add apps (driven by `DIMENSION_CONFIGS` tag pickers)
- Replaces the current manual Supabase Table Editor workflow

---

## [SOON] — Do These Next

### App detail page (`/directory/[slug]`)
- Server component fetching single app by slug
- Full description, all tags with dimension labels
- External link button
- "Related apps" section (apps sharing ≥1 tag in any dimension)

### Wire up Navbar links
"About" and "Newsletter" links were removed from the Navbar this session. When ready to add them back (or replace with real content), build or link out to actual pages/forms.

---

## [LATER] — After Core Features Are Solid

### Network graph visualization
Replace or complement the card grid with `react-force-graph-2d`.
- Nodes = apps, edges = shared tags within a dimension
- Node color = primary Interface tag
- Node size = number of dimensions with tags (complexity proxy)
- Toggle between "Grid view" and "Graph view"
- Active `FilterState` drives which subgraph is visible

### Store favicon / logo in `logo_url`
Currently favicons are fetched live from Google's API on every card render using the `url` field. `logo_url` is null for all rows.
Option: at submission time, fetch and store the favicon URL so it persists even if the app's domain changes.

---

## [MAYBE] — Evaluate When Relevant

### Email notification on approval
When a submission moves from `pending` to `approved`, notify the submitter.
Requires storing submitter email at submission time.

### Public API
REST endpoint for querying the directory programmatically.
`GET /api/applications?execution=CLOB&content=Sports`

### On-chain data integration for automated tag verification
Use on-chain data (contract calls, event logs) to automatically verify or override AI-generated tags.
E.g., if a protocol's smart contract is a CLOB, auto-tag it as CLOB regardless of what the AI says.

### Rate limiting upgrade
Replace in-memory `Map` with Upstash Redis for persistent, cross-instance rate limiting.
Only needed once deployed and getting real traffic.

---

## Done (archived)

- ~~Add 10-15 real seed apps~~ — Superseded by bulk seed script. 200 URLs processed via `scripts/bulk-seed.ts`.
- ~~Deploy to Vercel~~ — Live deployment confirmed working as of 2026-03-09.
- ~~Mobile responsive filter sidebar~~ — Completed 2026-03-09. shadcn Sheet drawer on mobile.
- ~~Bulk seed script~~ — Completed 2026-03-09. `scripts/bulk-seed.ts`.
- ~~Order-Routing Test guardrail~~ — Completed 2026-03-09. AI rejects non-execution apps pre-insert.
