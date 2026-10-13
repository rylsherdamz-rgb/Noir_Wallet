import type { MetadataRoute } from 'next'
import { BASE_PATH, DESCRIPTION } from '@/lib/site'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Noir — Tap. Pay. Done.',
    short_name: 'Noir',
    description: DESCRIPTION,
    start_url: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [{ src: `${BASE_PATH}/assets/images/logo-mark.png`, sizes: 'any', type: 'image/png' }],
  }
}
