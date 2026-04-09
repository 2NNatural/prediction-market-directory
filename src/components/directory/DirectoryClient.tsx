'use client';

import { useState } from 'react';
import { AppGrid } from './AppGrid';
import { NetworkGraph } from './NetworkGraph';
import { AppDetailModal } from './AppDetailModal';
import type { Application, FilterState } from '@/types';

interface DirectoryClientProps {
  applications: Application[];
  activeFilters: FilterState;
  view: string;
  searchQuery: string;
}

export function DirectoryClient({ applications, activeFilters, view, searchQuery }: DirectoryClientProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  if (view === 'graph') {
    return (
      <>
        <NetworkGraph
          apps={applications}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          onNodeClick={(app) => setSelectedApp(app)}
        />
        {selectedApp && (
          <AppDetailModal
            application={selectedApp}
            open={!!selectedApp}
            onOpenChange={(open) => { if (!open) setSelectedApp(null); }}
          />
        )}
      </>
    );
  }

  return <AppGrid applications={applications} activeFilters={activeFilters} />;
}
