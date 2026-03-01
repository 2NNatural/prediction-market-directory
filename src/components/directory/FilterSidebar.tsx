'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Filters
        </h2>
        {totalActive > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs h-7"
          >
            Clear all ({totalActive})
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {DIMENSION_CONFIGS.map((dim) => (
            <FilterGroup
              key={dim.key}
              config={dim}
              selected={activeFilters[dim.key] as string[]}
              onToggle={(tag) => handleToggle(dim.key, tag)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
