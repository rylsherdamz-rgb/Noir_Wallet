import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import {
  DEMO_FONT,
  G,
  LightBG,
  DarkBG,
  Kicker,
  Title,
  Body,
  Grad,
  Watermark,
  Particles,
  PulseRings,
  useReveal,
  useFloat,
  useSceneFade,
} from "../DemoShell";
import { withAlpha } from "../theme";

type SceneProps = { durationInFrames: number };

const LogoTile: React.FC<{ size?: number; delay?: number; floatAmp?: number }> = ({
  size = 132,
  delay = 0,
  floatAmp = 12,
}) => {
  const style = useReveal(delay, 30);
  const y = useFloat(floatAmp, 1.05);
  return (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      {/* perpetual NFC-style pulse rings behind the mark */}
      <PulseRings size={size * 1.7} count={3} thickness={2} />
      <div
        style={{
          ...style,
          transform: `${(style.transform as string) ?? ""} translateY(${y}px)`,
          width: size,
          height: size,
          borderRadius: size * 0.26,
          overflow: "hidden",
          boxShadow: `0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px ${withAlpha(G.gold, "55")}`,
        }}
      >
        <Img src={staticFile("logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
};

/* --------------------------------- Intro ---------------------------------- */
export const IntroScene: React.FC<SceneProps> = ({ durationInFrames }) => {
  const fade = useSceneFade(durationInFrames);
  const yTitle = useFloat(6, 0.7, 1);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <LightBG />
      <Particles count={16} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 34,
          padding: 120,
        }}
      >
        <LogoTile delay={2} />
        <Kicker delay={8}>Contactless payments · Stellar</Kicker>
        <div style={{ transform: `translateY(${yTitle}px)` }}>
          <Title delay={14} size={140} align="center">
            Noir Wallet
          </Title>
        </div>
        <Title delay={22} size={76} align="center">
          Tap. Pay. <Grad>Done.</Grad>
        </Title>
        <Body delay={32} size={34} align="center" maxWidth={860}>
          A wallet you never open. Payments that just happen.
        </Body>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  );
};

/* -------------------------------- Problem --------------------------------- */
export const ProblemScene: React.FC<SceneProps> = ({ durationInFrames }) => {
  const fade = useSceneFade(durationInFrames);
  const frame = useCurrentFrame();
  const items = [
    { c: G.red, t: "No app to open" },
    { c: G.yellow, t: "No screen to unlock" },
    { c: G.blue, t: "No confirmation to tap" },
  ];
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <LightBG />
      <Particles count={14} />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 130px", gap: 40 }}>
        <Kicker delay={2}>The friction problem</Kicker>
        <Title delay={8} size={104}>
          Paying should be <Grad>invisible.</Grad>
        </Title>
        <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
          {items.map((it, i) => {
            const s = interpolate(frame, [24 + i * 8, 42 + i * 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            // perpetual staggered float so pills never sit dead-still
            const floatY = Math.sin(frame / 22 + i * 1.1) * 6 * s;
            const glow = 0.5 + 0.5 * Math.sin(frame / 18 + i * 1.1);
            return (
              <div
                key={it.t}
                style={{
                  opacity: s,
                  transform: `translateY(${(1 - s) * 24 + floatY}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "18px 28px",
                  borderRadius: 999,
                  background: G.white,
                  border: `1px solid ${G.grey200}`,
                  boxShadow: "0 6px 20px rgba(60,64,67,0.10)",
                  fontFamily: DEMO_FONT,
                  fontSize: 27,
                  fontWeight: 600,
                  color: G.ink2,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: it.c,
                    boxShadow: `0 0 ${8 + glow * 10}px ${withAlpha(it.c, "aa")}`,
                  }}
                />
                {it.t}
              </div>
            );
          })}
        </div>
        <Body delay={52} size={32} maxWidth={900} align="left">
          Noir Wallet debits the moment your tag touches the terminal — powered by the x402 protocol.
        </Body>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  );
};

/* --------------------------------- Outro ---------------------------------- */
export const OutroScene: React.FC<SceneProps> = ({ durationInFrames }) => {
  const fade = useSceneFade(durationInFrames);
  const frame = useCurrentFrame();
  const chips = ["x402 Protocol", "Soroban", "Stellar", "PDAX Bridge"];
  // breathing glow on the CTA
  const breathe = 0.5 + 0.5 * Math.sin(frame / 16);
  const ctaScale = 1 + breathe * 0.02;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <DarkBG />
      <Particles count={22} dark />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 34, padding: 120 }}
      >
        <LogoTile delay={2} size={120} />
        <Title delay={10} size={128} dark align="center">
          Tap the <Grad>future.</Grad>
        </Title>
        <Body delay={20} size={34} dark align="center" maxWidth={860}>
          Zero-interaction payments, settled on Stellar in under two seconds.
        </Body>
        <div style={{ ...useReveal(30, 20), display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {chips.map((c, i) => {
            const chipY = Math.sin(frame / 20 + i * 0.9) * 5;
            return (
              <div
                key={c}
                style={{
                  transform: `translateY(${chipY}px)`,
                  padding: "12px 24px",
                  borderRadius: 999,
                  border: `1px solid ${withAlpha(G.gold, "44")}`,
                  background: withAlpha(G.gold, "12"),
                  fontFamily: DEMO_FONT,
                  fontSize: 24,
                  fontWeight: 600,
                  color: G.gold,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
        <div
          style={{
            ...useReveal(42, 18),
            marginTop: 18,
            padding: "20px 44px",
            borderRadius: 999,
            background: `linear-gradient(100deg, ${G.gold}, ${G.yellow})`,
            fontFamily: DEMO_FONT,
            fontSize: 30,
            fontWeight: 700,
            color: "#1a1400",
            transform: `scale(${ctaScale})`,
            boxShadow: `0 16px 40px ${withAlpha(G.gold, "55")}, 0 0 ${20 + breathe * 40}px ${withAlpha(G.gold, "55")}`,
          }}
        >
          Noir Wallet — Tap and go.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
