import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

/**
 * Generates the ElevenLabs voiceover for the NoirDemo composition.
 * Run:  npm run voiceover
 * Output: public/voiceover/noir-demo/<scene>.mp3
 *
 * The API key can be overridden via the ELEVENLABS_API_KEY env var.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
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
const SCENES: Scene[] = [
  {
    id: "scene-01-intro",
    text: "This is Noir Wallet. Contactless payments powered by Stellar. Tap, pay, done.",
  },
  {
    id: "scene-02-problem",
    text: "Paying should be invisible. No app to open, no screen to unlock, no confirmation to tap. Noir debits the instant your tag touches the terminal.",
  },
  {
    id: "scene-03-welcome",
    text: "It starts here. Your wallet becomes your identity — linked to an N F C card, a sticker, or a wearable.",
  },
  {
    id: "scene-04-dashboard",
    text: "Every asset in one glance. Your Philippine peso, U S D C, and Stellar Lumens balances, all live, with independent limits for every linked device.",
  },
  {
    id: "scene-05-link",
    text: "Linking a device takes seconds. Hold your tag to the phone, sign once, and the Soroban smart contract registers it on-chain.",
  },
  {
    id: "scene-06-agent",
    text: "Here's the key idea. Every device gets its own x402 agent — a dedicated wallet you fund with a balance and a daily limit. The agent pays on your behalf, so you can tap contactlessly without friction, and your main wallet stays untouched.",
  },
  {
    id: "scene-07-tap",
    text: "And this is the x402 moment. One tap, and the agent is debited instantly. No unlock. No app. No confirmation. Just pay and go.",
  },
  {
    id: "scene-08-send",
    text: "Send value across Stellar in U S D C, Lumens, or pesos — with fees that are a fraction of a cent.",
  },
  {
    id: "scene-09-receive",
    text: "Receiving is just as simple. Share a Q R code and get paid straight to your wallet.",
  },
  {
    id: "scene-10-transactions",
    text: "Transit turnstiles, campus canteens, event gates, retail checkout — every tap confirmed on Stellar in under two seconds.",
  },
  {
    id: "scene-11-outro",
    text: "Noir Wallet. Tap the future.",
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
