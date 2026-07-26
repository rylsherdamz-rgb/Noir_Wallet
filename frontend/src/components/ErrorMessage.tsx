import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  variant?: 'inline' | 'card' | 'fullscreen'
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  variant = 'card',
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <View style={styles.inline}>
        <Ionicons name="alert-circle" size={16} color={Colors.danger} />
        <Text style={styles.inlineText}>{message}</Text>
      </View>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <View style={styles.fullscreen}>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-offline-outline" size={40} color={Colors.danger} />
        </View>
        <Text style={styles.fullTitle}>{title}</Text>
        <Text style={styles.fullMessage}>{message}</Text>
        {onRetry && (
          <PressableScale style={styles.retryBtn} onPress={onRetry}>
            <Ionicons name="refresh" size={18} color={Colors.black} />
            <Text style={styles.retryLabel}>{retryLabel}</Text>
          </PressableScale>
        )}
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardIcon}>
          <Ionicons name="alert-circle" size={22} color={Colors.danger} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardMessage}>{message}</Text>
        </View>
      </View>
      {onRetry && (
        <PressableScale style={styles.cardRetry} onPress={onRetry}>
          <Text style={styles.cardRetryText}>{retryLabel}</Text>
          <Ionicons name="refresh" size={14} color={Colors.gold} />
        </PressableScale>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  inlineText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    flex: 1,
  },
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.danger + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  fullTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  fullMessage: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  retryLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.black,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
    padding: Spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cardIcon: {
    marginTop: 2,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  cardMessage: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 2,
    lineHeight: 16,
  },
  cardRetry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
  },
  cardRetryText: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
})
