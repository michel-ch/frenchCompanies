import { useState } from 'react';
import { useFilterStore } from '../../hooks/useMapViewport';

const WORKFORCE_BRACKETS: Record<string, string> = {
  '00': '0 salarié',
  '01': '1-2 salariés',
  '02': '3-5 salariés',
  '03': '6-9 salariés',
  '11': '10-19 salariés',
  '12': '20-49 salariés',
  '21': '50-99 salariés',
  '22': '100-199 salariés',
  '31': '200-249 salariés',
  '32': '250-499 salariés',
  '41': '500-999 salariés',
  '42': '1 000-1 999 salariés',
  '51': '2 000-4 999 salariés',
  '52': '5 000-9 999 salariés',
  '53': '10 000+ salariés',
};

export function AdvancedFilters() {
  const [expanded, setExpanded] = useState(false);
  const {
    isHeadquarter, setIsHeadquarter,
    isEmployer, setIsEmployer,
    workforceBracket, setWorkforceBracket,
    creationDateFrom, setCreationDateFrom,
    creationDateTo, setCreationDateTo,
  } = useFilterStore();

  const activeCount = [
    isHeadquarter !== undefined,
    isEmployer !== undefined,
    workforceBracket,
    creationDateFrom,
    creationDateTo,
  ].filter(Boolean).length;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        <span className="flex items-center gap-2">
          Advanced Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-500 rounded-full">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHeadquarter === true}
                onChange={(e) => setIsHeadquarter(e.target.checked ? true : undefined)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Headquarters only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmployer === true}
                onChange={(e) => setIsEmployer(e.target.checked ? true : undefined)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Employers only</span>
            </label>
          </div>

          {/* Workforce bracket */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Workforce Size</label>
            <select
              value={workforceBracket}
              onChange={(e) => setWorkforceBracket(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All sizes</option>
              {Object.entries(WORKFORCE_BRACKETS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          {/* Creation date range */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Creation Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={creationDateFrom}
                onChange={(e) => setCreationDateFrom(e.target.value)}
                placeholder="From"
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="date"
                value={creationDateTo}
                onChange={(e) => setCreationDateTo(e.target.value)}
                placeholder="To"
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
