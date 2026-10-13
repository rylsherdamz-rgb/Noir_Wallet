import type { MetadataRoute } from 'next'
import { DOCS, docPath } from '@/lib/docs'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-10-13')
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    ...DOCS.map((d) => ({
      url: `${SITE_URL}${docPath(d.slug)}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: d.slug ? 0.7 : 0.8,
    })),
  ]
}
