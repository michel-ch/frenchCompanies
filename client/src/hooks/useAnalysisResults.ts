import { create } from 'zustand';
import type { GapAnalysisResult, CoverageResult } from '../types';

interface AnalysisState {
  gapResult: GapAnalysisResult | null;
  coverageResult: CoverageResult | null;
  setGapResult: (result: GapAnalysisResult | null) => void;
  setCoverageResult: (result: CoverageResult | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  gapResult: null,
  coverageResult: null,
  setGapResult: (result) => set({ gapResult: result }),
  setCoverageResult: (result) => set({ coverageResult: result }),
}));
