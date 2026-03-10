import { AppCard } from './AppCard';
import { SubmitAppForm } from './SubmitAppForm';
import type { Application, FilterState } from '@/types';

interface AppGridProps {
  applications: Application[];
  activeFilters: FilterState;
}

export function AppGrid({ applications, activeFilters }: AppGridProps) {
  if (applications.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold text-gray-900">No applications match your filters.</p>
          <p className="text-sm text-gray-500 mt-1">
            Try removing some filters to see more results.
          </p>
        </div>
        <SubmitAppForm
          trigger={
            <article className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-300 group flex flex-col h-full items-center justify-center text-center cursor-pointer min-h-[300px]">
              <SubmitCardContent />
            </article>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {applications.map((app) => (
        <AppCard
          key={app.id}
          application={app}
          activeFilters={activeFilters}
        />
      ))}
      <SubmitAppForm
        trigger={
          <article className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-300 group flex flex-col h-full items-center justify-center text-center cursor-pointer min-h-[300px]">
            <SubmitCardContent />
          </article>
        }
      />
    </div>
  );
}

function SubmitCardContent() {
  return (
    <>
      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Submit an App</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
        Don&apos;t see your favorite prediction market? Add it to the directory.
      </p>
    </>
  );
}
