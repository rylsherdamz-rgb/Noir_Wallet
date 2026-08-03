import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { ProgressBar } from "./DemoShell";
import {
  WelcomeScene,
  DashboardScene,
  AgentScene,
  RevokeScene,
  SendScene,
  ReceiveScene,
  TransactionsScene,
} from "./demo-scenes/WalkthroughScenes";
import { NfcTagScene } from "./demo-scenes/NfcTagScene";
import { TapToPayScene } from "./demo-scenes/TapToPayScene";
import { PosEscrowScene } from "./demo-scenes/PosEscrowScene";

export const NoirDemoPropsSchema = z.object({
  sceneDurationsInFrames: z.array(z.number()),
});

/** Ordered scene list. Keep in sync with DEMO_FALLBACK_SECONDS (Root.tsx) and the voiceover script. */
export const DEMO_SCENES: {
  Component: React.FC<{ durationInFrames: number }>;
  audio: string;
}[] = [
  { Component: WelcomeScene, audio: "scene-03-welcome" },
  { Component: DashboardScene, audio: "scene-04-dashboard" },
  { Component: NfcTagScene, audio: "scene-05-link" },
  { Component: AgentScene, audio: "scene-06-agent" },
  { Component: RevokeScene, audio: "scene-06b-revoke" },
  { Component: TapToPayScene, audio: "scene-07-tap" },
  { Component: PosEscrowScene, audio: "scene-07b-escrow" },
  { Component: SendScene, audio: "scene-08-send" },
  { Component: ReceiveScene, audio: "scene-09-receive" },
  { Component: TransactionsScene, audio: "scene-10-transactions" },
];

export const DEMO_AUDIO_FILES = DEMO_SCENES.map(
  (s) => `voiceover/noir-demo/${s.audio}.mp3`,
);

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
          <Sequence
            key={i}
            from={start}
            durationInFrames={duration}
            style={{
              translate: "-1px 0px",
            }}
          >
            <Component durationInFrames={duration} />
            <Audio src={staticFile(`voiceover/noir-demo/${audio}.mp3`)} />
          </Sequence>
        );
      })}
      <ProgressBar progress={frame / total} />
    </AbsoluteFill>
  );
};
