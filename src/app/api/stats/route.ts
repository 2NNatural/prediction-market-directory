import { NextRequest, NextResponse } from 'next/server';

interface DefiLlamaProtocol {
  slug: string;
  name: string;
  tvl: number;
  chains: string[];
  change_1d?: number;
}

interface ProtocolDetail {
  tvl: number;
  chains: string[];
  currentChainTvls: Record<string, number>;
}

interface DexOverviewProtocol {
  name: string;
  slug: string;
  total24h: number | null;
  total30d: number | null;
  change_1d: number | null;
}

let protocolsCache: { data: DefiLlamaProtocol[]; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_\s.]/g, '');
}

async function fetchProtocolsList(): Promise<DefiLlamaProtocol[]> {
  if (protocolsCache && Date.now() - protocolsCache.timestamp < CACHE_TTL) {
    return protocolsCache.data;
  }
  const res = await fetch('https://api.llama.fi/protocols', { next: { revalidate: 600 } });
  if (!res.ok) return [];
  const data = await res.json();
  protocolsCache = { data, timestamp: Date.now() };
  return data;
}

function findProtocol(protocols: DefiLlamaProtocol[], slug: string): DefiLlamaProtocol | undefined {
  // Exact slug match
  const exact = protocols.find((p) => p.slug === slug);
  if (exact) return exact;

  // Normalized slug match
  const normalizedSlug = normalize(slug);
  const byNormSlug = protocols.find((p) => normalize(p.slug) === normalizedSlug);
  if (byNormSlug) return byNormSlug;

  // Normalized name match
  const byName = protocols.find((p) => normalize(p.name) === normalizedSlug);
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
    const protocols = await fetchProtocolsList();
    const match = findProtocol(protocols, slug);

    if (!match) {
      return NextResponse.json({ found: false });
    }

    // Fetch detailed protocol stats and DEX volume data in parallel
    const [detailRes, dexRes] = await Promise.all([
      fetch(`https://api.llama.fi/protocol/${match.slug}`).catch(() => null),
      fetch(`https://api.llama.fi/summary/dexs/${match.slug}`).catch(() => null),
    ]);

    let tvl = match.tvl ?? 0;
    let chains = match.chains ?? [];

    if (detailRes?.ok) {
      const detail: ProtocolDetail = await detailRes.json();
      tvl = detail.tvl ?? tvl;
      chains = detail.chains ?? chains;
    }

    let volume24h: number | null = null;
    let volumeMonthly: number | null = null;

    if (dexRes?.ok) {
      const dexData = await dexRes.json();
      volume24h = dexData.total24h ?? null;
      volumeMonthly = dexData.total30d ?? null;
    }

    // If no DEX-specific volume, try the overview list
    if (volume24h === null) {
      try {
        const overviewRes = await fetch('https://api.llama.fi/overview/dexs');
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          const dexMatch = (overviewData.protocols as DexOverviewProtocol[] | undefined)?.find(
            (p) => normalize(p.slug ?? '') === normalize(match.slug) || normalize(p.name) === normalize(match.name)
          );
          if (dexMatch) {
            volume24h = dexMatch.total24h ?? null;
            volumeMonthly = dexMatch.total30d ?? null;
          }
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      found: true,
      tvl: formatUsd(tvl),
      volume24h: volume24h !== null ? formatUsd(volume24h) : null,
      volumeMonthly: volumeMonthly !== null ? formatUsd(volumeMonthly) : null,
      chains,
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
