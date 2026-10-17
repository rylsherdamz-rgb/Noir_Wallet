'use client'

import { useState } from 'react'
import { Icon } from './Icons'

export function CodeBlock({ code, lang, title }: { code: string; lang?: string; title?: string }) {
  const [copied, setCopied] = useState(false)
  const text = code.replace(/^\n+|\s+$/g, '')
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch {}
  }
  return (
    <figure className="code">
      <figcaption className="code-bar">
        <span>{title ?? lang ?? 'code'}</span>
        <button type="button" className="code-copy" onClick={copy} aria-label="Copy code">
          <Icon name="copy" size="xs" />{copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre tabIndex={0}><code className={lang ? `lang-${lang}` : undefined}>{text}</code></pre>
    </figure>
  )
}
