/** Turn what the user typed in the Browse bar into a URL: an address, or a web search. */
export function toBrowserUrl(input: string): string | null {
  const q = input.trim()
  if (!q) return null
  // Never load plain http: upgrade to https.
  if (/^https?:\/\//i.test(q)) return q.replace(/^http:\/\//i, 'https://')
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(q)) return `https://${q}`
  return `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
}
