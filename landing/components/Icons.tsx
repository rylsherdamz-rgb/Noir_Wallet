/** Inline stroke-icon sprite (currentColor, never boxed). Render once in the layout; use <Icon name="…" /> anywhere. */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-nfc" viewBox="0 0 24 24"><path d="M8.5 7.5a9 9 0 0 1 0 9M12.5 5a13 13 0 0 1 0 14M16.5 3a17 17 0 0 1 0 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></symbol>
        <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></symbol>
        <symbol id="i-agent" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01M2 13v2M22 13v2" /></g></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></g></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5.5V11c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5.5L12 2Z" /><path d="m9 12 2 2 4-4" /></g></symbol>
        <symbol id="i-hash" viewBox="0 0 24 24"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></symbol>
        <symbol id="i-key" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 20 3M17 6l3 3M14 9l2 2" /></g></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></g></symbol>
        <symbol id="i-target" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></g></symbol>
        <symbol id="i-blocks" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></g></symbol>
        <symbol id="i-code" viewBox="0 0 24 24"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-hook" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" /><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" /><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" /></g></symbol>
        <symbol id="i-phone" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M10.5 18.5h3" /></g></symbol>
        <symbol id="i-send" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-recv" viewBox="0 0 24 24"><path d="M17 7 7 17M15 17H7V9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></symbol>
        <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16ZM10 21h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-chev" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></symbol>
        <symbol id="i-del" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5h11v14H9l-6-7 6-7Z" /><path d="m12 9 5 6M17 9l-5 6" /></g></symbol>
        <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.71L5.82 21z" fill="currentColor" /></symbol>
        <symbol id="i-gh" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.85 1.24 1.91 1.24 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.82 1.11.82 2.24 0 1.62-.02 2.93-.02 3.33 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" /></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-copy" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></g></symbol>
        <symbol id="i-play" viewBox="0 0 24 24"><path d="M5 3.5v17l14-8.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></symbol>
      </defs>
    </svg>
  )
}

export type IconName =
  | 'nfc' | 'bolt' | 'agent' | 'lock' | 'shield' | 'hash' | 'key' | 'clock' | 'target' | 'blocks' | 'code' | 'hook'
  | 'phone' | 'send' | 'recv' | 'plus' | 'bell' | 'chev' | 'close' | 'del' | 'star' | 'gh' | 'arrow' | 'copy' | 'play'

export function Icon({ name, size, className = '' }: { name: IconName; size?: 'xs'; className?: string }) {
  return (
    <svg className={`icon${size ? ` icon-${size}` : ''}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}
