import { useEffect, useRef, ReactNode } from 'react'
import {
  View,
  Text,
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
import { Colors } from '@/constants/theme'

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
      <View className="flex-1 justify-end" testID={testID}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View className="absolute inset-0 bg-black/60" style={[{ opacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          className="bg-cardBg rounded-t-3xl pb-6"
          style={[{ maxHeight: SCREEN_HEIGHT * 0.85 }, { transform: [{ translateY }] }, DesignTokens.shadows.medium]}
        >
          <View className="items-center py-4">
            <View className="w-9 h-1 rounded-[2] bg-midGrey" />
          </View>

          {(title || subtitle) && (
            <View className="px-6 pb-4 border-b border-borderGrey">
              {title && (
                <Text className="text-xl text-white font-bold text-center" accessibilityRole="header">
                  {title}
                </Text>
              )}
              {subtitle ? <Text className="text-sm text-mutedWhite text-center mt-1">{subtitle}</Text> : null}
            </View>
          )}

          {children ? <View className="px-6 py-4">{children}</View> : null}

          <View className="px-6 gap-1">
            {actions.map((action, index) => (
              <PressableScale
                key={index}
                className={`flex-row items-center gap-4 py-4 px-6 bg-midGrey rounded-xl min-h-[56] ${action.disabled ? 'opacity-60' : ''}`}
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
                  className={`text-base font-semibold flex-1 ${
                    action.destructive ? 'text-[#FF5A5F]' : action.disabled ? 'text-mutedWhite' : 'text-white'
                  }`}
                >
                  {action.label}
                </Text>
              </PressableScale>
            ))}
          </View>

          <PressableScale
            className="mt-4 mx-6 py-4 bg-midGrey rounded-xl border border-borderGrey items-center min-h-[56]"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text className="text-base font-bold text-gold">Cancel</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </Modal>
  )
}
