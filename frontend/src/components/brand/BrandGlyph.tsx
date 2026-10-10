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
 * The official Stellar (XLM) logo mark — the ring with two diagonal bars —
 * as published in Stellar's brand assets. Drawn single-colour so it can take
 * the app's gold; fits a `size` × `size` box (the mark is ~1.18:1, letterboxed).
 */
export function StellarMark({ size = 18, color }: Omit<GlyphProps, 'strokeWidth'>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 236.36 200" accessibilityLabel="Stellar">
      <Path
        fill={color}
        d="M203,26.16l-28.46,14.5-137.43,70a82.49,82.49,0,0,1-.7-10.69A82.88,82.88,0,0,1,159.82,28.07l16.29-8.3,2.43-1.24A100,100,0,0,0,18.18,100q0,3.82.29,7.61a18.19,18.19,0,0,1-9.88,17.58L0,129.57V150l25.29-12.89,0,0,8.19-4.18,8.07-4.11v0L186.43,55l16.28-8.29,33.65-17.15V9.14Z"
      />
      <Path
        fill={color}
        d="M236.36,50,49.78,145,33.5,153.31,0,170.38v20.41l33.27-16.95,28.46-14.5L199.3,89.24A83.45,83.45,0,0,1,200,100,82.87,82.87,0,0,1,76.45,172.26l-1,.53-17.66,9A100,100,0,0,0,218.18,100c0-2.57-.1-5.14-.29-7.68a18.2,18.2,0,0,1,9.87-17.58l8.6-4.38Z"
      />
    </Svg>
  )
}
