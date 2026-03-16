import { useFilterStore } from '../../hooks/useMapViewport';

const WORKFORCE_LABELS: Record<string, string> = {
  '00': '0 sal.',
  '01': '1-2 sal.',
  '02': '3-5 sal.',
  '03': '6-9 sal.',
  '11': '10-19 sal.',
  '12': '20-49 sal.',
  '21': '50-99 sal.',
  '22': '100-199 sal.',
  '31': '200-249 sal.',
  '32': '250-499 sal.',
  '41': '500-999 sal.',
  '42': '1k-2k sal.',
  '51': '2k-5k sal.',
  '52': '5k-10k sal.',
  '53': '10k+ sal.',
};

export function ActiveFilters() {
  const {
    nafCodes, nafLabels, removeNafCode, clearNafCodes,
    postalCode, city, setPostalCode, setCity, setCommuneCode,
    isHeadquarter, setIsHeadquarter,
    isEmployer, setIsEmployer,
    workforceBracket, setWorkforceBracket,
    creationDateFrom, setCreationDateFrom,
    creationDateTo, setCreationDateTo,
  } = useFilterStore();

  const hasFilters = nafCodes.length > 0 || postalCode || city
    || isHeadquarter !== undefined || isEmployer !== undefined
    || workforceBracket || creationDateFrom || creationDateTo;
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
            setIsHeadquarter(undefined);
            setIsEmployer(undefined);
            setWorkforceBracket('');
            setCreationDateFrom('');
            setCreationDateTo('');
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
        {isHeadquarter === true && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
            HQ only
            <button onClick={() => setIsHeadquarter(undefined)} className="ml-1 hover:text-amber-900">x</button>
          </span>
        )}
        {isEmployer === true && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
            Employers
            <button onClick={() => setIsEmployer(undefined)} className="ml-1 hover:text-amber-900">x</button>
          </span>
        )}
        {workforceBracket && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
            {WORKFORCE_LABELS[workforceBracket] || workforceBracket}
            <button onClick={() => setWorkforceBracket('')} className="ml-1 hover:text-teal-900">x</button>
          </span>
        )}
        {creationDateFrom && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full">
            From {creationDateFrom}
            <button onClick={() => setCreationDateFrom('')} className="ml-1 hover:text-rose-900">x</button>
          </span>
        )}
        {creationDateTo && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full">
            To {creationDateTo}
            <button onClick={() => setCreationDateTo('')} className="ml-1 hover:text-rose-900">x</button>
          </span>
        )}
      </div>
    </div>
  );
}
