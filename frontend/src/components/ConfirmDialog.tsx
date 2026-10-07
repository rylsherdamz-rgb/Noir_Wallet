import { Ionicons } from '@expo/vector-icons'
import { Dialog, PopupDetail } from '@/components/popup/Popup'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message?: string
  /** Label/value rows (amount, recipient, fee) shown in a recessed panel. */
  details?: PopupDetail[]
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  icon?: keyof typeof Ionicons.glyphMap
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

/** Declarative confirm — the branded <Dialog> with confirm/cancel actions. */
export function ConfirmDialog({
  visible, title, message, details, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', icon, onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  return (
    <Dialog
      visible={visible}
      onClose={onCancel}
      title={title}
      message={message}
      details={details}
      icon={icon}
      tone={variant === 'danger' ? 'danger' : 'brand'}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      loading={loading}
      dismissible={!loading}
    />
  )
}
