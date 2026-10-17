import Link from 'next/link'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <section className="final">
      <div className="container final-inner">
        <p className="kicker">404</p>
        <h2>Nothing to tap here.</h2>
        <p>That page doesn’t exist. Try the home page or the developer docs.</p>
        <div className="hero-actions">
          <Link className="btn btn-gold" href="/">Home</Link>
          <Link className="btn btn-ghost" href="/docs/">Docs</Link>
        </div>
      </div>
    </section>
  )
}
