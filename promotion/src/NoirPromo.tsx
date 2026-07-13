import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { z } from "zod";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { X402 } from "./scenes/X402";
import { Architecture } from "./scenes/Architecture";
import { UseCases } from "./scenes/UseCases";
import { Outro } from "./scenes/Outro";

export const NoirPromoPropsSchema = z.object({
  sceneDurationsInFrames: z.array(z.number()),
});

const SCENE_AUDIO_FILES = [
  "voiceover/noir-promo/scene-01-intro.mp3",
  "voiceover/noir-promo/scene-02-problem.mp3",
  "voiceover/noir-promo/scene-03-x402.mp3",
  "voiceover/noir-promo/scene-04-architecture.mp3",
  "voiceover/noir-promo/scene-05-usecases.mp3",
  "voiceover/noir-promo/scene-06-outro.mp3",
];

const scenes = [
  { Component: Intro },
  { Component: Problem },
  { Component: X402 },
  { Component: Architecture },
  { Component: UseCases },
  { Component: Outro },
];

export const NoirPromo: React.FC<z.infer<typeof NoirPromoPropsSchema>> = ({
  sceneDurationsInFrames,
}) => {
  let offset = 0;

  return (
    <AbsoluteFill>
      {scenes.map(({ Component }, i) => {
        const duration = sceneDurationsInFrames[i];
        const start = offset;
        offset += duration;

        return (
          <Sequence key={i} from={start} durationInFrames={duration}>
            <Component />
            <Audio src={staticFile(SCENE_AUDIO_FILES[i])} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
