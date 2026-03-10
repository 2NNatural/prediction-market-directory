'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FilterGroup } from './FilterGroup';
import { buildFilterUrl, toggleTag } from '@/lib/utils';
import { DIMENSION_CONFIGS } from '@/types';
import type { FilterState, DimensionKey } from '@/types';

interface MobileFilterSheetProps {
  activeFilters: FilterState;
}

export function MobileFilterSheet({ activeFilters }: MobileFilterSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const totalActive = Object.values(activeFilters)
    .reduce((sum, arr) => sum + arr.length, 0);

  function handleToggle(dimension: DimensionKey, tag: string) {
    const updated: FilterState = {
      ...activeFilters,
      [dimension]: toggleTag(activeFilters[dimension] as string[], tag),
    };
    router.push(buildFilterUrl(pathname, updated), { scroll: false });
    setOpen(false);
  }

  function handleClearAll() {
    router.push(pathname, { scroll: false });
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 hover:text-black transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {totalActive > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold">
              {totalActive}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Filters</h3>
          {totalActive > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-8">
          {DIMENSION_CONFIGS.map((dim) => (
            <FilterGroup
              key={dim.key}
              config={dim}
              selected={activeFilters[dim.key] as string[]}
              onToggle={(tag) => handleToggle(dim.key, tag)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
