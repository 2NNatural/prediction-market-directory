'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') ?? 'grid';

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (v === 'grid') {
      params.delete('view');
    } else {
      params.set('view', v);
    }
    const qs = params.toString();
    router.push(qs ? `/directory?${qs}` : '/directory');
  }

  return (
    <div className="flex rounded-full border border-gray-200 overflow-hidden">
      <button
        onClick={() => setView('grid')}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          view === 'grid' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => setView('graph')}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          view === 'graph' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        Graph
      </button>
    </div>
  );
}
