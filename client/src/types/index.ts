export interface NafSection {
  code: string;
  label: string;
  divisions?: NafDivision[];
}

export interface NafDivision {
  code: string;
  label: string;
  section_code?: string;
  groups?: NafGroup[];
}

export interface NafGroup {
  code: string;
  label: string;
  division_code?: string;
  classes?: NafClass[];
}

export interface NafClass {
  code: string;
  label: string;
  group_code?: string;
  subclasses?: NafSubclass[];
}

export interface NafSubclass {
  code: string;
  label: string;
  class_code?: string;
}

export interface NafSearchResult {
  code: string;
  label: string;
  class_code: string;
  class_label: string;
  group_code: string;
  group_label: string;
  division_code: string;
  division_label: string;
  section_code: string;
  section_label: string;
}

export interface Establishment {
  siret: string;
  siren: string;
  denomination: string | null;
  naf_code: string | null;
  postal_code: string;
  city_name: string;
  commune_code: string | null;
  address: string;
  is_headquarter: boolean;
  is_employer: boolean;
  workforce_bracket: string | null;
  creation_date: string | null;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: Establishment;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface ClusterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    count: number;
    sample_siret: string;
    sample_denomination: string | null;
  };
}

export interface GapAnalysisResult {
  searched_area: any;
  naf_codes_found: Array<{
    code: string;
    label: string;
    count: number;
    establishments?: any[];
  }>;
  naf_codes_missing: Array<{
    code: string;
    label: string;
    count: number;
  }>;
  total_establishments: number;
}

export interface CoverageResult {
  establishments: GeoJSONFeatureCollection;
  total: number;
  radius_km: number;
}

export interface DensityCell {
  lat: number;
  lng: number;
  count: number;
}

export interface DensityResult {
  grid_size_km: number;
  cells: DensityCell[];
}

export type DisplayMode = 'markers' | 'coverage' | 'gaps' | 'heatmap';

export interface AppFilters {
  nafCodes: string[];
  postalCode: string;
  communeCode: string;
  city: string;
  isActive: boolean;
  isEmployer: boolean | undefined;
  bbox: string;
  radiusKm: number;
  displayMode: DisplayMode;
  centerLat: number | null;
  centerLng: number | null;
}
