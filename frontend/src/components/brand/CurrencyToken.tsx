import { View, Text } from 'react-native'
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

export function CurrencyToken({ asset, size = 38 }: CurrencyTokenProps) {
  const cfg = CONFIG[asset]
  return (
    <View
      className="items-center justify-center border border-borderGrey"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colorWithOpacity(cfg.color, 0.14),
      }}
    >
      {cfg.glyph ? (
        <Text style={{ fontFamily: Fonts.display, includeFontPadding: false, color: cfg.color, fontSize: size * 0.45 }}>
          {cfg.glyph}
        </Text>
      ) : (
        <SparkGlyph size={size * 0.5} color={cfg.color} />
      )}
    </View>
  )
}
