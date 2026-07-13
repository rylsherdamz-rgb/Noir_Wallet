# Noir Wallet — Promo

[![Noir Wallet Promo](./public/placeholder-banner.png)](https://noir-wallet.app)

> **x402** — Contactless payments powered by Stellar. No app opens. No confirmation. Just tap and go.

[![Remotion](https://img.shields.io/badge/built%20with-Remotion-blue?style=flat-square)](https://remotion.dev)
[![ElevenLabs](https://img.shields.io/badge/voice-ElevenLabs-black?style=flat-square)](https://elevenlabs.io)
[![Stellar](https://img.shields.io/badge/network-Stellar-7B1FA2?style=flat-square)](https://stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../LICENSE)

---

## Preview

https://github.com/user-attachments/assets/noir-wallet-promo.mp4

> **Note**: Render the video locally with `npx remotion render NoirPromo out/noir-promo.mp4` and replace the placeholder above.

---

## Video

This directory contains a Remotion-based promotional video for **Noir Wallet** — the zero-interaction contactless payment system.

### Scenes

| # | Scene | Duration | Voiceover |
|---|-------|----------|-----------|
| 1 | **Intro** — "Noir Wallet. Contactless payments powered by Stellar." | ~2s | Alice (ElevenLabs) |
| 2 | **Problem** — No app, no confirmation, just tap. | ~2.5s | Alice (ElevenLabs) |
| 3 | **x402 Protocol** — Instant wallet debit on hardware tap. | ~4s | Alice (ElevenLabs) |
| 4 | **Architecture** — RFID → Terminal → Stellar. | ~6s | Alice (ElevenLabs) |
| 5 | **Use Cases** — Transit, canteens, events, retail. | ~4s | Alice (ElevenLabs) |
| 6 | **Outro** — "Noir Wallet. Tap the future." | ~1.5s | Alice (ElevenLabs) |

### Voiceover

Generated with **ElevenLabs** using the **Alice** voice (female). Each scene's script is in [`generate-voiceover.ts`](./generate-voiceover.ts).

---

## Quickstart

```bash
# Install dependencies (already done)
npm install

# Generate voiceover (requires ElevenLabs API key in script)
npx tsx generate-voiceover.ts

# Start the Remotion Studio preview
npm run dev

# Render final MP4
npx remotion render NoirPromo out/noir-promo.mp4
```

### Requirements

- **Node.js** >= 18
- **ElevenLabs API key** (free tier works — uses Alice voice, a standard voice)

---

## Project Structure

```
promo/
├── public/
│   └── voiceover/
│       └── noir-promo/
│           ├── scene-01-intro.mp3
│           ├── scene-02-problem.mp3
│           ├── scene-03-x402.mp3
│           ├── scene-04-architecture.mp3
│           ├── scene-05-usecases.mp3
│           └── scene-06-outro.mp3
├── src/
│   ├── Root.tsx              # Composition registration + metadata
│   ├── NoirPromo.tsx         # Main composition with sequences
│   ├── get-audio-duration.ts # Utility for audio duration
│   ├── index.ts              # Entry point
│   ├── index.css             # Tailwind v4
│   └── scenes/
│       ├── Intro.tsx         # Scene 1 — Title + subtitle
│       ├── Problem.tsx       # Scene 2 — Three pain points
│       ├── X402.tsx          # Scene 3 — Protocol deep-dive
│       ├── Architecture.tsx  # Scene 4 — SVG flow diagram
│       ├── UseCases.tsx      # Scene 5 — Use case list
│       └── Outro.tsx         # Scene 6 — Closing title
├── generate-voiceover.ts     # ElevenLabs TTS generator
├── package.json
├── remotion.config.ts        # Remotion config
└── tsconfig.json
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Remotion](https://remotion.dev) | Video composition framework (React) |
| [ElevenLabs](https://elevenlabs.io) | AI voiceover — Alice (female voice) |
| [Tailwind v4](https://tailwindcss.com) | Styling |
| [Zod](https://zod.dev) | Runtime props validation |
| [TypeScript](https://typescriptlang.org) | Type safety |

---

## Embedding in Noir Wallet README

Once rendered, upload the video (e.g., to GitHub Assets or a CDN) and embed it in the main [`../README.md`](../README.md):

```markdown
[![Noir Wallet Promo](https://link-to-thumbnail.png)](https://link-to-video.mp4)
```

---

## License

MIT
