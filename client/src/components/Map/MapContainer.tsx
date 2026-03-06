import { useState, useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap, useMapEvents, Circle, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore, useFilterStore } from '../../hooks/useMapViewport';
import { useEstablishments, useClusters } from '../../hooks/useEstablishments';
import { EstablishmentMarkers } from './EstablishmentMarkers';
import { ClusterLayer } from './ClusterLayer';
import { EstablishmentPopup } from './EstablishmentPopup';
import { getMarkerColor } from '../../utils/naf';
import { useAnalysisStore } from '../../hooks/useAnalysisResults';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapEvents() {
  const setBbox = useMapStore((s) => s.setBbox);
  const setZoom = useMapStore((s) => s.setZoom);
  const setCenter = useMapStore((s) => s.setCenter);
  const setAnalysisCenter = useFilterStore((s) => s.setAnalysisCenter);

  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      setBbox(bbox);
      setZoom(map.getZoom());
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
    },
    click: (e) => {
      setAnalysisCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
    setBbox(bbox);
  }, [map, setBbox]);

  return null;
}

function MapViewSync() {
  const map = useMap();
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const lastCenter = useRef(center);
  const lastZoom = useRef(zoom);

  useEffect(() => {
    if (center[0] !== lastCenter.current[0] || center[1] !== lastCenter.current[1] || zoom !== lastZoom.current) {
      map.setView(center, zoom);
      lastCenter.current = center;
      lastZoom.current = zoom;
    }
  }, [center, zoom, map]);

  return null;
}

export function MapView() {
  const zoom = useMapStore((s) => s.zoom);
  const { data: establishments } = useEstablishments();
  const { data: clusters } = useClusters();
  const { displayMode, radiusKm, analysisCenter } = useFilterStore();
  const { gapResult, coverageResult } = useAnalysisStore();
  const [selectedSiret, setSelectedSiret] = useState<string | null>(null);

  const selectedEstablishment = establishments?.features.find(
    (f) => f.properties.siret === selectedSiret
  );

  return (
    <LeafletMap
      center={[46.603354, 1.888334]}
      zoom={6}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapEvents />
      <MapViewSync />

      {zoom < 10 && clusters && (
        <ClusterLayer clusters={clusters} />
      )}

      {zoom >= 10 && establishments && (
        <EstablishmentMarkers
          geojson={establishments}
          onSelect={setSelectedSiret}
          showCoverage={displayMode === 'coverage'}
          radiusKm={radiusKm}
        />
      )}

      {analysisCenter && (
        <Circle
          center={[analysisCenter.lat, analysisCenter.lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.05,
            weight: 2,
            dashArray: '5 5',
          }}
        />
      )}

      {gapResult?.searched_area && (
        <GeoJSON
          key={JSON.stringify(gapResult.searched_area)}
          data={gapResult.searched_area}
          style={{
            color: '#ef4444',
            fillColor: '#fecaca',
            fillOpacity: 0.1,
            weight: 2,
          }}
        />
      )}

      {coverageResult?.establishments.features.map((f: any) => (
        <Circle
          key={f.properties.siret}
          center={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
          radius={coverageResult.radius_km * 1000}
          pathOptions={{
            color: getMarkerColor(f.properties.naf_code),
            fillColor: getMarkerColor(f.properties.naf_code),
            fillOpacity: 0.15,
            weight: 1,
          }}
        />
      ))}

      {selectedEstablishment && (
        <EstablishmentPopup
          feature={selectedEstablishment}
          onClose={() => setSelectedSiret(null)}
        />
      )}
    </LeafletMap>
  );
}
