import { View, Text, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors } from '@/constants/theme'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  icon?: keyof typeof Ionicons.glyphMap
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/60 items-center justify-center p-8">
        <View className="w-full max-w-[340] bg-[#121212] rounded-3xl p-6 items-center border border-borderGrey">
          {icon && (
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: variant === 'danger' ? Colors.danger + '15' : Colors.gold + '15',
              }}
            >
              <Ionicons
                name={icon}
                size={28}
                color={variant === 'danger' ? Colors.danger : Colors.gold}
              />
            </View>
          )}
          <Text className="text-xl text-white font-bold text-center mb-2">{title}</Text>
          <Text className="text-sm text-mutedWhite text-center leading-5 mb-6">{message}</Text>
          <View className="flex-row gap-2 w-full">
            <PressableScale
              className="flex-1 py-4 rounded-xl items-center justify-center border border-borderGrey"
              onPress={onCancel}
              disabled={loading}
            >
              <Text className="text-sm text-mutedWhite font-semibold">{cancelLabel}</Text>
            </PressableScale>
            <PressableScale
              className={`flex-1 py-4 rounded-xl items-center justify-center ${variant === 'danger' ? 'bg-[#FF5A5F]' : 'bg-gold'}`}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text className="text-sm font-bold" style={{ color: variant === 'danger' ? Colors.white : Colors.black }}>
                {loading ? 'Please wait...' : confirmLabel}
              </Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  )
}
