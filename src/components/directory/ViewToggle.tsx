'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') ?? 'grid';

  function setView(next: 'grid' | 'graph') {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'grid') {
      params.delete('view');
    } else {
      params.set('view', next);
    }
    const qs = params.toString();
    router.push(qs ? `/directory?${qs}` : '/directory', { scroll: false });
  }

  return (
    <div className="inline-flex rounded-full border border-gray-200 bg-gray-100 p-0.5">
      <button
        onClick={() => setView('grid')}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          view === 'grid'
            ? 'bg-[#0A0A0A] text-white'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => setView('graph')}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          view === 'graph'
            ? 'bg-[#0A0A0A] text-white'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        Graph
      </button>
    </div>
  );
}
