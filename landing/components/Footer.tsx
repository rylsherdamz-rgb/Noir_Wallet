import Link from 'next/link'
import { REPO, REPO_BLOB, asset } from '@/lib/site'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link className="brand" href="/" aria-label="Noir home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset('/assets/images/logo-mark.png')} alt="" className="brand-mark" width={28} height={29} />
          <span className="brand-word">NOIR</span>
        </Link>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/docs/">Docs</Link>
          <Link href="/beta/">Beta testing</Link>
          <Link href="/docs/api/">REST API</Link>
          <a href={REPO} target="_blank" rel="noopener">GitHub</a>
          <a href={`${REPO_BLOB}/LICENSE`} target="_blank" rel="noopener">MIT license</a>
          <a href={`${REPO_BLOB}/SECURITY.md`} target="_blank" rel="noopener">Security policy</a>
        </nav>
        <p className="footer-copy">© 2026 Noir · Built on Stellar</p>
      </div>
    </footer>
  )
}
