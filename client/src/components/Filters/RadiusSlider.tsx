import { useFilterStore } from '../../hooks/useMapViewport';

export function RadiusSlider() {
  const radiusKm = useFilterStore((s) => s.radiusKm);
  const setRadiusKm = useFilterStore((s) => s.setRadiusKm);

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Radius</span>
        <span className="font-medium">{radiusKm} km</span>
      </div>
      <input
        type="range"
        min="0.5"
        max="50"
        step="0.5"
        value={radiusKm}
        onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0.5 km</span>
        <span>50 km</span>
      </div>
    </div>
  );
}
