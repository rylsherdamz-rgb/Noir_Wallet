export const Colors = {
  black: '#000000',
  darkGrey: '#121212',
  midGrey: '#1E1E1E',
  lightGrey: '#2C2C2C',
  borderGrey: '#3A3A3A',
  white: '#FFFFFF',
  offWhite: '#F5F5F5',
  mutedWhite: '#A9A9A9',

  // --- NOIR brand palette (§2.2) ---
  // Gold is the single hero accent (replaces the old neon green).
  gold: '#C6A15B',
  goldDim: '#A98A43',
  cream: '#EDE4D0',
  silver: '#CECCD0',

  // Semantic status colors — reserved strictly for transaction status.
  success: '#3ED598',
  warning: '#F0B429',
  danger: '#FF5A5F',

  // Surfaces
  surfaceBg: '#0A0A0A',
  cardBg: '#141414',

  // --- Legacy keys kept so nothing breaks. Prefer the NOIR tokens above. ---
  // `accentGreen` used to be the primary accent; it now aliases `gold`.
  accentGreen: '#C6A15B',
  accentGreenDim: '#A98A43',
  accentRed: '#FF5A5F',
  accentRedDim: '#CC2F26',
  accentBlue: '#007AFF',
  accentBlueDim: '#0062CC',
  accentYellow: '#F0B429',
  accentOrange: '#FF9500',
  overlay: 'rgba(0,0,0,0.6)',
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  hero: 64,
}

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
}

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}
