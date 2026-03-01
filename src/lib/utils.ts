import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FilterState, DimensionKey } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>
): FilterState {
  const parse = (key: string): string[] => {
    const val = raw[key];
    if (!val) return [];
    return Array.isArray(val) ? val : val.split(',').filter(Boolean);
  };

  return {
    content: parse('content') as FilterState['content'],
    instrument: parse('instrument') as FilterState['instrument'],
    execution: parse('execution') as FilterState['execution'],
    interface: parse('interface') as FilterState['interface'],
    resolution: parse('resolution') as FilterState['resolution'],
  };
}

export function buildFilterUrl(base: string, filters: FilterState): string {
  const params = new URLSearchParams();
  (Object.entries(filters) as [DimensionKey, string[]][]).forEach(([key, values]) => {
    if (values.length > 0) {
      params.set(key, values.join(','));
    }
  });
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function toggleTag(current: string[], tag: string): string[] {
  return current.includes(tag)
    ? current.filter(t => t !== tag)
    : [...current, tag];
}
