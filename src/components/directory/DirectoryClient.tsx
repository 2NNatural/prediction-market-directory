'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AppGrid } from './AppGrid';
import { AppDetailModal } from './AppDetailModal';
import type { Application, FilterState } from '@/types';

const NetworkGraph = dynamic(
  () => import('./NetworkGraph').then((mod) => ({ default: mod.NetworkGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading graph...
      </div>
    ),
  },
);

interface DirectoryClientProps {
  applications: Application[];
  activeFilters: FilterState;
  view: string;
}

export function DirectoryClient({ applications, activeFilters, view }: DirectoryClientProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  if (view === 'graph') {
    return (
      <>
        <NetworkGraph apps={applications} onNodeClick={setSelectedApp} />
        {selectedApp && (
          <AppDetailModal
            application={selectedApp}
            open={!!selectedApp}
            onOpenChange={(open) => {
              if (!open) setSelectedApp(null);
            }}
          />
        )}
      </>
    );
  }

  return <AppGrid applications={applications} activeFilters={activeFilters} />;
}
