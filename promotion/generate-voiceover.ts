import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { SCENE_SCRIPT, SceneScript } from "./src/voiceover-script";

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

// Scene ids + TTS text come from the shared script (src/voiceover-script.ts).
const SCENES: SceneScript[] = SCENE_SCRIPT;

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
          text: scene.tts,
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
