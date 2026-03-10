// Bulk seed script — populates the database by calling the local API for each URL.
// Dev server must be running: npm run dev
// Run with: npx tsx scripts/bulk-seed.ts

const TARGET_URLS = [
'https://www.polymarketdash.com',
'https://www.polyradar.io',
'https://www.polyseer.xyz',
'https://www.polysimplr.com',
'https://www.predictshark.io',
'https://www.prophetnotes.com',
'https://www.sportstensor.com',
'https://www.stand.trade',
'https://www.ultramarkets.xyz',
'https://www.uma.rocks',
'https://www.verso.trading',
'https://www.polyxbot.org',
'https://xo.market',
'https://yaps.kaito.ai',
'https://zapper.xyz',
];

const API_URL = 'http://localhost:3000/api/analyze';
const DELAY_MS = 5000;

async function processUrl(url: string): Promise<boolean> {
  console.log(`\n→ Processing: ${url}`);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const json = await res.json();

    if (res.ok && json.application) {
      const app = json.application;
      console.log(`  ✓ Accepted: "${app.name}" inserted as ${app.status}`);
      console.log(`    Tags: content=${app.content_tags}, execution=${app.execution_tags}`);
      return true;
    } else if (res.ok && !json.application) {
      // Order-Routing Test rejection — valid 200 but not a trading app
      console.log(`  ↷ Skipped: ${json.reason ?? json.message}`);
      return false;
    } else if (res.status === 409) {
      console.log(`  ↷ Duplicate: ${json.message ?? 'Already exists'}`);
      return false;
    } else {
      console.log(`  ✗ Failed (HTTP ${res.status}): ${json.error ?? json.message}`);
      return false;
    }
  } catch (err) {
    console.log(`  ✗ Network error: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function main() {
  console.log(`Starting bulk seed — ${TARGET_URLS.length} URLs to process`);
  console.log(`API: ${API_URL}`);
  console.log(`Delay between requests: ${DELAY_MS / 1000}s`);

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < TARGET_URLS.length; i++) {
    const url = TARGET_URLS[i];
    const ok = await processUrl(url);
    if (ok) succeeded++; else failed++;

    if (i < TARGET_URLS.length - 1) {
      console.log(`  Waiting ${DELAY_MS / 1000}s before next URL...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`);
  console.log(`Approve pending rows at: Supabase Dashboard → Table Editor → applications`);
}

main();
