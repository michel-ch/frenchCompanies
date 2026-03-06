import { query } from '../config/database';

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula to compute distance between two lat/lng points in kilometers.
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Compute approximate bounding box for a center point and radius in km.
 */
export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Generate a GeoJSON polygon (circle approximation) from center + radius.
 */
export function circlePolygon(lat: number, lng: number, radiusKm: number, segments = 64) {
  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const dLat = (radiusKm / 111.32) * Math.cos(angle);
    const dLng = (radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    coords.push([lng + dLng, lat + dLat]);
  }
  return {
    type: 'Polygon' as const,
    coordinates: [coords],
  };
}

export interface GapAnalysisParams {
  center: { lat: number; lng: number };
  radius_km: number;
  naf_codes: string[];
  naf_level?: 'section' | 'division' | 'group' | 'class' | 'subclass';
}

export async function analyzeGaps(params: GapAnalysisParams) {
  const { center, radius_km, naf_codes } = params;
  const bbox = boundingBox(center.lat, center.lng, radius_km);

  // Get all establishments in the radius for the requested NAF codes
  const nafPlaceholders = naf_codes.map((_, i) => `$${i + 5}`);
  const sql = `
    SELECT siret, siren, denomination, naf_code, latitude, longitude,
           postal_code, city_name
    FROM establishments
    WHERE latitude BETWEEN $1 AND $2
      AND longitude BETWEEN $3 AND $4
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND naf_code IN (${nafPlaceholders.join(', ')})
      AND is_active = true
  `;

  const res = await query(sql, [bbox.minLat, bbox.maxLat, bbox.minLng, bbox.maxLng, ...naf_codes]);

  // Filter by actual distance (bbox is approximate)
  const inRadius = res.rows.filter((r: any) =>
    haversineDistance(center.lat, center.lng, r.latitude, r.longitude) <= radius_km
  );

  // Group by NAF code
  const byCode = new Map<string, any[]>();
  for (const code of naf_codes) {
    byCode.set(code, []);
  }
  for (const row of inRadius) {
    const existing = byCode.get(row.naf_code) || [];
    existing.push(row);
    byCode.set(row.naf_code, existing);
  }

  // Get NAF labels
  const labelRes = await query(
    `SELECT code, label FROM naf_subclasses WHERE code = ANY($1)`,
    [naf_codes]
  );
  const labels = new Map(labelRes.rows.map((r: any) => [r.code, r.label]));

  const found: any[] = [];
  const missing: any[] = [];

  for (const [code, establishments] of byCode) {
    const entry = {
      code,
      label: labels.get(code) || code,
      count: establishments.length,
    };
    if (establishments.length > 0) {
      found.push({ ...entry, establishments: establishments.slice(0, 50) });
    } else {
      missing.push(entry);
    }
  }

  return {
    searched_area: circlePolygon(center.lat, center.lng, radius_km),
    naf_codes_found: found,
    naf_codes_missing: missing,
    total_establishments: inRadius.length,
  };
}

export interface CoverageParams {
  commune_code?: string;
  postal_code?: string;
  naf_code: string;
  radius_km: number;
}

export async function analyzeCoverage(params: CoverageParams) {
  const { naf_code, radius_km } = params;
  const conditions: string[] = ['is_active = true', 'latitude IS NOT NULL', 'longitude IS NOT NULL'];
  const queryParams: any[] = [];
  let paramIdx = 1;

  conditions.push(`naf_code LIKE $${paramIdx++}`);
  queryParams.push(naf_code + '%');

  if (params.commune_code) {
    conditions.push(`commune_code = $${paramIdx++}`);
    queryParams.push(params.commune_code);
  }
  if (params.postal_code) {
    conditions.push(`postal_code = $${paramIdx++}`);
    queryParams.push(params.postal_code);
  }

  const sql = `
    SELECT siret, denomination, naf_code, latitude, longitude,
           postal_code, city_name
    FROM establishments
    WHERE ${conditions.join(' AND ')}
    LIMIT 2000
  `;

  const res = await query(sql, queryParams);

  const features = res.rows.map((r: any) => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [r.longitude, r.latitude],
    },
    properties: {
      siret: r.siret,
      denomination: r.denomination,
      naf_code: r.naf_code,
      coverage_circle: circlePolygon(r.latitude, r.longitude, radius_km, 32),
    },
  }));

  return {
    establishments: { type: 'FeatureCollection' as const, features },
    total: res.rows.length,
    radius_km,
  };
}

export interface DensityParams {
  naf_code: string;
  bbox: string;
  grid_size_km?: number;
}

export async function analyzeDensity(params: DensityParams) {
  const gridSizeKm = params.grid_size_km || 1;
  const parts = params.bbox.split(',').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error('Invalid bbox format');
  }
  const [minLng, minLat, maxLng, maxLat] = parts;

  const gridSizeLat = gridSizeKm / 111.32;
  const centerLat = (minLat + maxLat) / 2;
  const gridSizeLng = gridSizeKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  const sql = `
    SELECT
      FLOOR(latitude / $5) * $5 as grid_lat,
      FLOOR(longitude / $6) * $6 as grid_lng,
      COUNT(*)::int as count
    FROM establishments
    WHERE latitude BETWEEN $1 AND $2
      AND longitude BETWEEN $3 AND $4
      AND naf_code LIKE $7
      AND is_active = true
      AND latitude IS NOT NULL
    GROUP BY grid_lat, grid_lng
  `;

  const res = await query(sql, [minLat, maxLat, minLng, maxLng, gridSizeLat, gridSizeLng, params.naf_code + '%']);

  return {
    grid_size_km: gridSizeKm,
    cells: res.rows.map((r: any) => ({
      lat: r.grid_lat,
      lng: r.grid_lng,
      count: r.count,
    })),
  };
}
