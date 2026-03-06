import { useState, useRef, useEffect } from 'react';
import { useNafSearch } from '../../hooks/useNafSearch';
import { useFilterStore } from '../../hooks/useMapViewport';

export function NafSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: results, isLoading } = useNafSearch(query);
  const addNafCode = useFilterStore((s) => s.addNafCode);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search: boulangerie, restaurant..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Searching...</div>
          ) : results && results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.code}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                onClick={() => {
                  addNafCode(r.code, r.label);
                  setQuery('');
                  setIsOpen(false);
                }}
              >
                <div className="text-sm font-medium text-gray-900">
                  <span className="text-blue-600">{r.code}</span> — {r.label}
                </div>
                <div className="text-xs text-gray-500">
                  {r.section_code} &gt; {r.division_code} &gt; {r.group_code}
                </div>
              </button>
            ))
          ) : (
            <div className="p-3 text-sm text-gray-500">No results found</div>
          )}
        </div>
      )}

      {/* Quick presets */}
      <div className="mt-2 flex flex-wrap gap-1">
        {[
          { code: '56.10A', label: 'Restaurants' },
          { code: '10.71C', label: 'Boulangeries' },
          { code: '47', label: 'Retail' },
          { code: '86', label: 'Healthcare' },
        ].map((preset) => (
          <button
            key={preset.code}
            onClick={() => addNafCode(preset.code, preset.label)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 rounded-full"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
