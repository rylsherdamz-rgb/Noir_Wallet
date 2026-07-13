import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { ProgressBar } from "./DemoShell";
import { IntroScene, ProblemScene, OutroScene } from "./demo-scenes/TitleScenes";
import {
  WelcomeScene,
  DashboardScene,
  LinkScene,
  AgentScene,
  SendScene,
  ReceiveScene,
  TransactionsScene,
} from "./demo-scenes/WalkthroughScenes";
import { TapToPayScene } from "./demo-scenes/TapToPayScene";

export const NoirDemoPropsSchema = z.object({
  sceneDurationsInFrames: z.array(z.number()),
});

/** Ordered scene list. Keep in sync with DEMO_FALLBACK_SECONDS (Root.tsx) and the voiceover script. */
export const DEMO_SCENES: {
  Component: React.FC<{ durationInFrames: number }>;
  audio: string;
}[] = [
  { Component: IntroScene, audio: "scene-01-intro" },
  { Component: ProblemScene, audio: "scene-02-problem" },
  { Component: WelcomeScene, audio: "scene-03-welcome" },
  { Component: DashboardScene, audio: "scene-04-dashboard" },
  { Component: LinkScene, audio: "scene-05-link" },
  { Component: AgentScene, audio: "scene-06-agent" },
  { Component: TapToPayScene, audio: "scene-07-tap" },
  { Component: SendScene, audio: "scene-08-send" },
  { Component: ReceiveScene, audio: "scene-09-receive" },
  { Component: TransactionsScene, audio: "scene-10-transactions" },
  { Component: OutroScene, audio: "scene-11-outro" },
];

export const DEMO_AUDIO_FILES = DEMO_SCENES.map((s) => `voiceover/noir-demo/${s.audio}.mp3`);

export const NoirDemo: React.FC<z.infer<typeof NoirDemoPropsSchema>> = ({
  sceneDurationsInFrames,
}) => {
  const frame = useCurrentFrame();
  const total = sceneDurationsInFrames.reduce((a, b) => a + b, 0) || 1;
  let offset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505" }}>
      {DEMO_SCENES.map(({ Component, audio }, i) => {
        const duration = sceneDurationsInFrames[i];
        const start = offset;
        offset += duration;
        return (
          <Sequence key={i} from={start} durationInFrames={duration}>
            <Component durationInFrames={duration} />
            <Audio src={staticFile(`voiceover/noir-demo/${audio}.mp3`)} />
          </Sequence>
        );
      })}
      <ProgressBar progress={frame / total} />
    </AbsoluteFill>
  );
};
