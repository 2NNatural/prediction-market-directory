# ROADMAP.md — What's Next

Single canonical priority list. No competing roadmaps exist in other files.

---

## [NEXT] — Do These Now

### Add 10-15 real seed apps
The directory has a small number of apps. It needs critical mass to be useful.
Apps to add: Augur, Manifold, Metaculus, Kalshi, Hedgehog Markets, Gnosis, Zeitgeist, dYdX Prediction, Limitless, Drift Protocol, Azuro, Overtime Markets.
Edit `supabase/seed.sql` or insert directly via Supabase Table Editor.

### Deploy to Vercel
1. Push repo to GitHub
2. Connect to Vercel (vercel.com → Import Project)
3. Add all 4 env vars in Vercel dashboard (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`)
4. Deploy — get a live URL

---

## [SOON] — Do These Next

### Admin portal (`/admin`)
Protected route to approve/reject pending submissions without touching Supabase dashboard.
- List of all pending submissions with their AI-generated tags
- Approve / Reject buttons per row
- Needs Supabase Auth (email/password or magic link)
- Form to manually add apps (driven by `DIMENSION_CONFIGS` tag pickers)
- Replaces the current manual Supabase Table Editor workflow

### App detail page (`/directory/[slug]`)
- Server component fetching single app by slug
- Full description, all tags with dimension labels
- External link button
- "Related apps" section (apps sharing ≥1 tag in any dimension)

### Wire up Navbar links
"About" and "Newsletter" are currently `href="#"` placeholders. Build or link out to actual pages/forms.

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
Longer-term research task.

### Rate limiting upgrade
Replace in-memory `Map` with Upstash Redis for persistent, cross-instance rate limiting.
Only needed once deployed and getting real traffic.
