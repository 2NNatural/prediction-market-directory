# Prediction Market Directory

> "A live and updating map of prediction market application layers."

A filterable, poly-functional directory where every prediction market app carries multiple tags across 5 independent dimensions simultaneously. Built for the prediction market research community, DeFi explorers, and anyone trying to understand the current ecosystem.

**Status:** Live at [prediction-market-directory.vercel.app](https://prediction-market-directory.vercel.app/directory). Text search, network graph, app detail modal, and DeFiLlama stats complete. Admin portal pending.

---

## Quick Start

### Prerequisites
- 64-bit Node.js (`node -p "process.arch"` must print `x64`)
- A Supabase project (free tier)
- An Anthropic API key (for the AI classification pipeline)

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/2NNatural/prediction-market-directory.git
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

### Bulk seed (optional)
With the dev server running in one terminal:
```bash
npx tsx scripts/bulk-seed.ts
```

---

## Docs

| File | Purpose |
|------|---------|
| [CONTEXT.md](CONTEXT.md) | Project memory — upload this to start a new Claude session |
| [PROGRESS.md](PROGRESS.md) | Changelog — what was built, session by session |
| [ROADMAP.md](ROADMAP.md) | What's next — single canonical priority list |
