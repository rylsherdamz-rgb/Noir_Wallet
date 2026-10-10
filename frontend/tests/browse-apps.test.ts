import { describe, it, expect } from 'vitest'
import { POPULAR_APPS, SCF_APPS, SCF_DIRECTORY_URL, recommendMessage } from '@/constants/stellarApps'

const ALL = [...POPULAR_APPS, ...SCF_APPS]

describe('Browse app catalog', () => {
  it('opens only https links', () => {
    for (const a of ALL) {
      expect(new URL(a.url).protocol).toBe('https:')
      if (a.testnetUrl) expect(new URL(a.testnetUrl).protocol).toBe('https:')
    }
    expect(new URL(SCF_DIRECTORY_URL).host).toBe('communityfund.stellar.org')
  })

  it('lists each app once across both sections', () => {
    const names = ALL.map((a) => a.name)
    expect(new Set(names).size).toBe(names.length)
    const hosts = ALL.map((a) => new URL(a.url).host)
    expect(new Set(hosts).size).toBe(hosts.length)
  })

  it('marks every app in the SCF section as SCF funded', () => {
    expect(SCF_APPS.length).toBeGreaterThan(0)
    for (const a of SCF_APPS) expect(a.scf).toBe(true)
  })

  it('recommend text names the app, links it, and credits SCF only when funded', () => {
    const funded = SCF_APPS[0]
    expect(recommendMessage(funded)).toContain(funded.name)
    expect(recommendMessage(funded)).toContain(funded.url)
    expect(recommendMessage(funded)).toContain('Stellar Community Fund')

    const unfunded = POPULAR_APPS.find((a) => !a.scf)!
    expect(recommendMessage(unfunded)).not.toContain('Stellar Community Fund')
  })
})
