import { useEffect, useState, useCallback } from 'react'
import { AppState } from 'react-native'
import { nfcService } from '@/services/nfc'
import { NFCTag } from '@/types'

export function useNfc() {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastTag, setLastTag] = useState<NFCTag | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const supported = await nfcService.isSupported()
      setIsSupported(supported)
      if (supported) {
        const enabled = await nfcService.isEnabled()
        setIsEnabled(enabled)
        await nfcService.initialize()
      }
    })()

    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const enabled = await nfcService.isEnabled()
        setIsEnabled(enabled)
      }
    })

    return () => {
      sub.remove()
      nfcService.cleanup()
    }
  }, [])

  const scanTag = useCallback(async (timeout = 5000): Promise<NFCTag | null> => {
    setIsScanning(true)
    setError(null)
    try {
      const tag = await nfcService.readTag(timeout)
      if (tag) {
        setLastTag(tag)
        return tag
      }
      setError('No tag detected')
      return null
    } catch (err: any) {
      setError(err.message ?? 'NFC scan failed')
      return null
    } finally {
      setIsScanning(false)
    }
  }, [])

  const writeToTag = useCallback(
    async (data: Record<string, string>): Promise<boolean> => {
      setIsScanning(true)
      setError(null)
      try {
        return await nfcService.writeTag(data)
      } catch (err: any) {
        setError(err.message ?? 'NFC write failed')
        return false
      } finally {
        setIsScanning(false)
      }
    },
    [],
  )

  const goToNfcSettings = useCallback(async () => {
    const result = await nfcService.goToSettings()
    if (result) {
      const enabled = await nfcService.isEnabled()
      setIsEnabled(enabled)
    }
    return result
  }, [])

  const clearTag = useCallback(() => {
    setLastTag(null)
    setError(null)
  }, [])

  return {
    isSupported,
    isEnabled,
    isScanning,
    lastTag,
    error,
    scanTag,
    writeToTag,
    goToNfcSettings,
    clearTag,
  }
}
