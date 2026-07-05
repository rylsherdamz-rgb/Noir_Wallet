import "./index.css";
import { Composition, CalculateMetadataFunction, staticFile } from "remotion";
import { NoirPromo, NoirPromoPropsSchema } from "./NoirPromo";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { z } from "zod";

const FPS = 30;

const SCENE_AUDIO_FILES = [
  "voiceover/noir-promo/scene-01-intro.mp3",
  "voiceover/noir-promo/scene-02-problem.mp3",
  "voiceover/noir-promo/scene-03-x402.mp3",
  "voiceover/noir-promo/scene-04-architecture.mp3",
  "voiceover/noir-promo/scene-05-usecases.mp3",
  "voiceover/noir-promo/scene-06-outro.mp3",
];

const FALLBACK_DURATION = 3 * FPS;

type NoirPromoProps = z.infer<typeof NoirPromoPropsSchema>;

const calculateMetadata: CalculateMetadataFunction<NoirPromoProps> = async () => {
  try {
    const durations = await Promise.all(
      SCENE_AUDIO_FILES.map((file) =>
        getAudioDurationInSeconds(staticFile(file)).catch(() => FALLBACK_DURATION / FPS),
      ),
    );

    const sceneDurationsInFrames = durations.map((d) => Math.ceil(d * FPS));
    const totalFrames = sceneDurationsInFrames.reduce((sum, d) => sum + d, 0);

    return {
      durationInFrames: totalFrames,
      props: { sceneDurationsInFrames },
    };
  } catch {
    return {
      durationInFrames: SCENE_AUDIO_FILES.length * FALLBACK_DURATION,
      props: { sceneDurationsInFrames: SCENE_AUDIO_FILES.map(() => FALLBACK_DURATION) },
    };
  }
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NoirPromo"
      component={NoirPromo}
      fps={FPS}
      width={1280}
      height={720}
      durationInFrames={SCENE_AUDIO_FILES.length * FALLBACK_DURATION}
      defaultProps={{ sceneDurationsInFrames: SCENE_AUDIO_FILES.map(() => FALLBACK_DURATION) }}
      calculateMetadata={calculateMetadata}
      schema={NoirPromoPropsSchema}
    />
  );
};
