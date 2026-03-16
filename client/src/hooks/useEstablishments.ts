import { useQuery } from '@tanstack/react-query';
import { fetchEstablishments, fetchEstablishmentCount, fetchClusters } from '../services/api';
import { useMapStore, useFilterStore } from './useMapViewport';

export function useEstablishments() {
  const bbox = useMapStore((s) => s.bbox);
  const zoom = useMapStore((s) => s.zoom);
  const { nafCodes, postalCode, communeCode, city, isHeadquarter, isEmployer, workforceBracket, creationDateFrom, creationDateTo } = useFilterStore();

  const params = {
    bbox: bbox || undefined,
    naf_codes: nafCodes.length > 0 ? nafCodes.join(',') : undefined,
    postal_code: postalCode || undefined,
    commune_code: communeCode || undefined,
    city: city || undefined,
    is_active: true,
    is_employer: isEmployer,
    is_headquarter: isHeadquarter,
    workforce_bracket: workforceBracket || undefined,
    creation_date_from: creationDateFrom || undefined,
    creation_date_to: creationDateTo || undefined,
    limit: 2000,
  };

  // Only fetch if we have a bbox or filters
  const hasFilters = bbox || nafCodes.length > 0 || postalCode || communeCode || city || isHeadquarter !== undefined || isEmployer !== undefined || workforceBracket || creationDateFrom || creationDateTo;

  return useQuery({
    queryKey: ['establishments', params],
    queryFn: () => fetchEstablishments(params),
    enabled: !!hasFilters && zoom >= 10,
    staleTime: 30000,
    placeholderData: (prev) => prev,
  });
}

export function useEstablishmentCount() {
  const bbox = useMapStore((s) => s.bbox);
  const { nafCodes, postalCode, communeCode, city, isHeadquarter, isEmployer, workforceBracket, creationDateFrom, creationDateTo } = useFilterStore();

  const params = {
    bbox: bbox || undefined,
    naf_codes: nafCodes.length > 0 ? nafCodes.join(',') : undefined,
    postal_code: postalCode || undefined,
    commune_code: communeCode || undefined,
    city: city || undefined,
    is_active: true,
    is_employer: isEmployer,
    is_headquarter: isHeadquarter,
    workforce_bracket: workforceBracket || undefined,
    creation_date_from: creationDateFrom || undefined,
    creation_date_to: creationDateTo || undefined,
  };

  const hasFilters = bbox || nafCodes.length > 0 || postalCode || communeCode || city || isHeadquarter !== undefined || isEmployer !== undefined || workforceBracket || creationDateFrom || creationDateTo;

  return useQuery({
    queryKey: ['establishments-count', params],
    queryFn: () => fetchEstablishmentCount(params),
    enabled: !!hasFilters,
    staleTime: 30000,
  });
}

export function useClusters() {
  const bbox = useMapStore((s) => s.bbox);
  const zoom = useMapStore((s) => s.zoom);
  const { nafCodes } = useFilterStore();

  return useQuery({
    queryKey: ['clusters', bbox, zoom, nafCodes],
    queryFn: () =>
      fetchClusters({
        bbox: bbox,
        zoom: zoom,
        naf_code: nafCodes.length === 1 ? nafCodes[0] : undefined,
      }),
    enabled: !!bbox && zoom < 10,
    staleTime: 30000,
    placeholderData: (prev) => prev,
  });
}
