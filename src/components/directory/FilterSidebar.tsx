'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FilterGroup } from './FilterGroup';
import { buildFilterUrl, toggleTag } from '@/lib/utils';
import { DIMENSION_CONFIGS } from '@/types';
import type { FilterState, DimensionKey } from '@/types';

interface FilterSidebarProps {
  activeFilters: FilterState;
}

export function FilterSidebar({ activeFilters }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const totalActive = Object.values(activeFilters)
    .reduce((sum, arr) => sum + arr.length, 0);

  function handleToggle(dimension: DimensionKey, tag: string) {
    const updated: FilterState = {
      ...activeFilters,
      [dimension]: toggleTag(activeFilters[dimension] as string[], tag),
    };
    router.push(buildFilterUrl(pathname, updated), { scroll: false });
  }

  function handleClearAll() {
    router.push(pathname, { scroll: false });
  }

  return (
    <div className="w-64 flex-shrink-0 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pb-10">
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
    </div>
  );
}
