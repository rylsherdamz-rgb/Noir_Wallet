import { useEffect, useState, useCallback } from 'react'
import { nfcService } from '@/services/nfc'
import { NFCTag } from '@/types'

export function useNfc() {
  const [isSupported, setIsSupported] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastTag, setLastTag] = useState<NFCTag | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const supported = await nfcService.isSupported()
      setIsSupported(supported)
      if (supported) {
        await nfcService.initialize()
      }
    })()

    return () => {
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

  const clearTag = useCallback(() => {
    setLastTag(null)
    setError(null)
  }, [])

  return {
    isSupported,
    isScanning,
    lastTag,
    error,
    scanTag,
    writeToTag,
    clearTag,
  }
}
