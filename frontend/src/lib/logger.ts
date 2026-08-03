/**
 * Release-silent logger.
 *
 * Direct `console.*` calls shipped to production, several of them printing
 * wallet addresses, balances and RPC URLs. On a wallet that is both a privacy
 * leak (device logs are readable by other tooling) and noise.
 *
 * `debug`/`info`/`warn` become no-ops outside development. `error` is kept in
 * release builds because a crash with no trace is worse than a log line — but
 * it is the single place to hook up a crash reporter later.
 */

declare const __DEV__: boolean | undefined

const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : false

/**
 * Redact anything shaped like a Stellar public key or secret seed, so a log
 * line that survives into a release build cannot carry a key.
 */
function redact(value: unknown): unknown {
  if (typeof value !== 'string') return value
  return value.replace(/\b[GS][A-Z2-7]{55}\b/g, (match) => `${match.slice(0, 4)}…${match.slice(-4)}`)
}

function redactAll(args: unknown[]): unknown[] {
  return args.map(redact)
}

export const logger = {
  debug(...args: unknown[]): void {
    if (IS_DEV) console.log(...args)
  },

  info(...args: unknown[]): void {
    if (IS_DEV) console.info(...args)
  },

  warn(...args: unknown[]): void {
    if (IS_DEV) console.warn(...args)
  },

  /**
   * Kept in release builds — with addresses and secrets redacted. This is the
   * hook point for a crash reporter.
   */
  error(...args: unknown[]): void {
    console.error(...(IS_DEV ? args : redactAll(args)))
  },
}

export { redact as redactSecrets }
