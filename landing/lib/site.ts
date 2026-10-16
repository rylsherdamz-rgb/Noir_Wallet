/** One place for every URL, ID and fact the site repeats. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rylsherdamz-rgb.github.io/Noir_Wallet').replace(/\/$/, '')
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
/** Prefix for files in /public (next/link handles basePath itself; plain src/href don't). */
export const asset = (path: string) => `${BASE_PATH}${path}`

export const SITE_NAME = 'Noir'
/** Share card, 1200×630 (public/og.png). */
export const OG_IMAGE = { url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: 'Noir — Tap. Pay. Done. NFC tap-to-pay on Stellar' }
export const TAGLINE = 'Tap. Pay. Done.'
export const DESCRIPTION =
  'Noir is an open-source Stellar wallet you pay with by tapping an NFC card. Each card is bound to a constrained agent on Soroban — per-payment cap, one asset, an expiry — so a tap pays without unlocking your phone.'

export const REPO = 'https://github.com/rylsherdamz-rgb/Noir_Wallet'
export const REPO_TREE = `${REPO}/tree/main`
export const REPO_BLOB = `${REPO}/blob/main`
/** Latest GitHub release ("Beta Testing"). On a new release, update the tag, asset name and label together. */
export const RELEASE_TAG = 'Beta-Testing'
export const RELEASE_LABEL = 'Beta 1.0.0'
export const RELEASE_URL = `${REPO}/releases/tag/${RELEASE_TAG}`
export const APK_URL = `${REPO}/releases/download/${RELEASE_TAG}/app-release.apk`
/**
 * Beta tester sign-up (Google Form): set NEXT_PUBLIC_BETA_FORM_URL, or put the link in the '' fallback.
 * Use the form's full share link (Send → link, e.g. https://docs.google.com/forms/d/e/<id>/viewform).
 * Empty → /beta/ shows a "sign-ups opening soon" note instead of the form.
 */
export const BETA_FORM_URL = (process.env.NEXT_PUBLIC_BETA_FORM_URL ?? '').trim()
/** Same form in embed mode for the iframe on /beta/. Short forms.gle links can't be embedded → ''. */
export const BETA_FORM_EMBED_URL = /^https:\/\/docs\.google\.com\/forms\//.test(BETA_FORM_URL)
  ? `${BETA_FORM_URL.split('?')[0].replace(/\/(edit|viewform)?\/?$/, '')}/viewform?embedded=true`
  : ''
export const DEMO_ON_X = 'https://x.com/ChichiCode0/status/2083815952635093215'

/** Live Stellar Testnet deployment (see deploy-evidence/ in the repo). */
export const CONTRACTS = [
  {
    name: 'device_registry',
    id: 'CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA',
    role: 'Binds the SHA-256 hash of an NFC tag to the wallet that owns it.',
  },
  {
    name: 'agent_registry',
    id: 'CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ',
    role: 'Stores each device’s agent policy: which key may spend, which asset, how much per payment, until when.',
  },
  {
    name: 'payment_escrow',
    id: 'CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX',
    role: 'Holds each device’s pre-funded balance; authorizes taps within policy and lets merchants claim in batch.',
  },
] as const

export const explorer = (contractId: string) => `https://stellar.expert/explorer/testnet/contract/${contractId}`

export const KEYWORDS = [
  'Noir', 'Noir wallet', 'Stellar wallet', 'NFC payments', 'tap to pay crypto', 'Soroban smart contracts',
  'x402', 'agent payments', 'delegated payment authorization', 'Stellar SDK', 'NTAG213', 'Stellar Community Fund',
]
