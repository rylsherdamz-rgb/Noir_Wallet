/**
 * Which unlock methods this install can actually use.
 *
 * The lock screen and the key-export gate both need the same answer: never ask
 * for something the user has not set up. The wallet password is the baseline;
 * a legacy app PIN still works if one exists; device unlock is offered only
 * when the user turned it on *and* the phone has a lock configured.
 */
import { hasPassword } from './passwordLock'
import { hasPin } from './pinLock'
import { checkAvailability } from './biometrics'

export interface UnlockMethods {
  password: boolean
  pin: boolean
  /** The phone has a fingerprint, face or screen lock configured. */
  device: boolean
  /** True when a fingerprint or face is enrolled (vs. a PIN / pattern only). */
  deviceBiometric: boolean
}

export async function getUnlockMethods(): Promise<UnlockMethods> {
  const [password, pin, availability] = await Promise.all([hasPassword(), hasPin(), checkAvailability()])
  return {
    password,
    pin,
    device: availability.available,
    deviceBiometric: availability.available && availability.biometric,
  }
}

/** True when the wallet has a secret of its own to lock behind. */
export async function hasAppLock(): Promise<boolean> {
  const [password, pin] = await Promise.all([hasPassword(), hasPin()])
  return password || pin
}
