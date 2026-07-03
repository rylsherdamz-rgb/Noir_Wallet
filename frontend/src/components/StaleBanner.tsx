import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface StaleBannerProps {
  message?: string
  onRetry?: () => void
}

/** Warning banner shown when data (e.g. balance) could not be refreshed. */
export function StaleBanner({
  message = 'Showing last known data. Could not refresh.',
  onRetry,
}: StaleBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={16} color={Colors.warning} />
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry refresh"
        >
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '18',
    borderColor: Colors.warning + '44',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.cream,
  },
  retry: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.bold,
  },
})

export default StaleBanner
