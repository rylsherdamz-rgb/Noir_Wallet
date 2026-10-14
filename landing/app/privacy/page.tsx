import type { Metadata } from 'next'
import { REPO, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy policy — Noir extension',
  description: 'What the Noir browser extension stores, what it sends over the network, and what it never collects.',
  alternates: { canonical: `${SITE_URL}/privacy/` },
}

export default function Privacy() {
  return (
    <div className="container docs-shell" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <article className="doc">
        <p className="kicker">Privacy</p>
        <h1>Noir extension privacy policy</h1>
        <p className="doc-lede">Effective 15 October 2026. Noir is open source (MIT); everything below can be checked in the code.</p>
        <div className="doc-body">
          <h2 id="summary">In short</h2>
          <p>Noir does not collect, sell or share personal data. There is no Noir account, no analytics and no tracking. Noir has no server that receives your data.</p>

          <h2 id="stored">What is stored on your device</h2>
          <ul className="doc-list">
            <li><b>Your recovery phrase</b>, encrypted with AES-256-GCM under a key derived from your password (PBKDF2-SHA256, 600,000 iterations). The password itself is never stored.</li>
            <li><b>Your public Stellar address</b> and <b>selected network</b> (Testnet or Mainnet).</li>
            <li><b>The websites you connected</b>, so they don’t have to ask again until you disconnect them.</li>
            <li>While unlocked, the signing key is held in the browser’s session memory only, is cleared when the browser closes, and is removed after 15 minutes without use.</li>
          </ul>
          <p>This data stays in your browser’s extension storage. Removing the extension or choosing “Remove wallet” deletes it.</p>

          <h2 id="network">What is sent over the network</h2>
          <p>To show balances and your Noir cards, the extension sends your <b>public</b> address to public Stellar infrastructure run by the Stellar Development Foundation:</p>
          <ul className="doc-list">
            <li>Horizon (<code>horizon.stellar.org</code>, <code>horizon-testnet.stellar.org</code>) for balances.</li>
            <li>Soroban RPC (<code>soroban-testnet.stellar.org</code>) to read Noir’s on-chain card contracts.</li>
            <li>Friendbot (<code>friendbot.stellar.org</code>), only when you press “Fund with Friendbot” on Testnet.</li>
          </ul>
          <p>Your recovery phrase, password and private key are never transmitted. Signed transactions are returned only to the website that asked for them, after you approve.</p>

          <h2 id="sites">Websites you use</h2>
          <p>The extension makes a <code>window.noir.stellar</code> interface available to web pages so Stellar apps can request your address and signatures. A site learns your address only after you approve the connection, and every signature requires your approval in a Noir window. What a website does with that data is governed by that website’s own policy.</p>

          <h2 id="children">Children</h2>
          <p>Noir is not directed to children under 13.</p>

          <h2 id="changes">Changes and contact</h2>
          <p>Changes to this policy are published on this page and in the <a href={REPO} target="_blank" rel="noopener">GitHub repository</a>. Questions: open an issue on GitHub.</p>
        </div>
      </article>
    </div>
  )
}
