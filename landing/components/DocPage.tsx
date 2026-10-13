import Link from 'next/link'
import { DOCS, docPath, type DocSlug } from '@/lib/docs'
import { SITE_URL } from '@/lib/site'
import { JsonLd } from './JsonLd'
import { Icon } from './Icons'

/** Frame for one docs page: heading, breadcrumb data for search engines, and prev/next links. */
export function DocPage({ slug, children }: { slug: DocSlug; children: React.ReactNode }) {
  const i = DOCS.findIndex((d) => d.slug === slug)
  const doc = DOCS[i]
  const prev = DOCS[i - 1]
  const next = DOCS[i + 1]
  const crumbs = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Docs', url: `${SITE_URL}/docs/` },
    ...(slug ? [{ name: doc.title, url: `${SITE_URL}${docPath(slug)}` }] : []),
  ]

  return (
    <article className="doc">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, n) => ({ '@type': 'ListItem', position: n + 1, name: c.name, item: c.url })),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: doc.title,
        description: doc.description,
        url: `${SITE_URL}${docPath(slug)}`,
        dateModified: '2026-10-13',
        author: { '@type': 'Organization', name: 'Noir' },
      }} />
      <p className="kicker">Docs</p>
      <h1>{slug ? doc.title : 'Build with Noir'}</h1>
      <p className="doc-lede">{doc.description}</p>
      <div className="doc-body">{children}</div>
      <nav className="doc-pager" aria-label="Previous and next page">
        {prev ? <Link href={docPath(prev.slug)} className="prev"><small>Previous</small>{prev.title}</Link> : <span />}
        {next ? <Link href={docPath(next.slug)} className="next"><small>Next</small>{next.title} <Icon name="arrow" size="xs" /></Link> : <span />}
      </nav>
    </article>
  )
}
