import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const ELEVENLABS_API_KEY = "1ab45543b6cb3044ffe18a88e9102b885fdbc0fe24ca3dae531c5d6631c23a81";

const VOICE_ID = "XrExE9yKIg1WjnnlVkGX";
const COMPOSITION_ID = "noir-promo";

interface Scene {
  id: string;
  text: string;
}

const SCENES: Scene[] = [
  {
    id: "scene-01-intro",
    text: "Noir Wallet. Contactless payments powered by Stellar.",
  },
  {
    id: "scene-02-problem",
    text: "No app opens. No confirmation needed. Just tap and go.",
  },
  {
    id: "scene-03-x402",
    text: "The x402 protocol debits your wallet instantly the moment you tap. Zero interaction. Zero friction.",
  },
  {
    id: "scene-04-architecture",
    text: "Tap any RFID sticker, NFC card, or wearable. The terminal reads your device UID, resolves your Stellar wallet, and executes the transfer in under two seconds.",
  },
  {
    id: "scene-05-usecases",
    text: "Built for high-throughput environments. Transit turnstiles, campus canteens, event gates, and retail checkout.",
  },
  {
    id: "scene-06-outro",
    text: "Noir Wallet. Tap the future.",
  },
];

const outputDir = resolve("public", "voiceover", COMPOSITION_ID);
mkdirSync(outputDir, { recursive: true });

async function generateAll() {
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
            stability: 0.4,
            similarity_boost: 0.8,
            style: 0.25,
          },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "no body");
      console.error(`Failed to generate ${scene.id}: ${response.status} ${response.statusText}\n  ${errBody}`);
      continue;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(outPath, audioBuffer);
    console.log(`✓ Generated ${scene.id}`);
  }

  console.log("Done!");
}

generateAll().catch(console.error);
