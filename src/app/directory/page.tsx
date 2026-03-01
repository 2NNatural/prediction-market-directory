import { parseSearchParams } from '@/lib/utils';
import { fetchApplications } from '@/lib/queries/applications';
import { FilterSidebar } from '@/components/directory/FilterSidebar';
import { AppGrid } from '@/components/directory/AppGrid';
import type { FilterState } from '@/types';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const rawParams = searchParams instanceof Promise ? await searchParams : searchParams;
  const filters: FilterState = parseSearchParams(rawParams);
  const applications = await fetchApplications(filters);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-border bg-muted/30">
        <FilterSidebar activeFilters={filters} />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Prediction Market Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
          </p>
        </header>

        <AppGrid applications={applications} activeFilters={filters} />
      </main>
    </div>
  );
}
