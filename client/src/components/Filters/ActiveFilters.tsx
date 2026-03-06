import { useFilterStore } from '../../hooks/useMapViewport';

export function ActiveFilters() {
  const { nafCodes, nafLabels, removeNafCode, clearNafCodes, postalCode, city, setPostalCode, setCity, setCommuneCode } = useFilterStore();

  const hasFilters = nafCodes.length > 0 || postalCode || city;
  if (!hasFilters) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase">Active Filters</span>
        <button
          onClick={() => {
            clearNafCodes();
            setPostalCode('');
            setCity('');
            setCommuneCode('');
          }}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {nafCodes.map((code) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            <span className="font-medium">{code}</span>
            <span className="hidden sm:inline truncate max-w-[120px]">
              {nafLabels[code]}
            </span>
            <button
              onClick={() => removeNafCode(code)}
              className="ml-1 text-blue-500 hover:text-blue-800"
            >
              x
            </button>
          </span>
        ))}
        {postalCode && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {postalCode}
            <button onClick={() => setPostalCode('')} className="ml-1 hover:text-green-900">x</button>
          </span>
        )}
        {city && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {city}
            <button onClick={() => { setCity(''); setCommuneCode(''); }} className="ml-1 hover:text-purple-900">x</button>
          </span>
        )}
      </div>
    </div>
  );
}
