import Link from 'next/link'
import type { Metadata } from 'next'
import { Icon } from '@/components/Icons'
import { APK_URL, BETA_FORM_EMBED_URL, BETA_FORM_URL, RELEASE_LABEL, RELEASE_URL, REPO, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Become a beta tester',
  description: 'Sign up to test the Noir beta on Android: link an NFC card, set its agent, and tap to pay on Stellar Testnet.',
  alternates: { canonical: `${SITE_URL}/beta/` },
}

export default function Beta() {
  return (
    <section className="beta">
      <div className="container beta-inner">
        <div className="section-head">
          <p className="kicker">Beta program</p>
          <h1>Become a beta tester.</h1>
          <p className="section-lede">
            Help us test Noir on real phones and real NFC tags before Google Play. You’ll get the Android build,
            test Testnet XLM, and a direct line to the team for bugs and feedback.
          </p>
        </div>

        <ul className="rows">
          <li><Icon name="nfc" className="gold" /><div><h3>What you’ll test</h3><p>Creating a wallet, linking an NFC card or sticker, setting its agent policy, funding it, and tap-to-pay.</p></div></li>
          <li><Icon name="shield" className="gold" /><div><h3>What you need</h3><p>An Android phone with NFC. An NTAG213 card or sticker helps; we can point you to one. Everything runs on Stellar Testnet — no real money.</p></div></li>
        </ul>

        {BETA_FORM_EMBED_URL ? (
          <div className="beta-form">
            <iframe src={BETA_FORM_EMBED_URL} title="Noir beta tester sign-up form" loading="lazy">Loading…</iframe>
          </div>
        ) : null}

        <div className="hero-actions">
          {BETA_FORM_URL
            ? <a className="btn btn-gold" href={BETA_FORM_URL} target="_blank" rel="noopener">{BETA_FORM_EMBED_URL ? 'Open the form in a new tab' : 'Sign up as a beta tester'}</a>
            : <span className="btn btn-soon" role="note">Sign-ups opening soon</span>}
          <a className="btn btn-ghost" href={APK_URL} download>Download the APK</a>
        </div>
        <p className="dl-note">
          {RELEASE_LABEL} · <a href={RELEASE_URL} target="_blank" rel="noopener">Release notes</a> · Found a bug?{' '}
          <a href={`${REPO}/issues/new/choose`} target="_blank" rel="noopener">Open an issue</a> · <Link href="/">Back home</Link>
        </p>
      </div>
    </section>
  )
}
