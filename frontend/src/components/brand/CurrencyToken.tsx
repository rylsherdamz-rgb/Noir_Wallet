import { View, Text, StyleSheet } from 'react-native'
import { AssetCode } from '@/types'
import { Colors, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { SparkGlyph } from './BrandGlyph'

interface CurrencyTokenProps {
  asset: AssetCode
  size?: number
}

const CONFIG: Record<AssetCode, { color: string; glyph?: string }> = {
  XLM: { color: Colors.goldDim },
}

/**
 * A small faceted "coin" token for an asset — a tinted disc carrying the
 * currency's own mark (₱ / $ typographic, a spark for XLM). Replaces the
 * mismatched line icons so the asset marks share the app's type system.
 */
export function CurrencyToken({ asset, size = 38 }: CurrencyTokenProps) {
  const cfg = CONFIG[asset]
  return (
    <View
      style={[
        styles.disc,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colorWithOpacity(cfg.color, 0.14),
        },
      ]}
    >
      {cfg.glyph ? (
        <Text style={[styles.glyph, { color: cfg.color, fontSize: size * 0.45 }]}>{cfg.glyph}</Text>
      ) : (
        <SparkGlyph size={size * 0.5} color={cfg.color} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  glyph: {
    fontFamily: Fonts.display,
    includeFontPadding: false,
  },
})
