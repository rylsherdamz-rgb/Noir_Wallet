import Svg, { Path } from 'react-native-svg'

interface GlyphProps {
  size?: number
  color: string
  strokeWidth?: number
}

/**
 * The universal contactless / tap-to-pay mark — three nested arcs.
 * Reads instantly as "tap here", and pairs with <SignalRipple /> radiating out.
 */
export function TapGlyph({ size = 22, color, strokeWidth = 1.8 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8.5 7.5a9 9 0 0 1 0 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12.5 5a13 13 0 0 1 0 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M16.5 3a17 17 0 0 1 0 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  )
}

/**
 * A four-point spark — the Stellar/XLM asset mark. Evokes "stellar" and stays
 * within the faceted, geometric brand language.
 */
export function SparkGlyph({ size = 18, color }: Omit<GlyphProps, 'strokeWidth'>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c.5 4.8 2.2 6.5 7 7-4.8.5-6.5 2.2-7 7-.5-4.8-2.2-6.5-7-7 4.8-.5 6.5-2.2 7-7z"
        fill={color}
      />
    </Svg>
  )
}
