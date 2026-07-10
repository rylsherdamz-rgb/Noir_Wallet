import { View, Text, StyleSheet } from 'react-native'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
  variant?: 'dots' | 'line' | 'numbered'
  testID?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels = [],
  variant = 'dots',
  testID,
}: ProgressIndicatorProps) {
  if (variant === 'dots') {
    return (
      <View
        style={styles.dotsContainer}
        testID={testID}
        accessibilityRole="progressbar"
        accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
        accessibilityValue={{ now: currentStep, min: 1, max: totalSteps }}
      >
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <View
            key={step}
            style={[
              styles.dot,
              step === currentStep && styles.dotActive,
              step < currentStep && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
    )
  }

  if (variant === 'line') {
    const progress = (currentStep / totalSteps) * 100

    return (
      <View style={styles.lineContainer} testID={testID}>
        <View style={styles.lineBackground}>
          <View style={[styles.lineProgress, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.lineText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
    )
  }

  // Numbered variant
  return (
    <View style={styles.numberedContainer} testID={testID}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isActive = step === currentStep
        const isCompleted = step < currentStep
        const label = stepLabels[step - 1]

        return (
          <View key={step} style={styles.numberedStep}>
            <View
              style={[
                styles.numberedCircle,
                isActive && styles.numberedCircleActive,
                isCompleted && styles.numberedCircleCompleted,
              ]}
            >
              <Text
                style={[
                  styles.numberedText,
                  isActive && styles.numberedTextActive,
                  isCompleted && styles.numberedTextCompleted,
                ]}
              >
                {step}
              </Text>
            </View>
            {label && (
              <Text
                style={[
                  styles.numberedLabel,
                  isActive && styles.numberedLabelActive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            )}
            {step < totalSteps && <View style={styles.numberedConnector} />}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  // Dots variant
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderGrey,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.gold,
  },
  dotCompleted: {
    backgroundColor: colorWithOpacity(Colors.gold, 0.5),
  },

  // Line variant
  lineContainer: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  lineBackground: {
    height: 4,
    backgroundColor: Colors.borderGrey,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  lineProgress: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
  },
  lineText: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },

  // Numbered variant
  numberedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  numberedStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  numberedCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.midGrey,
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  numberedCircleActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  numberedCircleCompleted: {
    backgroundColor: colorWithOpacity(Colors.gold, 0.2),
    borderColor: Colors.gold,
  },
  numberedText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.mutedWhite,
  },
  numberedTextActive: {
    color: Colors.black,
  },
  numberedTextCompleted: {
    color: Colors.gold,
  },
  numberedLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    textAlign: 'center',
    maxWidth: 80,
  },
  numberedLabelActive: {
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
  numberedConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: Colors.borderGrey,
    zIndex: -1,
  },
})
