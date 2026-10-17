'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DOCS, docPath } from '@/lib/docs'

export function DocsNav() {
  const pathname = usePathname()
  const here = pathname.endsWith('/') ? pathname : `${pathname}/`
  return (
    <nav className="docs-nav" aria-label="Documentation">
      <p className="docs-nav-title">Documentation</p>
      <ul>
        {DOCS.map((d) => (
          <li key={d.slug}>
            <Link href={docPath(d.slug)} aria-current={here === docPath(d.slug) ? 'page' : undefined}>{d.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
