// Buffer is Node-only; these keep the SDK working in browsers and React Native.

export function toHex(bytes: Uint8Array | ArrayBuffer): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let out = ''
  for (const b of u8) out += b.toString(16).padStart(2, '0')
  return out
}

/** Caller guarantees `hex` is even-length lowercase/uppercase hex. */
export function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}
