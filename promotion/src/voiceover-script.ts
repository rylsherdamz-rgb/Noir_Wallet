/**
 * Shared demo script: TTS lines for ElevenLabs and on-screen subtitle text.
 * Keep ids in sync with DEMO_SCENES in src/NoirDemo.tsx.
 */
export interface SceneScript {
  id: string;
  /** Spoken narration (spelled-out words for the TTS). */
  tts: string;
  /** On-screen subtitle (human-readable). */
  subtitle: string;
}

export const SCENE_SCRIPT: SceneScript[] = [
  {
    id: "scene-03-welcome",
    tts: "Your wallet, your identity — linked to the N F C card in your hand.",
    subtitle: "Your wallet, your identity — linked to the NFC card in your hand.",
  },
  {
    id: "scene-04-dashboard",
    tts: "Every asset in one glance — plus your devices and their limits.",
    subtitle: "Every asset in one glance — plus your devices and their limits.",
  },
  {
    id: "scene-05-link",
    tts: "Tap the tag to your phone, sign once — and it's registered on-chain in seconds.",
    subtitle: "Tap the tag to your phone, sign once — it's registered on-chain in seconds.",
  },
  {
    id: "scene-06-agent",
    tts: "Fund each device with a balance and a daily limit — its agent pays on its own.",
    subtitle: "Fund each device with a balance and a daily limit — its agent pays on its own.",
  },
  {
    id: "scene-06b-revoke",
    tts: "Lose your tag? Revoke it in one tap — the balance flows right back.",
    subtitle: "Lose your tag? Revoke it in one tap — the balance flows right back.",
  },
  {
    id: "scene-07-tap",
    tts: "Now tap to pay — instant debit, no unlock, no confirmation.",
    subtitle: "Now tap to pay — instant debit, no unlock, no confirmation.",
  },
  {
    id: "scene-07b-escrow",
    tts: "The terminal authorizes instantly and queues each charge, then settles one transaction — even offline.",
    subtitle: "The terminal authorizes instantly and queues each charge, then settles one transaction — even offline.",
  },
  {
    id: "scene-08-send",
    tts: "Send pesos, U S D C, or Lumens across Stellar — for a fraction of a cent.",
    subtitle: "Send pesos, USDC, or Lumens across Stellar — for a fraction of a cent.",
  },
  {
    id: "scene-09-receive",
    tts: "Receiving is just a scan — one Q R code, and the money's in.",
    subtitle: "Receiving is just a scan — one QR code, and the money's in.",
  },
  {
    id: "scene-10-transactions",
    tts: "Every transaction, confirmed on Stellar in under two seconds.",
    subtitle: "Every transaction, confirmed on Stellar in under two seconds.",
  },
];
