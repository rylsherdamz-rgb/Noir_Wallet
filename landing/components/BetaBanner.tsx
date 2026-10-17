'use client'

import { useEffect, useState } from 'react'
import { Icon } from './Icons'
import { BETA_FORM_URL } from '@/lib/site'

const DISMISS_KEY = 'noir-beta-banner-dismissed'

/** Sitewide strip recruiting Google Play beta testers. Dismissal is remembered per browser. */
export function BetaBanner() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY) === '1') setHidden(true) } catch {}
  }, [])

  if (hidden) return null

  const dismiss = () => {
    setHidden(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  return (
    <aside className="beta-banner" aria-label="Beta testers wanted">
      <div className="container beta-banner-inner">
        <span className="beta-banner-tag">Beta</span>
        <p>
          <span className="beta-banner-long">We’re launching on Google Play — </span>
          Android testers wanted.
        </p>
        <a className="beta-banner-cta" href={BETA_FORM_URL} target="_blank" rel="noopener">
          Become a beta tester <Icon name="arrow" size="xs" />
        </a>
        <button type="button" className="beta-banner-close" onClick={dismiss} aria-label="Dismiss beta tester banner">
          <Icon name="close" size="xs" />
        </button>
      </div>
    </aside>
  )
}
