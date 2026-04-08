'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DIMENSION_CONFIGS } from '@/types';
import type { Application, DimensionKey } from '@/types';

const DIMENSION_TO_FIELD: Record<DimensionKey, keyof Application> = {
  content: 'content_tags',
  instrument: 'instrument_tags',
  execution: 'execution_tags',
  interface: 'interface_tags',
  resolution: 'resolution_tags',
};

interface StatsData {
  found: boolean;
  openInterest?: string;
  change24h?: string | null;
  change7d?: string | null;
  chains?: string[];
}

interface AppDetailModalProps {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppDetailModal({ application, open, onOpenChange }: AppDetailModalProps) {
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const domain = application.url
    ? (() => { try { return new URL(application.url!).hostname; } catch { return null; } })()
    : null;

  useEffect(() => {
    if (!open) {
      setStats(null);
      return;
    }

    setStatsLoading(true);
    fetch(`/api/stats?slug=${encodeURIComponent(application.slug)}`)
      .then((res) => res.json())
      .then((data: StatsData) => setStats(data))
      .catch(() => setStats({ found: false }))
      .finally(() => setStatsLoading(false));
  }, [open, application.slug]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {domain && !imgError ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                alt={`${application.name} logo`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-contain bg-gray-50"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg">
                {application.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-bold">{application.name}</DialogTitle>
              {application.url && (
                <a
                  href={application.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {domain} &#8599;
                </a>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Full description */}
        {application.description && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {application.description}
          </p>
        )}

        {/* Tags organized by dimension */}
        <div className="space-y-3">
          {DIMENSION_CONFIGS.map((dim) => {
            const tags = application[DIMENSION_TO_FIELD[dim.key]] as string[];
            if (!tags || tags.length === 0) return null;
            return (
              <div key={dim.key}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {dim.label}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats section */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Protocol Stats
          </h4>
          {statsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats?.found ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Open Interest</p>
                <p className="text-sm font-semibold text-gray-900">{stats.openInterest}</p>
              </div>
              {stats.change24h && (
                <div>
                  <p className="text-xs text-gray-500">24h Change</p>
                  <p className={`text-sm font-semibold ${stats.change24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stats.change24h}</p>
                </div>
              )}
              {stats.change7d && (
                <div>
                  <p className="text-xs text-gray-500">7d Change</p>
                  <p className={`text-sm font-semibold ${stats.change7d.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stats.change7d}</p>
                </div>
              )}
              {stats.chains && stats.chains.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Chain(s)</p>
                  <p className="text-sm font-semibold text-gray-900">{stats.chains.join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Protocol stats not available on DeFiLlama
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
