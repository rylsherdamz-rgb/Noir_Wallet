import { useEffect, useState, useCallback } from 'react'
import { readContract, sourceAccountExists } from '@/lib/soroban'
import { AppConfig } from '@/constants/config'
import { useAppStore } from '@/store/useAppStore'

export interface ProfileState {
  loading: boolean
  error: string | null
  walletExists: boolean
}

export function useProfile() {
  const user = useAppStore((s) => s.user)
  const [state, setState] = useState<ProfileState>({
    loading: false,
    error: null,
    walletExists: false,
  })

  useEffect(() => {
    if (!user?.stellarPublicKey) return

    let cancelled = false

    ;(async () => {
      setState({ loading: true, error: null, walletExists: false })
      try {
        const exists = await sourceAccountExists(user.stellarPublicKey)
        if (cancelled) return
        setState({ loading: false, error: null, walletExists: exists })
      } catch (err: any) {
        if (cancelled) return
        setState({
          loading: false,
          error: err?.message ?? 'Failed to load profile',
          walletExists: false,
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.stellarPublicKey])

  const checkDeviceRegistration = useCallback(
    async (deviceHash: string): Promise<string | null> => {
      if (!user?.stellarPublicKey || !AppConfig.stellar.deviceRegistryContract) {
        return null
      }
      try {
        const result = await readContract({
          contractId: AppConfig.stellar.deviceRegistryContract,
          method: 'get_wallet',
          args: [
            // TODO: convert deviceHash to xdr.ScVal
          ],
          source: user.stellarPublicKey,
        })
        return result.toString()
      } catch {
        return null
      }
    },
    [user?.stellarPublicKey],
  )

  return {
    ...state,
    checkDeviceRegistration,
  }
}
