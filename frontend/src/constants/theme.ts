/**
 * Theme Constants
 * 
 * This file provides backward-compatible exports from the design tokens.
 * Prefer importing from designTokens.ts for new code.
 * 
 * @deprecated Use DesignTokens from '@/constants/designTokens' instead
 */

import { DesignTokens } from './designTokens'

// Backward compatible color exports
export const Colors = {
  // Core surfaces (warm dark, anchored to gold hue ~80)
  black: DesignTokens.colors.special.black,
  darkGrey: DesignTokens.colors.surface.dark,
  surfaceBg: DesignTokens.colors.surface.bg,
  cardBg: DesignTokens.colors.surface.card,
  midGrey: DesignTokens.colors.surface.mid,
  lightGrey: DesignTokens.colors.surface.light,
  borderGrey: DesignTokens.colors.surface.border,

  // Text (warm-tinted neutrals)
  white: DesignTokens.colors.text.primary,
  offWhite: DesignTokens.colors.text.secondary,
  mutedWhite: DesignTokens.colors.text.tertiary,

  // Brand accent - gold
  gold: DesignTokens.colors.brand.gold,
  goldHi: DesignTokens.colors.brand.goldHi,
  goldDeep: DesignTokens.colors.brand.goldDeep,
  goldDim: DesignTokens.colors.brand.goldDim,
  cream: DesignTokens.colors.brand.cream,
  silver: DesignTokens.colors.brand.silver,

  // Semantic
  success: DesignTokens.colors.semantic.success,
  warning: DesignTokens.colors.semantic.warning,
  danger: DesignTokens.colors.semantic.danger,
  error: DesignTokens.colors.semantic.error,

  // Legacy aliases
  accentGreen: DesignTokens.colors.semantic.success,
  accentRed: DesignTokens.colors.semantic.danger,
  accentYellow: DesignTokens.colors.semantic.warning,
  overlay: DesignTokens.colors.special.overlay,
}

// Backward compatible spacing exports
export const Spacing = {
  xs: DesignTokens.spacing.xs,
  sm: DesignTokens.spacing.sm,
  md: DesignTokens.spacing.md,
  lg: DesignTokens.spacing.lg,
  xl: DesignTokens.spacing.xl,
  xxl: DesignTokens.spacing.xxl,
}

// Backward compatible font size exports
export const FontSize = {
  xs: DesignTokens.typography.size.xs,
  sm: DesignTokens.typography.size.sm,
  md: DesignTokens.typography.size.md,
  lg: DesignTokens.typography.size.lg,
  xl: DesignTokens.typography.size.xl,
  xxl: DesignTokens.typography.size.xxl,
  xxxl: DesignTokens.typography.size.xxxl,
  hero: DesignTokens.typography.size.hero,
}

// Backward compatible font weight exports
export const FontWeight = {
  regular: DesignTokens.typography.weight.regular,
  medium: DesignTokens.typography.weight.medium,
  semibold: DesignTokens.typography.weight.semibold,
  bold: DesignTokens.typography.weight.bold,
  heavy: DesignTokens.typography.weight.heavy,
}

// Backward compatible border radius exports
export const BorderRadius = {
  sm: DesignTokens.borderRadius.sm,
  md: DesignTokens.borderRadius.md,
  lg: DesignTokens.borderRadius.lg,
  xl: DesignTokens.borderRadius.xl,
  full: DesignTokens.borderRadius.full,
}

// Brand font families (Jost geometric sans; loaded in app/_layout via expo-font)
export const Fonts = {
  display: DesignTokens.fontFamily.display,
  displayMd: DesignTokens.fontFamily.displayMd,
  displayRg: DesignTokens.fontFamily.displayRg,
  mono: DesignTokens.fontFamily.mono,
}
