import React from "react";
import { AbsoluteFill } from "remotion";
import { DarkBG, PhoneStage, Caption, Watermark, useSceneFade } from "../DemoShell";
import { WelcomeApp } from "../app-screens/WelcomeApp";
import { DashboardApp } from "../app-screens/DashboardApp";
import { DevicesApp } from "../app-screens/DevicesApp";
import { AgentsApp } from "../app-screens/AgentsApp";
import { SendApp } from "../app-screens/SendApp";
import { ReceiveApp } from "../app-screens/ReceiveApp";
import { TransactionsApp } from "../app-screens/TransactionsApp";

type SceneProps = { durationInFrames: number };

/** Shared layout: caption on the left, live app screen in a phone on the right. */
const Walk: React.FC<{
  durationInFrames: number;
  step: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  children: React.ReactNode;
}> = ({ durationInFrames, step, title, body, children }) => {
  const fade = useSceneFade(durationInFrames);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <DarkBG />
      <Caption step={step} title={title} body={body} />
      <PhoneStage align="right" height={860}>
        {children}
      </PhoneStage>
      <Watermark dark />
    </AbsoluteFill>
  );
};

export const WelcomeScene: React.FC<SceneProps> = ({ durationInFrames }) => (
  <Walk
    durationInFrames={durationInFrames}
    step="01 · Welcome"
    title={<>Your wallet is your identity.</>}
    body="Link an NFC card, sticker, or wearable — and you're ready to pay."
  >
    <WelcomeApp />
  </Walk>
);

export const DashboardScene: React.FC<SceneProps> = ({ durationInFrames }) => (
  <Walk
    durationInFrames={durationInFrames}
    step="02 · Dashboard"
    title={<>Every asset, one glance.</>}
    body="PHP, USDC and XLM balances update live — with per-device wallet limits."
  >
    <DashboardApp />
  </Walk>
);

export const LinkScene: React.FC<SceneProps> = ({ durationInFrames }) => (
  <Walk
    durationInFrames={durationInFrames}
    step="03 · Link device"
    title={<>Provision in seconds.</>}
    body="Hold your tag to the phone. You sign once — Soroban registers it on-chain."
  >
    <DevicesApp />
  </Walk>
);

export const AgentScene: React.FC<SceneProps> = ({ durationInFrames }) => (
  <Walk
    durationInFrames={durationInFrames}
    step="04 · x402 Agent"
    title={<>Fund it once. It pays for you.</>}
    body="Each device gets its own x402 agent — a dedicated wallet you top up with a balance and a daily limit. It signs every tap, so your main funds stay untouched."
  >
    <AgentsApp />
  </Walk>
);

export const SendScene: React.FC<SceneProps> = ({ durationInFrames }) => (
  <Walk
    durationInFrames={durationInFrames}
    step="05 · Send"
    title={<>Send on Stellar.</>}
    body="Low-cost transfers in USDC, XLM or PHP — settled in seconds."
  >
    <SendApp />
  </Walk>
);

export const ReceiveScene: React.FC<SceneProps> = ({ durationInFrames }) => (
  <Walk
    durationInFrames={durationInFrames}
    step="06 · Receive"
    title={<>Get paid instantly.</>}
    body="Share a QR to receive any supported asset, straight to your wallet."
  >
    <ReceiveApp />
  </Walk>
);

export const TransactionsScene: React.FC<SceneProps> = ({ durationInFrames }) => (
  <Walk
    durationInFrames={durationInFrames}
    step="07 · History"
    title={<>Every tap, on record.</>}
    body="Transit, canteens, event gates, retail — each payment confirmed on Stellar."
  >
    <TransactionsApp />
  </Walk>
);
