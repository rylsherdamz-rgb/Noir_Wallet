import "./index.css";
import { Composition, CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { z } from "zod";
import { NoirDemo, NoirDemoPropsSchema, DEMO_AUDIO_FILES } from "./NoirDemo";
import { NoirPromo, NoirPromoPropsSchema } from "./NoirPromo";

const FPS = 30;

/** Per-scene fallback lengths (seconds) used when voiceover audio is absent. */
const DEMO_FALLBACK_SECONDS = [6, 7, 6, 6, 7, 7.5, 8.5, 5.5, 5.5, 6, 7];

type NoirDemoProps = z.infer<typeof NoirDemoPropsSchema>;

const demoFallbackFrames = DEMO_FALLBACK_SECONDS.map((s) => Math.round(s * FPS));

const calculateDemoMetadata: CalculateMetadataFunction<NoirDemoProps> = async () => {
  const durations = await Promise.all(
    DEMO_AUDIO_FILES.map((file, i) =>
      getAudioDurationInSeconds(staticFile(file))
        // pad each clip so the visual breathes slightly after the narration
        .then((d) => d + 0.6)
        .catch(() => DEMO_FALLBACK_SECONDS[i]),
    ),
  );

  const sceneDurationsInFrames = durations.map((d) => Math.ceil(d * FPS));
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
