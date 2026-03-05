# ROADMAP.md — What's Next

Single canonical priority list. No competing roadmaps exist in other files.

---

## [NEXT] — Do These Now

### Activate the scraping pipeline
The code is built but needs the database migration and env vars to work.
1. Run `supabase/migrations/add-status-column.sql` in Supabase SQL Editor
2. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Test: submit a URL, confirm pending row appears in Supabase, approve it, confirm it appears in directory

### Add 10-15 real seed apps
The directory currently has 3 apps. It needs critical mass to be useful.
Apps to add: Augur, Manifold, Metaculus, Kalshi, Hedgehog Markets, Gnosis, Zeitgeist, dYdX Prediction, Limitless, Drift Protocol, Azuro, Overtime Markets, Polymarket (already seeded)
Edit `supabase/seed.sql` or insert directly via Supabase Table Editor.

### Deploy to Vercel
1. Push repo to GitHub
2. Connect to Vercel (vercel.com → Import Project)
3. Add env vars in Vercel dashboard (all 4 from `.env.local`)
4. Deploy — get a live URL

---

## [SOON] — Do These Next

### Admin portal (`/admin`)
Protected route where you can approve/reject pending submissions without touching Supabase dashboard.
- List of all pending submissions with their AI-generated tags
- Approve / Reject buttons per row
- Needs Supabase Auth (email/password or magic link for simplicity)
- Form to manually add apps (driven by `DIMENSION_CONFIGS` tag pickers)
- This replaces the current manual Supabase Table Editor workflow

### App detail page (`/directory/[slug]`)
- Server component fetching single app by slug
- Full description, all tags with dimension labels
- External link button
- "Related apps" section (apps sharing ≥1 tag in any dimension)

---

## [LATER] — After Core Features Are Solid

### Network graph visualization
Replace or complement the card grid with `react-force-graph-2d`.
- Nodes = apps, edges = shared tags within a dimension
- Node color = primary Interface tag
- Node size = number of dimensions with tags (complexity proxy)
- Toggle between "Grid view" and "Graph view"
- Active `FilterState` drives which subgraph is visible

### Logo / favicon fetching
Auto-fetch favicons for submitted apps to populate `logo_url`.
Could use `https://www.google.com/s2/favicons?domain=example.com` as a quick solution.

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
Longer-term research task.

### Rate limiting upgrade
Replace in-memory `Map` with Upstash Redis for persistent, cross-instance rate limiting.
Only needed once deployed and getting real traffic.
