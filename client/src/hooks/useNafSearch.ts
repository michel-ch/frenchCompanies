import { useQuery } from '@tanstack/react-query';
import { searchNaf, fetchNafSections } from '../services/api';

export function useNafSearch(q: string) {
  return useQuery({
    queryKey: ['naf-search', q],
    queryFn: () => searchNaf(q),
    enabled: q.length >= 2,
    staleTime: 60000,
  });
}

export function useNafSections() {
  return useQuery({
    queryKey: ['naf-sections'],
    queryFn: fetchNafSections,
    staleTime: Infinity,
  });
}
