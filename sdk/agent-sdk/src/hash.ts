import { xdr } from '@stellar/stellar-sdk'

const HEX_32 = /^[0-9a-f]{64}$/

/** Normalises a device hash (SHA-256 of the tag UID, as Noir stores it) to lowercase hex. */
export function normalizeDeviceHash(deviceHash: string): string {
  const hex = deviceHash.trim().toLowerCase().replace(/^0x/, '')
  if (!HEX_32.test(hex)) throw new Error('deviceHash must be 32 bytes of hex (64 characters)')
  return hex
}

export function deviceHashScVal(deviceHash: string): xdr.ScVal {
  return xdr.ScVal.scvBytes(Buffer.from(normalizeDeviceHash(deviceHash), 'hex'))
}
