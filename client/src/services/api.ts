import axios from 'axios';
import type {
  NafSection,
  NafSearchResult,
  GeoJSONFeatureCollection,
  GapAnalysisResult,
  CoverageResult,
  DensityResult,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

// NAF endpoints
export async function fetchNafSections(): Promise<NafSection[]> {
  const { data } = await api.get('/naf/sections');
  return data;
}

export async function fetchNafTree() {
  const { data } = await api.get('/naf/tree');
  return data;
}

export async function searchNaf(q: string): Promise<NafSearchResult[]> {
  const { data } = await api.get('/naf/search', { params: { q } });
  return data;
}

// Establishments endpoints
export interface EstablishmentParams {
  naf_code?: string;
  naf_codes?: string;
  postal_code?: string;
  commune_code?: string;
  city?: string;
  is_active?: boolean;
  is_employer?: boolean;
  is_headquarter?: boolean;
  workforce_bracket?: string;
  creation_date_from?: string;
  creation_date_to?: string;
  bbox?: string;
  limit?: number;
  offset?: number;
}

export async function fetchEstablishments(params: EstablishmentParams): Promise<GeoJSONFeatureCollection> {
  const { data } = await api.get('/establishments', { params });
  return data;
}

export async function fetchEstablishmentCount(params: EstablishmentParams): Promise<number> {
  const { data } = await api.get('/establishments/count', { params });
  return data.count;
}

export async function fetchClusters(params: {
  bbox: string;
  zoom: number;
  naf_code?: string;
}): Promise<GeoJSONFeatureCollection> {
  const { data } = await api.get('/establishments/cluster', { params });
  return data;
}

export async function fetchEstablishment(siret: string) {
  const { data } = await api.get(`/establishments/${siret}`);
  return data;
}

// Analysis endpoints
export async function analyzeGaps(body: {
  center: { lat: number; lng: number };
  radius_km: number;
  naf_codes: string[];
}): Promise<GapAnalysisResult> {
  const { data } = await api.post('/analysis/gaps', body);
  return data;
}

export async function analyzeCoverage(body: {
  commune_code?: string;
  postal_code?: string;
  naf_code: string;
  radius_km: number;
}): Promise<CoverageResult> {
  const { data } = await api.post('/analysis/coverage', body);
  return data;
}

export async function fetchDensity(params: {
  naf_code: string;
  bbox: string;
  grid_size_km?: number;
}): Promise<DensityResult> {
  const { data } = await api.get('/analysis/density', { params });
  return data;
}

// French address API (free, no key needed)
export async function searchAddress(q: string) {
  const { data } = await axios.get('https://api-adresse.data.gouv.fr/search/', {
    params: { q, limit: 10 },
  });
  return data.features as Array<{
    properties: {
      label: string;
      city: string;
      postcode: string;
      citycode: string;
    };
    geometry: {
      coordinates: [number, number];
    };
  }>;
}
