import { CircleMarker, Tooltip } from 'react-leaflet';
import type { GeoJSONFeatureCollection } from '../../types';

interface Props {
  clusters: GeoJSONFeatureCollection;
}

export function ClusterLayer({ clusters }: Props) {
  return (
    <>
      {clusters.features.map((feature, i) => {
        const [lng, lat] = feature.geometry.coordinates;
        const count = (feature.properties as any).count || 0;

        // Size based on count
        const radius = Math.min(Math.max(Math.sqrt(count) * 2, 8), 40);
        const color =
          count < 10 ? '#22c55e' :
          count < 100 ? '#eab308' :
          count < 1000 ? '#f97316' :
          '#ef4444';

        return (
          <CircleMarker
            key={i}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              color: '#fff',
              fillColor: color,
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Tooltip permanent direction="center" className="!bg-transparent !border-0 !shadow-none !text-white !font-bold !text-xs">
              {count >= 1000 ? `${(count / 1000).toFixed(0)}k` : count}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
