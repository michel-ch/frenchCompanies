import { useMutation } from '@tanstack/react-query';
import { analyzeGaps, analyzeCoverage } from '../services/api';

export function useGapAnalysis() {
  return useMutation({
    mutationFn: analyzeGaps,
  });
}

export function useCoverageAnalysis() {
  return useMutation({
    mutationFn: analyzeCoverage,
  });
}
