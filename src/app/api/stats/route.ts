import { NextRequest, NextResponse } from 'next/server';

interface DefiLlamaProtocol {
  slug: string;
  name: string;
  tvl: number;
  chains: string[];
}

interface FeesProtocol {
  slug: string;
  name: string;
  displayName: string;
  total24h: number | null;
  total30d: number | null;
  revenue24h?: number | null;
  revenue30d?: number | null;
  chains: string[];
}

let protocolsCache: { data: DefiLlamaProtocol[]; timestamp: number } | null = null;
let feesCache: { data: FeesProtocol[]; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_\s.]/g, '');
}

async function fetchProtocolsList(): Promise<DefiLlamaProtocol[]> {
  if (protocolsCache && Date.now() - protocolsCache.timestamp < CACHE_TTL) {
    return protocolsCache.data;
  }
  const res = await fetch('https://api.llama.fi/protocols');
  if (!res.ok) return [];
  const data = await res.json();
  protocolsCache = { data, timestamp: Date.now() };
  return data;
}

async function fetchFeesOverview(): Promise<FeesProtocol[]> {
  if (feesCache && Date.now() - feesCache.timestamp < CACHE_TTL) {
    return feesCache.data;
  }
  const res = await fetch('https://api.llama.fi/overview/fees');
  if (!res.ok) return [];
  const data = await res.json();
  const protocols = data.protocols ?? [];
  feesCache = { data: protocols, timestamp: Date.now() };
  return protocols;
}

function findBySlug<T extends { slug: string; name: string }>(list: T[], slug: string): T | undefined {
  const exact = list.find((p) => p.slug === slug);
  if (exact) return exact;

  const normalizedSlug = normalize(slug);
  const byNormSlug = list.find((p) => normalize(p.slug) === normalizedSlug);
  if (byNormSlug) return byNormSlug;

  const byName = list.find((p) => normalize(p.name) === normalizedSlug);
  if (byName) return byName;

  return undefined;
}

function formatUsd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  try {
    // Fetch TVL protocols and fees data in parallel
    const [protocols, feesProtocols] = await Promise.all([
      fetchProtocolsList(),
      fetchFeesOverview(),
    ]);

    const tvlMatch = findBySlug(protocols, slug);
    const feesMatch = findBySlug(feesProtocols, slug);

    if (!tvlMatch && !feesMatch) {
      return NextResponse.json({ found: false });
    }

    // Get detailed fees/revenue from the per-protocol endpoint
    let fees24h: number | null = feesMatch?.total24h ?? null;
    let revenue24h: number | null = null;

    if (tvlMatch || feesMatch) {
      const feesSlug = feesMatch?.slug ?? tvlMatch?.slug;
      try {
        const detailRes = await fetch(`https://api.llama.fi/summary/fees/${feesSlug}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          fees24h = detail.total24h ?? fees24h;
          revenue24h = detail.revenue24h ?? null;
        }
      } catch {
        // use overview data as fallback
      }
    }

    return NextResponse.json({
      found: true,
      tvl: tvlMatch ? formatUsd(tvlMatch.tvl) : null,
      fees24h: fees24h !== null ? formatUsd(fees24h) : null,
      revenue24h: revenue24h !== null ? formatUsd(revenue24h) : null,
      chains: tvlMatch?.chains ?? feesMatch?.chains ?? [],
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
