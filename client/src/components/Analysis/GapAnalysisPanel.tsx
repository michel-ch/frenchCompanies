import { useFilterStore } from '../../hooks/useMapViewport';
import { useGapAnalysis, useCoverageAnalysis } from '../../hooks/useGapAnalysis';
import { useAnalysisStore } from '../../hooks/useAnalysisResults';

export function GapAnalysisPanel() {
  const { nafCodes, radiusKm, analysisCenter, postalCode, communeCode } = useFilterStore();
  const { setGapResult, setCoverageResult } = useAnalysisStore();
  const gapMutation = useGapAnalysis();
  const coverageMutation = useCoverageAnalysis();

  const canAnalyzeGaps = nafCodes.length > 0 && analysisCenter;
  const canAnalyzeCoverage = nafCodes.length === 1 && (postalCode || communeCode);

  function handleGapAnalysis() {
    if (!canAnalyzeGaps || !analysisCenter) return;
    gapMutation.mutate(
      { center: analysisCenter, radius_km: radiusKm, naf_codes: nafCodes },
      { onSuccess: (data) => setGapResult(data) }
    );
  }

  function handleCoverageAnalysis() {
    if (!canAnalyzeCoverage) return;
    coverageMutation.mutate(
      {
        naf_code: nafCodes[0],
        radius_km: radiusKm,
        postal_code: postalCode || undefined,
        commune_code: communeCode || undefined,
      },
      { onSuccess: (data) => setCoverageResult(data) }
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium">Selected codes:</span>{' '}
          {nafCodes.length > 0 ? nafCodes.join(', ') : <span className="text-gray-400">None</span>}
        </p>
        <p>
          <span className="font-medium">Center:</span>{' '}
          {analysisCenter
            ? `${analysisCenter.lat.toFixed(4)}, ${analysisCenter.lng.toFixed(4)}`
            : <span className="text-gray-400">Click map or search location</span>}
        </p>
        <p>
          <span className="font-medium">Radius:</span> {radiusKm} km
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleGapAnalysis}
          disabled={!canAnalyzeGaps || gapMutation.isPending}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {gapMutation.isPending ? 'Analyzing...' : 'Analyze Gaps'}
        </button>
        <button
          onClick={handleCoverageAnalysis}
          disabled={!canAnalyzeCoverage || coverageMutation.isPending}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {coverageMutation.isPending ? 'Analyzing...' : 'Analyze Coverage'}
        </button>
      </div>

      {gapMutation.data && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-800">Gap Analysis Results</h4>
          <p className="text-sm text-gray-600">
            Total found: {gapMutation.data.total_establishments}
          </p>

          {gapMutation.data.naf_codes_found.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-green-700 uppercase mb-1">Present</h5>
              {gapMutation.data.naf_codes_found.map((item) => (
                <div key={item.code} className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{item.code} — {item.label}</span>
                  <span className="text-sm font-bold text-green-600">{item.count}</span>
                </div>
              ))}
            </div>
          )}

          {gapMutation.data.naf_codes_missing.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-red-700 uppercase mb-1">Missing</h5>
              {gapMutation.data.naf_codes_missing.map((item) => (
                <div key={item.code} className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{item.code} — {item.label}</span>
                  <span className="text-sm font-bold text-red-600">0</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {coverageMutation.data && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-800">Coverage Results</h4>
          <p className="text-sm text-gray-600">
            {coverageMutation.data.total} establishments with {coverageMutation.data.radius_km}km coverage
          </p>
        </div>
      )}

      {!gapMutation.data && !coverageMutation.data && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700 space-y-1">
          <p className="font-medium">How to use:</p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Select NAF codes in the Filters tab</li>
            <li>Click the map or search a location to set center</li>
            <li>Adjust the radius</li>
            <li>Click "Analyze Gaps" to find missing businesses</li>
          </ol>
        </div>
      )}
    </div>
  );
}
