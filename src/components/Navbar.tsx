'use client';

import { SubmitAppForm } from '@/components/directory/SubmitAppForm';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <span className="font-bold text-lg tracking-tight">PM Directory</span>
        </div>

        <div className="flex items-center gap-6">
          <SubmitAppForm
            trigger={
              <button className="bg-[#0A0A0A] hover:bg-black text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95">
                Submit App
              </button>
            }
          />
        </div>
      </div>
    </nav>
  );
}
