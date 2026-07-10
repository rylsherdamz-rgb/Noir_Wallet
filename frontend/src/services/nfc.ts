import { NFCTag } from '@/types'

/**
 * react-native-nfc-manager is a NATIVE module. It is unavailable in Expo Go and
 * in web builds, where importing/using it throws and blanks the whole app.
 *
 * We therefore load it defensively via require() inside a try/catch. When it is
 * unavailable, every method degrades gracefully (isSupported() → false) so the
 * UI still boots and simply disables NFC entry points. On a custom dev client /
 * production build the native module loads normally.
 */
let NfcManager: any = null
let NfcTech: any = null
let Ndef: any = null
let NfcEvents: any = null

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('react-native-nfc-manager')
  NfcManager = mod.default ?? mod
  NfcTech = mod.NfcTech
  Ndef = mod.Ndef
  NfcEvents = mod.NfcEvents
} catch {
  NfcManager = null
}

class NFCService {
  private initialized = false

  /** True only when the native NFC module is loaded (not Expo Go / web). */
  get available(): boolean {
    return !!NfcManager
  }

  async initialize(): Promise<boolean> {
    if (!NfcManager) return false
    try {
      await NfcManager.start()
      this.initialized = true
      return true
    } catch {
      return false
    }
  }

  async isSupported(): Promise<boolean> {
    if (!NfcManager) return false
    try {
      return await NfcManager.isSupported()
    } catch {
      return false
    }
  }

  async isEnabled(): Promise<boolean> {
    if (!NfcManager) return false
    try {
      return await NfcManager.isEnabled()
    } catch {
      return false
    }
  }

  async goToSettings(): Promise<boolean> {
    if (!NfcManager) return false
    try {
      await NfcManager.goToNfcSetting()
      return true
    } catch {
      return false
    }
  }

  async readTag(timeoutMs = 5000): Promise<NFCTag | null> {
    if (!NfcManager || !NfcEvents) return null

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
        await NfcManager.unregisterTagEvent().catch(() => {})
        resolve(null)
      }, timeoutMs)

      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
        clearTimeout(timer)
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
        await NfcManager.unregisterTagEvent().catch(() => {})
        const uid = typeof tag?.id === 'string' ? tag.id : tag?.id ? String(tag.id) : ''
        if (!uid) { resolve(null); return }
        resolve({
          uid,
          type: tag.type ?? 'unknown',
          isWritable: true,
          maxCapacity: tag.maxSize ?? 0,
        })
      })

      NfcManager.registerTagEvent({
        alertMessage: 'Tap your tag against the back of your phone',
        invalidateAfterFirstRead: true,
        isReaderModeEnabled: true,
      }).catch(() => {
        clearTimeout(timer)
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
        resolve(null)
      })
    })
  }

  async writeTag(data: Record<string, string>): Promise<boolean> {
    if (!NfcManager || !NfcTech || !Ndef) return false
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Hold your tag against the phone to link it',
      })

      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(data.walletAddress ?? ''),
        Ndef.textRecord(data.deviceLabel ?? ''),
        Ndef.uriRecord(data.activationUrl ?? ''),
      ])

      if (bytes) {
        await NfcManager.writeNdefMessage(bytes)
      }
      return true
    } catch {
      return false
    } finally {
      try {
        await NfcManager.cancelTechnologyRequest()
      } catch {}
    }
  }

  registerTagCallback(callback: (tag: NFCTag) => void): () => void {
    if (!NfcManager || !NfcEvents) return () => {}
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
      callback({
        uid: tag.id ?? '',
        type: tag.type ?? 'unknown',
        isWritable: true,
        maxCapacity: 0,
      })
    })
    return () => {
      try {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
      } catch {}
    }
  }

  cleanup() {
    if (!NfcManager || !NfcEvents) return
    try {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
      NfcManager.unregisterTagEvent()
    } catch {}
  }
}

export const nfcService = new NFCService()
