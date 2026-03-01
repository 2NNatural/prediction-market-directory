import { AppCard } from './AppCard';
import type { Application, FilterState } from '@/types';

interface AppGridProps {
  applications: Application[];
  activeFilters: FilterState;
}

export function AppGrid({ applications, activeFilters }: AppGridProps) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">No applications match your filters.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try removing some filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {applications.map((app) => (
        <AppCard
          key={app.id}
          application={app}
          activeFilters={activeFilters}
        />
      ))}
    </div>
  );
}
