import { query } from '../config/database';

export interface EstablishmentFilters {
  naf_code?: string;
  naf_codes?: string[];
  postal_code?: string;
  commune_code?: string;
  city?: string;
  is_active?: boolean;
  is_employer?: boolean;
  bbox?: string; // "minLng,minLat,maxLng,maxLat"
  limit?: number;
  offset?: number;
}

function buildWhereClause(filters: EstablishmentFilters): { where: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (filters.is_active !== undefined) {
    conditions.push(`is_active = $${paramIdx++}`);
    params.push(filters.is_active);
  }

  if (filters.naf_code) {
    // Support prefix matching: "47" matches all retail, "47.11" matches all subclasses of 47.11
    conditions.push(`naf_code LIKE $${paramIdx++}`);
    params.push(filters.naf_code + '%');
  }

  if (filters.naf_codes && filters.naf_codes.length > 0) {
    const nafPlaceholders = filters.naf_codes.map(() => `$${paramIdx++}`);
    conditions.push(`naf_code IN (${nafPlaceholders.join(', ')})`);
    params.push(...filters.naf_codes);
  }

  if (filters.postal_code) {
    conditions.push(`postal_code = $${paramIdx++}`);
    params.push(filters.postal_code);
  }

  if (filters.commune_code) {
    conditions.push(`commune_code = $${paramIdx++}`);
    params.push(filters.commune_code);
  }

  if (filters.city) {
    conditions.push(`city_name ILIKE $${paramIdx++}`);
    params.push(`%${filters.city}%`);
  }

  if (filters.is_employer !== undefined) {
    conditions.push(`is_employer = $${paramIdx++}`);
    params.push(filters.is_employer);
  }

  if (filters.bbox) {
    const parts = filters.bbox.split(',').map(Number);
    if (parts.length === 4 && parts.every(p => !isNaN(p))) {
      const [minLng, minLat, maxLng, maxLat] = parts;
      conditions.push(`longitude >= $${paramIdx++}`);
      params.push(minLng);
      conditions.push(`latitude >= $${paramIdx++}`);
      params.push(minLat);
      conditions.push(`longitude <= $${paramIdx++}`);
      params.push(maxLng);
      conditions.push(`latitude <= $${paramIdx++}`);
      params.push(maxLat);
      conditions.push('latitude IS NOT NULL');
      conditions.push('longitude IS NOT NULL');
    }
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  return { where, params };
}

export async function getEstablishments(filters: EstablishmentFilters) {
  const limit = Math.min(filters.limit || 500, 5000);
  const offset = filters.offset || 0;
  const { where, params } = buildWhereClause(filters);

  const paramIdx = params.length + 1;
  const sql = `
    SELECT siret, siren, denomination, naf_code, postal_code, city_name,
           commune_code, street_number, street_type, street_name,
           is_headquarter, is_active, is_employer, workforce_bracket,
           creation_date, latitude, longitude
    FROM establishments
    ${where}
    ORDER BY siret
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;

  const res = await query(sql, [...params, limit, offset]);
  return res.rows;
}

export async function getEstablishmentsGeoJSON(filters: EstablishmentFilters) {
  const rows = await getEstablishments(filters);

  return {
    type: 'FeatureCollection' as const,
    features: rows
      .filter((r: any) => r.latitude != null && r.longitude != null)
      .map((r: any) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [r.longitude, r.latitude],
        },
        properties: {
          siret: r.siret,
          siren: r.siren,
          denomination: r.denomination,
          naf_code: r.naf_code,
          postal_code: r.postal_code,
          city_name: r.city_name,
          commune_code: r.commune_code,
          address: [r.street_number, r.street_type, r.street_name].filter(Boolean).join(' '),
          is_headquarter: r.is_headquarter,
          is_employer: r.is_employer,
          workforce_bracket: r.workforce_bracket,
          creation_date: r.creation_date,
        },
      })),
  };
}

export async function getEstablishmentBySiret(siret: string) {
  const res = await query(
    `SELECT * FROM establishments WHERE siret = $1`,
    [siret]
  );
  return res.rows[0] || null;
}

export async function getEstablishmentCount(filters: EstablishmentFilters) {
  const { where, params } = buildWhereClause(filters);
  const res = await query(`SELECT COUNT(*)::int as count FROM establishments ${where}`, params);
  return res.rows[0].count;
}

export async function getClusteredEstablishments(filters: EstablishmentFilters & { zoom?: number }) {
  const { where, params } = buildWhereClause(filters);
  const zoom = filters.zoom || 10;

  // Grid-based clustering: divide lat/lng into grid cells based on zoom level
  // Higher zoom = smaller cells = more detail
  const gridSize = 180 / Math.pow(2, zoom); // degrees per cell

  const paramIdx = params.length + 1;
  const sql = `
    SELECT
      ROUND(latitude / $${paramIdx}, 0) * $${paramIdx} as cluster_lat,
      ROUND(longitude / $${paramIdx}, 0) * $${paramIdx} as cluster_lng,
      COUNT(*)::int as count,
      MIN(siret) as sample_siret,
      MIN(denomination) as sample_denomination
    FROM establishments
    ${where}
    ${where ? 'AND' : 'WHERE'} latitude IS NOT NULL AND longitude IS NOT NULL
    GROUP BY cluster_lat, cluster_lng
    ORDER BY count DESC
    LIMIT 1000
  `;

  const res = await query(sql, [...params, gridSize]);

  return {
    type: 'FeatureCollection' as const,
    features: res.rows.map((r: any) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [r.cluster_lng, r.cluster_lat],
      },
      properties: {
        count: r.count,
        sample_siret: r.sample_siret,
        sample_denomination: r.sample_denomination,
      },
    })),
  };
}
