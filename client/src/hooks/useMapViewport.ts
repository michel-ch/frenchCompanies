import { create } from 'zustand';
import type { DisplayMode } from '../types';

interface MapState {
  center: [number, number];
  zoom: number;
  bbox: string;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBbox: (bbox: string) => void;
  setView: (center: [number, number], zoom: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [46.603354, 1.888334], // France center
  zoom: 6,
  bbox: '',
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setBbox: (bbox) => set({ bbox }),
  setView: (center, zoom) => set({ center, zoom }),
}));

interface FilterState {
  nafCodes: string[];
  nafLabels: Record<string, string>;
  postalCode: string;
  communeCode: string;
  city: string;
  radiusKm: number;
  displayMode: DisplayMode;
  analysisCenter: { lat: number; lng: number } | null;
  isHeadquarter: boolean | undefined;
  isEmployer: boolean | undefined;
  workforceBracket: string;
  creationDateFrom: string;
  creationDateTo: string;

  setNafCodes: (codes: string[]) => void;
  addNafCode: (code: string, label: string) => void;
  removeNafCode: (code: string) => void;
  clearNafCodes: () => void;
  setPostalCode: (code: string) => void;
  setCommuneCode: (code: string) => void;
  setCity: (city: string) => void;
  setRadiusKm: (km: number) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setAnalysisCenter: (center: { lat: number; lng: number } | null) => void;
  setIsHeadquarter: (val: boolean | undefined) => void;
  setIsEmployer: (val: boolean | undefined) => void;
  setWorkforceBracket: (bracket: string) => void;
  setCreationDateFrom: (date: string) => void;
  setCreationDateTo: (date: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  nafCodes: [],
  nafLabels: {},
  postalCode: '',
  communeCode: '',
  city: '',
  radiusKm: 5,
  displayMode: 'markers',
  analysisCenter: null,
  isHeadquarter: undefined,
  isEmployer: undefined,
  workforceBracket: '',
  creationDateFrom: '',
  creationDateTo: '',

  setNafCodes: (codes) => set({ nafCodes: codes }),
  addNafCode: (code, label) =>
    set((state) => ({
      nafCodes: state.nafCodes.includes(code) ? state.nafCodes : [...state.nafCodes, code],
      nafLabels: { ...state.nafLabels, [code]: label },
    })),
  removeNafCode: (code) =>
    set((state) => ({
      nafCodes: state.nafCodes.filter((c) => c !== code),
    })),
  clearNafCodes: () => set({ nafCodes: [], nafLabels: {} }),
  setPostalCode: (code) => set({ postalCode: code }),
  setCommuneCode: (code) => set({ communeCode: code }),
  setCity: (city) => set({ city }),
  setRadiusKm: (km) => set({ radiusKm: km }),
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setAnalysisCenter: (center) => set({ analysisCenter: center }),
  setIsHeadquarter: (val) => set({ isHeadquarter: val }),
  setIsEmployer: (val) => set({ isEmployer: val }),
  setWorkforceBracket: (bracket) => set({ workforceBracket: bracket }),
  setCreationDateFrom: (date) => set({ creationDateFrom: date }),
  setCreationDateTo: (date) => set({ creationDateTo: date }),
}));
