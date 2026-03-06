import { useState } from 'react';
import { FilterPanel } from '../Filters/FilterPanel';
import { GapAnalysisPanel } from '../Analysis/GapAnalysisPanel';

type Tab = 'filters' | 'analysis';

export function Sidebar() {
  const [tab, setTab] = useState<Tab>('filters');

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            tab === 'filters'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setTab('filters')}
        >
          Filters
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            tab === 'analysis'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setTab('analysis')}
        >
          Gap Analysis
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'filters' ? <FilterPanel /> : <GapAnalysisPanel />}
      </div>
    </aside>
  );
}
