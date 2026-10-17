/** Stellar amounts have 7 decimals: 1 XLM = 10,000,000 stroops. */
const DECIMALS = 7

/** '1.5' → 15000000n. Exact (no floats); rejects more than 7 decimals. */
export function toStroops(amount: string | number): bigint {
  const s = typeof amount === 'number' ? amount.toFixed(DECIMALS) : amount.trim()
  const m = /^(-)?(\d+)(?:\.(\d+))?$/.exec(s)
  if (!m) throw new Error(`Not an amount: ${amount}`)
  const frac = (m[3] ?? '').replace(/0+$/, '')
  if (frac.length > DECIMALS) throw new Error(`At most ${DECIMALS} decimals: ${amount}`)
  const v = BigInt(m[2]) * 10n ** BigInt(DECIMALS) + BigInt(frac.padEnd(DECIMALS, '0') || '0')
  return m[1] ? -v : v
}

/** 15000000n → '1.5' */
export function fromStroops(stroops: bigint | number | string): string {
  const v = BigInt(stroops)
  const neg = v < 0n
  const abs = neg ? -v : v
  const whole = abs / 10n ** BigInt(DECIMALS)
  const frac = (abs % 10n ** BigInt(DECIMALS)).toString().padStart(DECIMALS, '0').replace(/0+$/, '')
  return `${neg ? '-' : ''}${whole}${frac ? `.${frac}` : ''}`
}
