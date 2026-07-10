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

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('react-native-nfc-manager')
  NfcManager = mod.default ?? mod
  NfcTech = mod.NfcTech
  Ndef = mod.Ndef
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
    if (!NfcManager || !NfcTech) return null
    
    const timer = setTimeout(() => {
      NfcManager.cancelTechnologyRequest().catch(() => {})
    }, timeoutMs)
    
    try {
      // Request NFC technology
      const techs = [NfcTech.Ndef, NfcTech.NfcA, NfcTech.IsoDep]
      await NfcManager.requestTechnology(techs, {
        alertMessage: 'Tap your RFID sticker or NFC card against the back of your phone',
      })

      // Get the tag
      const tag = await NfcManager.getTag()
      if (!tag?.id) return null

      // Handle different ID formats
      let uid = ''
      if (typeof tag.id === 'string') {
        uid = tag.id
      } else if (Array.isArray(tag.id)) {
        // Convert byte array to hex string
        uid = tag.id.map((byte: number) => byte.toString(16).padStart(2, '0')).join('')
      } else {
        uid = String(tag.id)
      }

      return {
        uid,
        type: tag.type ?? 'unknown',
        isWritable: tag.isWritable ?? true,
        maxCapacity: tag.maxSize ?? 0,
      }
    } catch (error) {
      console.error('NFC readTag error:', error)
      return null
    } finally {
      clearTimeout(timer)
      try {
        await NfcManager.cancelTechnologyRequest()
      } catch {}
    }
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
}

export const nfcService = new NFCService()
