/**
 * Pure key handling for amount entry on the on-screen keypad, kept separate
 * from the component so the rules (one decimal point, max decimals, no
 * leading zeros) are unit-testable.
 */

/** Stellar amounts carry at most 7 decimal places. */
export const MAX_DECIMALS = 7

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'backspace' | 'clear'

export function applyKeypadKey(
  value: string,
  key: KeypadKey,
  opts: { maxDigits?: number; maxDecimals?: number } = {},
): string {
  const maxDigits = opts.maxDigits ?? 8
  const maxDecimals = opts.maxDecimals ?? MAX_DECIMALS

  if (key === 'clear') return ''
  if (key === 'backspace') return value.slice(0, -1)

  if (key === '.') {
    if (value.includes('.')) return value
    return value === '' ? '0.' : `${value}.`
  }

  const [whole, frac] = value.split('.')
  if (frac !== undefined) {
    if (frac.length >= maxDecimals) return value
    return value + key
  }
  // Replace a lone leading zero instead of producing "05".
  if (whole === '0') return key
  if (whole.length >= maxDigits) return value
  return value + key
}

/** "12.50" → 12.5; "" or "." → 0. */
export function keypadValueToNumber(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}
