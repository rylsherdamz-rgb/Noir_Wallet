import { useEffect, useRef, ReactNode } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface ActionSheetAction {
  label: string
  icon?: keyof typeof Ionicons.glyphMap
  onPress: () => void
  destructive?: boolean
  disabled?: boolean
}

interface ActionSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  actions: ActionSheetAction[]
  children?: ReactNode
  testID?: string
}

export function ActionSheet({
  visible,
  onClose,
  title,
  subtitle,
  actions,
  children,
  testID,
}: ActionSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: DesignTokens.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: DesignTokens.animation.duration.quick,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: DesignTokens.animation.duration.quick,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    onClose()
  }

  const handleActionPress = (action: ActionSheetAction) => {
    if (action.disabled) return

    if (Platform.OS !== 'web') {
      if (action.destructive) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }
    }

    action.onPress()
    handleClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container} testID={testID}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              {title && (
                <Text style={styles.title} accessibilityRole="header">
                  {title}
                </Text>
              )}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          )}

          {/* Custom Content */}
          {children ? <View style={styles.content}>{children}</View> : null}

          {/* Actions */}
          <View style={styles.actions}>
            {actions.map((action, index) => (
              <PressableScale
                key={index}
                style={[
                  styles.actionButton,
                  action.disabled && styles.actionButtonDisabled,
                ]}
                onPress={() => handleActionPress(action)}
                disabled={action.disabled}
               
                accessibilityRole="button"
                accessibilityLabel={action.label}
                accessibilityState={{ disabled: action.disabled }}
              >
                {action.icon && (
                  <Ionicons
                    name={action.icon}
                    size={DesignTokens.iconSize.sm}
                    color={
                      action.destructive
                        ? Colors.danger
                        : action.disabled
                        ? Colors.mutedWhite
                        : Colors.white
                    }
                  />
                )}
                <Text
                  style={[
                    styles.actionLabel,
                    action.destructive && styles.actionLabelDestructive,
                    action.disabled && styles.actionLabelDisabled,
                  ]}
                >
                  {action.label}
                </Text>
              </PressableScale>
            ))}
          </View>

          {/* Cancel Button */}
          <PressableScale
            style={styles.cancelButton}
            onPress={handleClose}
           
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.lg,
    maxHeight: SCREEN_HEIGHT * 0.85,
    ...DesignTokens.shadows.medium,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderGrey,
    borderRadius: BorderRadius.full,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.midGrey,
    borderRadius: BorderRadius.md,
    minHeight: DesignTokens.touchTarget.comfortable,
  },
  actionButtonDisabled: {
    opacity: DesignTokens.opacity.strong,
  },
  actionLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
    flex: 1,
  },
  actionLabelDestructive: {
    color: Colors.danger,
  },
  actionLabelDisabled: {
    color: Colors.mutedWhite,
  },
  cancelButton: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.midGrey,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    alignItems: 'center',
    minHeight: DesignTokens.touchTarget.comfortable,
  },
  cancelLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
  },
})
