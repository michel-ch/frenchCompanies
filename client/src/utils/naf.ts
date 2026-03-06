// NAF section color mapping for map markers
const SECTION_COLORS: Record<string, string> = {
  A: '#22c55e', // Agriculture - green
  B: '#92400e', // Mining - brown
  C: '#3b82f6', // Manufacturing - blue
  D: '#eab308', // Energy - yellow
  E: '#06b6d4', // Water - cyan
  F: '#f97316', // Construction - orange
  G: '#a855f7', // Retail - purple
  H: '#6366f1', // Transport - indigo
  I: '#ef4444', // Hospitality - red
  J: '#14b8a6', // Information - teal
  K: '#84cc16', // Finance - lime
  L: '#d946ef', // Real estate - fuchsia
  M: '#0ea5e9', // Scientific - sky
  N: '#f59e0b', // Admin services - amber
  O: '#64748b', // Public admin - slate
  P: '#8b5cf6', // Education - violet
  Q: '#ec4899', // Health - pink
  R: '#10b981', // Arts - emerald
  S: '#78716c', // Other services - stone
  T: '#a3a3a3', // Household - neutral
  U: '#737373', // International - gray
};

export function getNafSectionColor(sectionCode: string): string {
  return SECTION_COLORS[sectionCode] || '#6b7280';
}

export function getNafSectionFromCode(nafCode: string): string {
  // Map division ranges to sections
  const div = parseInt(nafCode.substring(0, 2), 10);
  if (div <= 3) return 'A';
  if (div <= 9) return 'B';
  if (div <= 33) return 'C';
  if (div === 35) return 'D';
  if (div <= 39) return 'E';
  if (div <= 43) return 'F';
  if (div <= 47) return 'G';
  if (div <= 53) return 'H';
  if (div <= 56) return 'I';
  if (div <= 63) return 'J';
  if (div <= 66) return 'K';
  if (div === 68) return 'L';
  if (div <= 75) return 'M';
  if (div <= 82) return 'N';
  if (div === 84) return 'O';
  if (div === 85) return 'P';
  if (div <= 88) return 'Q';
  if (div <= 93) return 'R';
  if (div <= 96) return 'S';
  if (div <= 98) return 'T';
  return 'U';
}

export function getMarkerColor(nafCode: string | null): string {
  if (!nafCode) return '#6b7280';
  const section = getNafSectionFromCode(nafCode);
  return getNafSectionColor(section);
}
