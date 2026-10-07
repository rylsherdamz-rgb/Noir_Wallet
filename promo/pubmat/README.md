# Noir Wallet — Pubmat Toolkit

Brand-exact promotional material for Noir Wallet, plus a browser-based editor to produce your own graphics for X and social.

## Contents

| File | Purpose |
|------|---------|
| `editor.html` | Web-based pubmat editor (open in a browser) |
| `pubmat.html` | The static pubmat template used by the render pipeline |
| `shoot.js` | Playwright script that renders `pubmat.html` → PNG |
| `test-editor.js` | Playwright end-to-end test for the editor |
| `noir-pubmat.png` | Latest rendered pubmat (3200×1800, 16:9) |
| `logo.jpg` | The Noir Wallet logo used in the graphics |

## Using the Editor

Open `editor.html` in any modern browser (double-click, or serve the folder):

```bash
cd promo/pubmat
python3 -m http.server 4599
# then visit http://localhost:4599/editor.html
```

Serving over HTTP (rather than `file://`) ensures the Jost web font and the
`html-to-image` export library load correctly.

### What you can edit

- **Eyebrow / kicker** text
- **Wordmark** — the cream word and the gold word
- **Headline** — two lines (line 2 uses the accent color)
- **Subhead** paragraph
- **Feature chips** — add/remove, edit label and dot color
- **Footer** handle and tag
- **Logo/image upload** — with a "knock out black background" toggle for logos on a black backdrop (like the default)
- **Accent color** — eight presets or a custom hex
- **Aspect ratio** — 16:9 (X landscape), 1:1 (square), 4:5 (portrait)
- **Export** — download a PNG at 1×, 2×, or 3× scale

## Regenerating the Static Pubmat

To re-render `pubmat.html` to `noir-pubmat.png`:

```bash
cd promo/pubmat
npm install          # first time only (installs Playwright)
npx playwright install chromium
node shoot.js
```

## Running the Editor Test

```bash
cd promo/pubmat
node test-editor.js
```

This spins up a local server, loads the editor, exercises text editing,
chip addition, accent/ratio switching, and PNG export, and reports any
console errors.

## Design Notes

The graphics use the Noir Wallet brand system (see `frontend/src/constants/designTokens.ts`):

- **Gold** `#C6A15B` (highlight `#E9C482`), **cream** `#EDE4D0`, noir black backgrounds
- **Jost** geometric sans for display type
- Solid headline fills (no gradient-on-text), asymmetric composition, dramatic type hierarchy — deliberately avoiding generic "AI slop" design tells.
