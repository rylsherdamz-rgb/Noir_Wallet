import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme'
import { ReactNode } from 'react'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBackPress?: () => void
  rightAction?: ReactNode
  variant?: 'default' | 'large' | 'minimal'
  testID?: string
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightAction,
  variant = 'default',
  testID,
}: ScreenHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  const containerStyle = [
    styles.container,
    variant === 'large' && styles.containerLarge,
    variant === 'minimal' && styles.containerMinimal,
  ]

  const titleStyle = [
    styles.title,
    variant === 'large' && styles.titleLarge,
    variant === 'minimal' && styles.titleMinimal,
  ]

  return (
    <View style={containerStyle} testID={testID}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={titleStyle} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>{rightAction || <View style={styles.backButton} />}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: DesignTokens.touchTarget.comfortable,
  },
  containerLarge: {
    paddingVertical: Spacing.lg,
    minHeight: DesignTokens.touchTarget.large,
  },
  containerMinimal: {
    paddingVertical: Spacing.sm,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    width: DesignTokens.touchTarget.minimum,
    height: DesignTokens.touchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  titleLarge: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.heavy,
  },
  titleMinimal: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 2,
    textAlign: 'center',
  },
})
