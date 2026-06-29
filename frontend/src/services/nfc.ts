import NfcManager, {
  NfcTech,
  Ndef,
  NfcEvents,
} from 'react-native-nfc-manager'
import { NFCTag } from '@/types'

class NFCService {
  private initialized = false

  async initialize(): Promise<boolean> {
    try {
      await NfcManager.start()
      this.initialized = true
      return true
    } catch {
      return false
    }
  }

  async isSupported(): Promise<boolean> {
    try {
      return await NfcManager.isSupported()
    } catch {
      return false
    }
  }

  async readTag(timeout = 5000): Promise<NFCTag | null> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Tap your RFID sticker or NFC card against the back of your phone',
      })

      const tag = await NfcManager.getTag()
      if (!tag) return null

      const uid = tag.id ?? ''

      return {
        uid,
        type: tag.type ?? 'unknown',
        isWritable: true,
        maxCapacity: 0,
      }
    } catch {
      return null
    } finally {
      try {
        await NfcManager.cancelTechnologyRequest()
      } catch {}
    }
  }

  async writeTag(
    data: Record<string, string>,
  ): Promise<boolean> {
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
        await (NfcManager as any).writeNdefMessage(bytes)
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
    const sub = NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
      const uid = tag.id ?? ''
      callback({
        uid,
        type: tag.type ?? 'unknown',
        isWritable: true,
        maxCapacity: 0,
      })
    })

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
    }
  }

  cleanup() {
    try {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
      NfcManager.unregisterTagEvent()
    } catch {}
  }
}

export const nfcService = new NFCService()
