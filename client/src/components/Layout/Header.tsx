import { useEstablishmentCount } from '../../hooks/useEstablishments';

export function Header() {
  const { data: count, isLoading } = useEstablishmentCount();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between h-12 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-800">
          French Business Map Explorer
        </h1>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {isLoading ? (
          <span>Loading...</span>
        ) : count !== undefined ? (
          <span className="font-medium">{count.toLocaleString()} establishments</span>
        ) : (
          <span>Zoom in or apply filters to see data</span>
        )}
      </div>
    </header>
  );
}
