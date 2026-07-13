import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'react-native-reanimated'

interface CountUpOptions {
  duration?: number
  enabled?: boolean
}

/**
 * Animates a number from 0 up to `target` with an ease-out curve.
 * Purely presentational — returns the current display value each frame.
 * Honors reduced-motion (jumps straight to the target) and the `enabled`
 * flag (e.g. paused while the balance is hidden for privacy).
 */
export function useCountUp(target: number, { duration = 900, enabled = true }: CountUpOptions = {}): number {
  const reduced = useReducedMotion()
  const animate = enabled && !reduced
  const [value, setValue] = useState(animate ? 0 : target)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!animate) {
      setValue(target)
      return
    }

    startRef.current = null
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const p = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, animate])

  return value
}
