# Prediction Market Directory

A live, filterable, poly-functional map of the prediction market application layer — built so every app can carry multiple tags across 5 independent dimensions simultaneously.

**Status:** Phase 1 + scraping pipeline complete. Frontend overhaul complete. Pending Vercel deployment.

---

## What It Does

A directory where every prediction market app is tagged across 5 dimensions (Content, Instrument, Execution, Interface, Resolution). Users can filter by any combination. Apps can — and should — appear in multiple categories at once.

Built for the prediction market research community, DeFi explorers, and anyone trying to understand the current ecosystem.

---

## Quick Start

### Prerequisites
- 64-bit Node.js (`node -p "process.arch"` must print `x64`)
- A Supabase project (free tier)
- An Anthropic API key (for the AI scraping pipeline)

### Setup

1. **Clone and install**
   ```bash
   git clone <repo>
   cd prediction-market-directory
   npm install
   ```

2. **Create `.env.local`**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Run database migrations** (in Supabase SQL Editor, in order):
   - `supabase/schema.sql`
   - `supabase/seed.sql`
   - `supabase/migrations/add-status-column.sql`

4. **Start dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## Docs

| File | Purpose |
|------|---------|
| [CLAUDE.md](CLAUDE.md) | AI context doc — full technical spec, architecture decisions, taxonomy |
| [CONTEXT.md](CONTEXT.md) | Project memory — upload this to start a new Claude session |
| [PROGRESS.md](PROGRESS.md) | Changelog — what was built, session by session |
| [ROADMAP.md](ROADMAP.md) | What's next — single canonical priority list |
