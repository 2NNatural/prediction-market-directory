import { NextRequest, NextResponse } from 'next/server';

interface OIProtocol {
  slug: string;
  name: string;
  displayName: string;
  total24h: number | null;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
}

let oiCache: { data: OIProtocol[]; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_\s.]/g, '');
}

async function fetchOIProtocols(): Promise<OIProtocol[]> {
  if (oiCache && Date.now() - oiCache.timestamp < CACHE_TTL) {
    return oiCache.data;
  }
  const res = await fetch('https://api.llama.fi/overview/open-interest');
  if (!res.ok) return [];
  const data = await res.json();
  const protocols = data.protocols ?? [];
  oiCache = { data: protocols, timestamp: Date.now() };
  return protocols;
}

function findProtocol(protocols: OIProtocol[], slug: string): OIProtocol | undefined {
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

  // Normalized displayName match
  const byDisplay = protocols.find((p) => normalize(p.displayName ?? '') === normalizedSlug);
  if (byDisplay) return byDisplay;

  return undefined;
}

function formatUsd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  try {
    const protocols = await fetchOIProtocols();
    const match = findProtocol(protocols, slug);

    if (!match || match.total24h === null) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      openInterest: formatUsd(match.total24h),
      change24h: match.change_1d !== null ? formatChange(match.change_1d) : null,
      change7d: match.change_7d !== null ? formatChange(match.change_7d) : null,
      chains: match.chains ?? [],
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
