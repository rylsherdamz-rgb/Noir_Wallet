/**
 * Which unlock methods this install can actually use.
 *
 * The lock screen and the key-export gate both need the same answer: never ask
 * for something the user has not set up. The wallet password is the baseline;
 * phone unlock is offered only when the user turned it on *and* the phone has
 * a lock configured.
 */
import { hasPassword } from './appPassword'
import { hasDeviceBiometrics, hasDeviceSecurity } from './biometrics'

export interface UnlockOptions {
  password: boolean
  /** Phone unlock is turned on and the phone has a fingerprint, face or screen lock. */
  device: boolean
  /** A fingerprint or face is enrolled (vs. a PIN / pattern only) — picks the label. */
  deviceBiometric: boolean
}

export async function getUnlockOptions(deviceUnlockEnabled: boolean): Promise<UnlockOptions> {
  const [password, secured, biometric] = await Promise.all([
    hasPassword(),
    deviceUnlockEnabled ? hasDeviceSecurity() : Promise.resolve(false),
    deviceUnlockEnabled ? hasDeviceBiometrics() : Promise.resolve(false),
  ])
  return { password, device: secured, deviceBiometric: secured && biometric }
}
