import { CircleMarker, Circle } from 'react-leaflet';
import type { GeoJSONFeatureCollection } from '../../types';
import { getMarkerColor } from '../../utils/naf';

interface Props {
  geojson: GeoJSONFeatureCollection;
  onSelect: (siret: string) => void;
  showCoverage?: boolean;
  radiusKm?: number;
}

export function EstablishmentMarkers({ geojson, onSelect, showCoverage, radiusKm = 1 }: Props) {
  return (
    <>
      {geojson.features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const color = getMarkerColor(feature.properties.naf_code);

        return (
          <div key={feature.properties.siret}>
            {showCoverage && (
              <Circle
                center={[lat, lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />
            )}
            <CircleMarker
              center={[lat, lng]}
              radius={6}
              pathOptions={{
                color: '#fff',
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelect(feature.properties.siret),
              }}
            />
          </div>
        );
      })}
    </>
  );
}
