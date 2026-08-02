import { describe, it, expect, afterEach } from 'vitest'
import {
  contractsFor,
  setActiveContractNetwork,
  getActiveContractNetwork,
  hasContractsConfigured,
  AppConfig,
} from '@/constants/config'
import { formatRelativeTime } from '@/screens/DashboardScreen'

const originalNetwork = getActiveContractNetwork()

afterEach(() => {
  setActiveContractNetwork(originalNetwork)
})

describe('per-network contract config', () => {
  it('keeps a separate contract set per network', () => {
    const testnet = contractsFor('testnet')
    const mainnet = contractsFor('mainnet')
    expect(Object.keys(testnet).sort()).toEqual(Object.keys(mainnet).sort())
  })

  it('resolves AppConfig against the active network, not the import-time one', () => {
    setActiveContractNetwork('testnet')
    expect(AppConfig.stellar.deviceRegistryContract).toBe(
      contractsFor('testnet').deviceRegistryContract
    )

    setActiveContractNetwork('mainnet')
    expect(AppConfig.stellar.deviceRegistryContract).toBe(
      contractsFor('mainnet').deviceRegistryContract
    )
    expect(AppConfig.stellar.agentRegistryContract).toBe(
      contractsFor('mainnet').agentRegistryContract
    )
    expect(AppConfig.stellar.paymentEscrowContract).toBe(
      contractsFor('mainnet').paymentEscrowContract
    )
  })

  it('tracks the active network', () => {
    setActiveContractNetwork('mainnet')
    expect(getActiveContractNetwork()).toBe('mainnet')
    setActiveContractNetwork('testnet')
    expect(getActiveContractNetwork()).toBe('testnet')
  })

  it('reports a network with a missing deployment as unconfigured', () => {
    const complete = (n: 'testnet' | 'mainnet') => {
      const c = contractsFor(n)
      return Boolean(
        c.deviceRegistryContract && c.agentRegistryContract && c.paymentEscrowContract
      )
    }
    expect(hasContractsConfigured('testnet')).toBe(complete('testnet'))
    expect(hasContractsConfigured('mainnet')).toBe(complete('mainnet'))
  })

  it('defaults hasContractsConfigured to the active network', () => {
    setActiveContractNetwork('mainnet')
    expect(hasContractsConfigured()).toBe(hasContractsConfigured('mainnet'))
  })
})

describe('balance freshness label', () => {
  const now = 1_700_000_000_000

  it('calls a very recent read "just now"', () => {
    expect(formatRelativeTime(now, now)).toBe('just now')
    expect(formatRelativeTime(now - 30_000, now)).toBe('just now')
  })

  it('switches to minutes past the just-now window', () => {
    expect(formatRelativeTime(now - 60_000, now)).toBe('1m ago')
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5m ago')
  })

  it('rolls up to hours and days', () => {
    expect(formatRelativeTime(now - 60 * 60_000, now)).toBe('1h ago')
    expect(formatRelativeTime(now - 5 * 60 * 60_000, now)).toBe('5h ago')
    expect(formatRelativeTime(now - 25 * 60 * 60_000, now)).toBe('1d ago')
  })

  it('never reports a negative age from a clock skew', () => {
    expect(formatRelativeTime(now + 60_000, now)).toBe('just now')
  })
})
