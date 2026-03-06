import { useFilterStore } from '../../hooks/useMapViewport';
import type { DisplayMode } from '../../types';

const modes: { value: DisplayMode; label: string; color: string }[] = [
  { value: 'markers', label: 'Markers', color: 'bg-blue-500' },
  { value: 'coverage', label: 'Coverage', color: 'bg-green-500' },
  { value: 'gaps', label: 'Gaps', color: 'bg-red-500' },
  { value: 'heatmap', label: 'Heatmap', color: 'bg-orange-500' },
];

export function DisplayModeToggle() {
  const displayMode = useFilterStore((s) => s.displayMode);
  const setDisplayMode = useFilterStore((s) => s.setDisplayMode);

  return (
    <div className="grid grid-cols-2 gap-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setDisplayMode(mode.value)}
          className={`px-3 py-2 text-xs rounded-md font-medium transition-colors ${
            displayMode === mode.value
              ? `${mode.color} text-white`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
