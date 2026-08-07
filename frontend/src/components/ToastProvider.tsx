import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'
import { Toast } from '@/components/Toast'
import type { ToastType } from '@/types'

/**
 * App-wide toast host.
 *
 * `Toast` already existed but was wired up in a single screen, so most flows —
 * including a successful send — completed with no feedback at all. Mounting one
 * host at the root means any screen can report an outcome without carrying its
 * own visibility state.
 */

interface ToastOptions {
  title: string
  message?: string
  type?: ToastType
}

interface ToastApi {
  show: (options: ToastOptions) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

interface ToastState extends ToastOptions {
  visible: boolean
  type: ToastType
  /** Forces a remount so a second toast with the same text re-animates. */
  key: number
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({
    visible: false,
    type: 'info',
    title: '',
    key: 0,
  })

  const show = useCallback(({ title, message, type = 'info' }: ToastOptions) => {
    setState((prev) => ({ visible: true, title, message, type, key: prev.key + 1 }))
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, message) => show({ title, message, type: 'success' }),
      error: (title, message) => show({ title, message, type: 'error' }),
      info: (title, message) => show({ title, message, type: 'info' }),
    }),
    [show]
  )

  const dismiss = useCallback(() => setState((prev) => ({ ...prev, visible: false })), [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast
        key={state.key}
        visible={state.visible}
        type={state.type}
        title={state.title}
        message={state.message}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside a ToastProvider')
  return context
}
