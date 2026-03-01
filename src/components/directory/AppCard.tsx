'use client';

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {application.logo_url && (
            <img
              src={application.logo_url}
              alt={`${application.name} logo`}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold leading-tight">{application.name}</h3>
            {application.url && (
              <a
                href={application.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline"
              >
                {application.url.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {application.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {application.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 pt-0">
        {DIMENSION_CONFIGS.map((dim) => {
          const field = DIMENSION_TO_FIELD[dim.key];
          const tags = application[field] as string[];
          const activeDimTags = activeFilters[dim.key] as string[];

          if (tags.length === 0) return null;

          return (
            <div key={dim.key} className="flex flex-wrap gap-1 w-full">
              {tags.map((tag) => {
                const isActive = activeDimTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          );
        })}
      </CardFooter>
    </Card>
  );
}
