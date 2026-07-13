// Theme mirrored from the Noir Wallet app: frontend/src/constants/theme.ts
// Keep these in sync with the app so the promo matches the real UI exactly.

export const Colors = {
  // Core surfaces (warm dark, anchored to gold hue)
  black: "#000000",
  darkGrey: "#121212",
  surfaceBg: "#0A0A0A",
  cardBg: "#141414",
  midGrey: "#1E1E1E",
  lightGrey: "#2C2C2C",
  borderGrey: "#3A3A3A",

  // Text (warm-tinted neutrals)
  white: "#FFFFFF",
  offWhite: "#F5F5F5",
  mutedWhite: "#A9A9A9",

  // Brand accent - gold
  gold: "#C6A15B",
  goldDim: "#A98A43",
  cream: "#EDE4D0",
  silver: "#CECCD0",

  // Semantic
  success: "#3ED598",
  warning: "#F0B429",
  danger: "#FF5A5F",
} as const;

// The app uses the platform default sans-serif (San Francisco / Roboto).
// system-ui is the closest deterministic match for the web renderer.
export const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif';
export const FONT_MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// gold + alpha helpers (matches the app's `Colors.gold + '15'` pattern)
export const withAlpha = (hex: string, alpha: string) => `${hex}${alpha}`;
