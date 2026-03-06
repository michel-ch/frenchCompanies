import { Popup } from 'react-leaflet';
import type { GeoJSONFeature } from '../../types';

interface Props {
  feature: GeoJSONFeature;
  onClose: () => void;
}

export function EstablishmentPopup({ feature, onClose }: Props) {
  const { properties: p, geometry } = feature;
  const [lng, lat] = geometry.coordinates;

  return (
    <Popup
      position={[lat, lng]}
      eventHandlers={{ remove: onClose }}
    >
      <div className="min-w-[200px] text-sm">
        <h3 className="font-bold text-gray-900 mb-1">
          {p.denomination || 'Unnamed establishment'}
        </h3>
        <div className="space-y-1 text-gray-600">
          <p><span className="font-medium">SIRET:</span> {p.siret}</p>
          <p><span className="font-medium">NAF:</span> {p.naf_code}</p>
          <p><span className="font-medium">Address:</span> {p.address}</p>
          <p><span className="font-medium">City:</span> {p.city_name} ({p.postal_code})</p>
          {p.is_headquarter && (
            <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              HQ
            </span>
          )}
          {p.is_employer && (
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full ml-1">
              Employer
            </span>
          )}
          {p.creation_date && (
            <p><span className="font-medium">Created:</span> {p.creation_date}</p>
          )}
        </div>
      </div>
    </Popup>
  );
}
