'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { DimensionConfig } from '@/types';

interface FilterGroupProps {
  config: DimensionConfig;
  selected: string[];
  onToggle: (tag: string) => void;
}

export function FilterGroup({ config, selected, onToggle }: FilterGroupProps) {
  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-semibold">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>
      <div className="space-y-2">
        {config.tags.map((tag) => {
          const id = `${config.key}-${tag}`;
          const checked = selected.includes(tag);
          return (
            <div key={tag} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => onToggle(tag)}
              />
              <label
                htmlFor={id}
                className="text-sm cursor-pointer select-none leading-none"
              >
                {tag}
              </label>
            </div>
          );
        })}
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
