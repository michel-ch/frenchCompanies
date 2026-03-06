import { useState, useRef, useEffect } from 'react';
import { searchAddress } from '../../services/api';
import { useMapStore, useFilterStore } from '../../hooks/useMapViewport';

export function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const setView = useMapStore((s) => s.setView);
  const { setPostalCode, setCommuneCode, setCity, setAnalysisCenter } = useFilterStore();
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchAddress(value);
        setResults(res);
        setIsOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
  }

  function handleSelect(result: any) {
    const [lng, lat] = result.geometry.coordinates;
    const props = result.properties;
    setView([lat, lng], 13);
    setPostalCode(props.postcode || '');
    setCommuneCode(props.citycode || '');
    setCity(props.city || '');
    setAnalysisCenter({ lat, lng });
    setQuery(props.label);
    setIsOpen(false);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setView([latitude, longitude], 14);
        setAnalysisCenter({ lat: latitude, lng: longitude });
      },
      (err) => console.error('Geolocation error:', err)
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative" ref={ref}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search city, address, postal code..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0"
                onClick={() => handleSelect(r)}
              >
                {r.properties.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleGeolocate}
        className="w-full px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200"
      >
        Around me
      </button>
    </div>
  );
}
