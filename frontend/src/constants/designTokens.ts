/**
 * Design Tokens - Centralized design system constants
 * 
 * This file contains all the fundamental design values used throughout the app.
 * Import these tokens instead of hardcoding values to ensure consistency.
 * 
 * @see UI_UX_SPECS.md for detailed usage guidelines
 */

export const DesignTokens = {
  /**
   * Color System
   * All colors follow the warm dark aesthetic anchored to gold
   */
  colors: {
    // Core Surfaces (warm dark, anchored to gold hue ~80)
    surface: {
      bg: '#0A0A0A',         // App background
      card: '#141414',        // Cards, elevated surfaces
      dark: '#121212',        // Deep backgrounds
      mid: '#1E1E1E',         // Input fields, secondary surfaces
      light: '#2C2C2C',       // Hover states, tertiary surfaces
      border: '#3A3A3A',      // Borders, dividers
    },
    
    // Text Colors (warm-tinted neutrals)
    text: {
      primary: '#FFFFFF',     // Primary text
      secondary: '#F5F5F5',   // Secondary text
      tertiary: '#A9A9A9',    // Tertiary text, labels
      disabled: '#666666',    // Disabled text
    },
    
    // Brand & Accent Colors
    brand: {
      gold: '#C6A15B',        // Primary brand, CTAs (matches the logo's mid-gold)
      goldHi: '#D4A964',      // Faceted gold — highlight (gradients, glints)
      goldDeep: '#A57E3D',    // Faceted gold — shadow (gradient depth, pressed)
      goldDim: '#A98A43',     // Dimmed gold for secondary elements
      cream: '#EDE4D0',       // Highlights, special text
      silver: '#CECCD0',      // USDC, secondary brand
    },
    
    // Semantic Colors
    semantic: {
      success: '#3ED598',     // Success states, positive feedback
      warning: '#F0B429',     // Warnings, caution states
      danger: '#FF5A5F',      // Errors, destructive actions
      error: '#FF5A5F',       // Alias for danger
      info: '#4A90E2',        // Information states
    },
    
    // Special Colors
    special: {
      overlay: 'rgba(0, 0, 0, 0.6)',
      overlayLight: 'rgba(0, 0, 0, 0.4)',
      overlayHeavy: 'rgba(0, 0, 0, 0.8)',
      goldGlow: 'rgba(198, 161, 91, 0.3)',
      black: '#000000',
      white: '#FFFFFF',
      /**
       * Text and glyphs sitting *on* a gold fill. Near-black with a gold tint
       * so it reads as part of the brand rather than as pure black on gold.
       */
      onGold: '#151107',
    },

    /**
     * Gradient stops and the near-black elevations between `surface.bg` and
     * `surface.card`. These were previously written as loose hex literals at
     * ~30 call sites, which is how the palette drifted out of the token file.
     */
    gradient: {
      /** Deepest stop — sits under `surface.bg`. */
      base: '#0D0D0D',
      /** Panel/metric fill, a touch above the app background. */
      raised: '#0E0E0E',
      /** Mid stop for card gradients. */
      mid: '#101010',
      /** Upper stop for card gradients. */
      high: '#161616',
      /** Elevated card top stop. */
      elevated: '#191919',
      /** Highest dark stop, used for hero gradients. */
      peak: '#1A1A1A',
      /** Track fill behind progress bars. */
      track: '#1B1B1B',
      /** Divider-weight fill on raised panels. */
      panel: '#242424',
      /** Gold gradient highlight. */
      goldLight: '#E9C482',
      /** Gold gradient mid-shadow. */
      goldShade: '#8F6C33',
      /** Gold gradient deepest shadow. */
      goldDark: '#6E5327',
    },
  },

  /**
   * Brand Font Families
   * Jost — geometric, wide-tracked sans (Futura-class). Loaded in app/_layout via expo-font.
   * Body text intentionally stays on the system font (fontFamily omitted).
   */
  fontFamily: {
    display: 'Jost-SemiBold',   // Wordmark, headings, balance numerals
    displayMd: 'Jost-Medium',   // Eyebrows, labels, tab labels
    displayRg: 'Jost-Regular',  // Geometric body accents
    mono: 'monospace',          // Addresses, hashes
  },

  /**
   * Spacing System
   * Use these values for margins, padding, and gaps
   * Always use values from this system - never arbitrary numbers
   */
  spacing: {
    xs: 4,      // Tight spacing within components
    sm: 8,      // Related elements
    md: 16,     // Standard spacing (default)
    lg: 24,     // Section spacing
    xl: 32,     // Major sections
    xxl: 48,    // Screen-level spacing
  },

  /**
   * Typography System
   * Defines font sizes, weights, and line heights
   */
  typography: {
    // Font Sizes
    size: {
      xs: 12,       // Micro labels, captions
      sm: 14,       // Small labels
      md: 16,       // Body text (default)
      lg: 20,       // Large body text
      xl: 24,       // Card titles
      xxl: 32,      // Section headers, balance displays
      xxxl: 48,     // Page titles
      hero: 64,     // Large amounts, hero numbers
    },
    
    // Font Weights
    weight: {
      regular: '400' as const,    // Body text
      medium: '500' as const,     // Labels, secondary emphasis
      semibold: '600' as const,   // Subheadings
      bold: '700' as const,       // Headings, buttons
      heavy: '800' as const,      // Hero numbers, major emphasis
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,      // Headings
      normal: 1.5,     // Body text
      relaxed: 1.8,    // Large body text
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 1,
      wider: 2,       // For uppercase labels
    },
  },

  /**
   * Border Radius System
   * Defines rounded corners for consistency
   */
  borderRadius: {
    sm: 8,        // Small elements (pills, chips)
    md: 12,       // Buttons, inputs
    lg: 16,       // Cards
    xl: 24,       // Large cards, modals
    full: 9999,   // Circular elements
  },

  /**
   * Shadow System
   * Elevation and depth
   */
  shadows: {
    // Card Shadow (Subtle)
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    
    // Medium Elevation
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    
    // Gold Glow (Brand Moments)
    goldGlow: {
      shadowColor: '#C6A15B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    
    // Success Glow
    successGlow: {
      shadowColor: '#3ED598',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    
    // Error Glow
    errorGlow: {
      shadowColor: '#FF5A5F',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  /**
   * Animation System
   * Timing and easing for consistent motion
   */
  animation: {
    // Duration (in milliseconds)
    duration: {
      instant: 0,
      quick: 150,      // Micro-interactions (button press)
      normal: 300,     // Standard transitions (navigation)
      slow: 500,       // Emphasis animations (success states)
      slower: 800,     // Complex animations
    },
    
    // Easing functions
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
      linear: 'linear',
    },
  },

  /**
   * Touch Target Sizes
   * Minimum sizes for interactive elements
   */
  touchTarget: {
    minimum: 44,      // Absolute minimum (WCAG)
    comfortable: 56,  // Recommended for primary actions
    large: 72,        // For prominent actions
  },

  /**
   * Icon Sizes
   * Standard sizes for icons
   */
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },

  /**
   * Opacity Levels
   * For consistent transparency
   */
  opacity: {
    invisible: 0,
    faint: 0.1,
    light: 0.15,
    medium: 0.3,
    strong: 0.6,
    heavy: 0.85,
    visible: 1,
  },

  /**
   * Z-Index Layers
   * For consistent layering
   */
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    overlay: 400,
    toast: 500,
    tooltip: 600,
  },
}

/**
 * Helper function to get color with opacity
 * @param color - Hex color code
 * @param opacity - Opacity value (0-1)
 */
export function colorWithOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Type exports for TypeScript
 */
export type ColorToken = typeof DesignTokens.colors
export type SpacingToken = typeof DesignTokens.spacing
export type TypographyToken = typeof DesignTokens.typography
export type BorderRadiusToken = typeof DesignTokens.borderRadius
