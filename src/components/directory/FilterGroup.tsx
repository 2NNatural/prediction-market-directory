'use client';

import type { DimensionConfig } from '@/types';

interface FilterGroupProps {
  config: DimensionConfig;
  selected: string[];
  onToggle: (tag: string) => void;
}

export function FilterGroup({ config, selected, onToggle }: FilterGroupProps) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wide">
        {config.label}
      </h4>
      <div className="space-y-2.5">
        {config.tags.map((tag) => {
          const checked = selected.includes(tag);
          return (
            <label
              key={tag}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onToggle(tag)}
            >
              <div
                className={`w-4 h-4 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                  checked
                    ? 'bg-[#0A0A0A] border-[#0A0A0A]'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {checked && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm transition-colors select-none ${
                  checked ? 'text-black font-medium' : 'text-gray-600 group-hover:text-black'
                }`}
              >
                {tag}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
