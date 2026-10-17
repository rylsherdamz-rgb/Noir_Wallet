import { DocsNav } from '@/components/DocsNav'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container docs-shell">
      <DocsNav />
      <div className="docs-main">{children}</div>
    </div>
  )
}
