'use client';

import { useState } from 'react';
import { DIMENSION_CONFIGS } from '@/types';
import type { Application, FilterState, DimensionKey } from '@/types';

const DIMENSION_TO_FIELD: Record<DimensionKey, keyof Application> = {
  content: 'content_tags',
  instrument: 'instrument_tags',
  execution: 'execution_tags',
  interface: 'interface_tags',
  resolution: 'resolution_tags',
};

interface AppCardProps {
  application: Application;
  activeFilters: FilterState;
}

export function AppCard({ application, activeFilters }: AppCardProps) {
  const [imgError, setImgError] = useState(false);

  const domain = application.url
    ? (() => { try { return new URL(application.url!).hostname; } catch { return null; } })()
    : null;

  const allTags = DIMENSION_CONFIGS.flatMap((dim) => {
    const field = DIMENSION_TO_FIELD[dim.key];
    return application[field] as string[];
  });

  const activeTagSet = new Set(
    DIMENSION_CONFIGS.flatMap((dim) => activeFilters[dim.key] as string[])
  );

  return (
    <article className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group flex flex-col h-full">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        {/* Logo / favicon */}
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

        {/* External link */}
        {application.url && (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-black transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {/* Name + domain */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
          {application.name}
        </h2>
        {domain && (
          <span className="text-sm text-gray-500 font-medium">{domain}</span>
        )}
      </div>

      {/* Description */}
      {application.description && (
        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {application.description}
        </p>
      )}

      {/* Tags — flat, all dimensions combined */}
      {allTags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isActive = activeTagSet.has(tag);
            return (
              <span
                key={tag}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}
