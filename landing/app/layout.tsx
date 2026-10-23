import type { Metadata, Viewport } from 'next'
import { Jost } from 'next/font/google'
import './globals.css'
import './site.css'
import { Header } from '@/components/Header'
import { BetaBanner } from '@/components/BetaBanner'
import { Footer } from '@/components/Footer'
import { IconSprite } from '@/components/Icons'
import { RevealObserver } from '@/components/Reveal'
import { JsonLd } from '@/components/JsonLd'
import { DESCRIPTION, KEYWORDS, OG_IMAGE, REPO, SITE_NAME, SITE_URL, TAGLINE, asset } from '@/lib/site'
import { Analytics } from '@vercel/analytics/next'

const jost = Jost({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-jost', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: `${SITE_NAME} — ${TAGLINE} NFC tap-to-pay on Stellar`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: 'Richie Christian De Guzman' }],
  creator: 'Noir',
  publisher: 'Noir',
  category: 'finance',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: `${SITE_URL}/`,
    images: [OG_IMAGE],
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: 'An open-source Stellar wallet you pay with by tapping an NFC card. No unlock, no app, no confirmation.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: 'An open-source Stellar wallet you pay with by tapping an NFC card.',
    creator: '@ChichiCode0',
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  icons: { icon: asset('/assets/images/favicon.png'), apple: asset('/assets/images/logo-mark.png') },
  formatDetection: { telephone: false, address: false, email: false },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/images/logo-mark.png`,
  sameAs: [REPO],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jost.variable}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <IconSprite />
        <BetaBanner />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <RevealObserver />
        <JsonLd data={organization} />
        <Analytics />
      </body>
    </html>
  )
}
