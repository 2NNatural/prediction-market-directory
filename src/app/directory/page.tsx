import { parseSearchParams } from '@/lib/utils';
import { fetchApplications } from '@/lib/queries/applications';
import { FilterSidebar } from '@/components/directory/FilterSidebar';
import { MobileFilterSheet } from '@/components/directory/MobileFilterSheet';
import { SearchBar } from '@/components/directory/SearchBar';
import { ViewToggle } from '@/components/directory/ViewToggle';
import { DirectoryClient } from '@/components/directory/DirectoryClient';
import type { FilterState } from '@/types';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters: FilterState = parseSearchParams(rawParams);
  const search = typeof rawParams.q === 'string' ? rawParams.q : undefined;
  const view = typeof rawParams.view === 'string' ? rawParams.view : 'grid';
  const applications = await fetchApplications(filters, search);

  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 flex gap-12">
      {/* Desktop sidebar — hidden on mobile */}
      <FilterSidebar activeFilters={filters} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="flex flex-col gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A] mb-2">
                Prediction Market Directory
              </h1>
              <p className="text-gray-500 font-medium">
                {applications.length} application{applications.length !== 1 ? 's' : ''} found
              </p>
              {/* Mobile filter trigger — hidden on desktop */}
              <MobileFilterSheet activeFilters={filters} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar />
            <ViewToggle />
          </div>
        </div>

        <DirectoryClient applications={applications} activeFilters={filters} view={view} />

        <div className="mt-12 text-center pb-8">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Prediction Market Directory. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
