import "./index.css";
import { Composition, CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { z } from "zod";
import { NoirDemo, NoirDemoPropsSchema, DEMO_AUDIO_FILES } from "./NoirDemo";
import { NoirPromo, NoirPromoPropsSchema } from "./NoirPromo";

const FPS = 30;

/** Per-scene fallback lengths (seconds) used when voiceover audio is absent. */
const DEMO_FALLBACK_SECONDS = [5, 5, 5, 5.5, 4, 4.5, 6.5, 4, 3.5, 4];

/** Target total length: exactly 50 seconds (demo-only cut). */
const TARGET_TOTAL_FRAMES = 50 * FPS;

/** Seconds of visual tail added after each clip's narration ends. */
const SCENE_PAD_SECONDS = 0.2;

type NoirDemoProps = z.infer<typeof NoirDemoPropsSchema>;

const demoFallbackFrames = DEMO_FALLBACK_SECONDS.map((s) => Math.round(s * FPS));

const calculateDemoMetadata: CalculateMetadataFunction<NoirDemoProps> = async () => {
  let usedFallback = false;

  const durations = await Promise.all(
    DEMO_AUDIO_FILES.map((file, i) =>
      getAudioDurationInSeconds(staticFile(file)).catch(() => {
        usedFallback = true;
        return DEMO_FALLBACK_SECONDS[i];
      }),
    ),
  );

  // Narration length per scene.
  const narrationFrames = durations.map((d) => Math.ceil(d * FPS));
  // pad each clip so the visual breathes slightly after the narration
  const sceneDurationsInFrames = narrationFrames.map((n) => n + Math.round(SCENE_PAD_SECONDS * FPS));

  // Normalize the total to exactly TARGET_TOTAL_FRAMES. Trim the first demo
  // scene first, then the scene with the most breathing room; if short, let
  // the last scene (transactions) linger as an end card.
  if (!usedFallback) {
    let diff = sceneDurationsInFrames.reduce((a, b) => a + b, 0) - TARGET_TOTAL_FRAMES;
    while (diff > 0) {
      const idx =
        sceneDurationsInFrames[0] > narrationFrames[0] + 2
          ? 0
          : sceneDurationsInFrames
              .map((d, i) => d - narrationFrames[i])
              .reduce((best, pad, i, arr) => (pad > arr[best] ? i : best), 0);
      sceneDurationsInFrames[idx]--;
      diff--;
    }
    if (diff < 0) {
      sceneDurationsInFrames[sceneDurationsInFrames.length - 1] += -diff;
    }
  }

  const totalFrames = sceneDurationsInFrames.reduce((sum, d) => sum + d, 0);

  return {
    durationInFrames: totalFrames,
    props: { sceneDurationsInFrames },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NoirDemo"
        component={NoirDemo}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={demoFallbackFrames.reduce((a, b) => a + b, 0)}
        defaultProps={{ sceneDurationsInFrames: demoFallbackFrames }}
        calculateMetadata={calculateDemoMetadata}
        schema={NoirDemoPropsSchema}
      />

      {/* Original narrated promo (kept for reference) */}
      <Composition
        id="NoirPromo"
        component={NoirPromo}
        fps={FPS}
        width={1280}
        height={720}
        durationInFrames={6 * 3 * FPS}
        defaultProps={{ sceneDurationsInFrames: Array(6).fill(3 * FPS) }}
        schema={NoirPromoPropsSchema}
      />
    </>
  );
};
