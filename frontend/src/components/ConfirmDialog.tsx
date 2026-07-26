import { View, Text, StyleSheet, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {icon && (
            <View style={[styles.iconWrap, variant === 'danger' && styles.iconDanger]}>
              <Ionicons
                name={icon}
                size={28}
                color={variant === 'danger' ? Colors.danger : Colors.gold}
              />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <PressableScale style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </PressableScale>
            <PressableScale
              style={[styles.confirmBtn, variant === 'danger' && styles.confirmDanger]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmLabel}>{loading ? 'Please wait...' : confirmLabel}</Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.darkGrey,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconDanger: {
    backgroundColor: Colors.danger + '15',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  cancelLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.semibold,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
  },
  confirmDanger: {
    backgroundColor: Colors.danger,
  },
  confirmLabel: {
    fontSize: FontSize.sm,
    color: Colors.black,
    fontWeight: FontWeight.bold,
  },
})
