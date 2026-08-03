import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

/**
 * Generates the ElevenLabs voiceover for the NoirDemo composition.
 * Run:  npm run voiceover
 * Output: public/voiceover/noir-demo/<scene>.mp3
 *
 * The API key can be overridden via the ELEVENLABS_API_KEY env var.
 */

const ELEVENLABS_API_KEY: string = process.env.ELEVENLABS_API_KEY ?? "";
if (!ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY env var must be set");
  process.exit(1);
}

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "XrExE9yKIg1WjnnlVkGX";
const COMPOSITION_ID = "noir-demo";

interface Scene {
  id: string;
  text: string;
}

// Order + ids MUST match DEMO_SCENES in src/NoirDemo.tsx
// Demo-only narration: tight and descriptive, ~45s total (intro/problem/outro dropped).
const SCENES: Scene[] = [
  {
    id: "scene-03-welcome",
    text: "Your wallet, your identity — linked to the N F C card in your hand.",
  },
  {
    id: "scene-04-dashboard",
    text: "Every asset in one glance — plus your devices and their limits.",
  },
  {
    id: "scene-05-link",
    text: "Tap the tag to your phone, sign once — and it's registered on-chain in seconds.",
  },
  {
    id: "scene-06-agent",
    text: "Fund each device with a balance and a daily limit — its agent pays on its own.",
  },
  {
    id: "scene-06b-revoke",
    text: "Lose your tag? Revoke it in one tap — the balance flows right back.",
  },
  {
    id: "scene-07-tap",
    text: "Now tap to pay — instant debit, no unlock, no confirmation.",
  },
  {
    id: "scene-07b-escrow",
    text: "The terminal authorizes instantly and queues each charge, then settles one transaction — even offline.",
  },
  {
    id: "scene-08-send",
    text: "Send pesos, U S D C, or Lumens across Stellar — for a fraction of a cent.",
  },
  {
    id: "scene-09-receive",
    text: "Receiving is just a scan — one Q R code, and the money's in.",
  },
  {
    id: "scene-10-transactions",
    text: "Every transaction, confirmed on Stellar in under two seconds.",
  },
];

const outputDir = resolve("public", "voiceover", COMPOSITION_ID);
mkdirSync(outputDir, { recursive: true });

async function generateAll() {
  let ok = 0;
  for (const scene of SCENES) {
    const outPath = resolve(outputDir, `${scene.id}.mp3`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: scene.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "no body");
      console.error(
        `✗ ${scene.id}: ${response.status} ${response.statusText}\n  ${errBody}`,
      );
      continue;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(outPath, audioBuffer);
    ok += 1;
    console.log(`✓ Generated ${scene.id}`);
  }

  console.log(`\nDone — ${ok}/${SCENES.length} clips written to ${outputDir}`);
}

generateAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
