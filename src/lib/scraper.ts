const JINA_READER_BASE = 'https://r.jina.ai/';
const SCRAPE_TIMEOUT_MS = 15_000;
const MAX_CONTENT_LENGTH = 8_000;

export async function scrapeUrl(url: string): Promise<string> {
  // Validate URL — only http/https allowed (prevents SSRF via other schemes)
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are supported');
  }

  const response = await fetch(`${JINA_READER_BASE}${url}`, {
    signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
    headers: { Accept: 'text/markdown, text/plain' },
  });

  if (!response.ok) {
    throw new Error(`Scraping failed: HTTP ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  if (!text || text.trim().length < 50) {
    throw new Error('Scraped content is too short to analyze — the page may require JavaScript or block scrapers');
  }

  // Truncate to stay within LLM context budget
  return text.slice(0, MAX_CONTENT_LENGTH);
}
