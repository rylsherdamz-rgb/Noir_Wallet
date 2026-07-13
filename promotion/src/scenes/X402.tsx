import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, withAlpha, FONT_MONO } from "../theme";
import { SceneShell, Eyebrow, usePhoneEntrance } from "./SceneShell";
import { PhoneFrame } from "../components/PhoneFrame";
import { AgentsApp } from "../app-screens/AgentsApp";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Scene 3 — "The x402 protocol debits your wallet instantly the moment you tap."
// Shows the real Agents screen: autonomous agent wallets with spend budgets.
export const X402: React.FC = () => {
  const frame = useCurrentFrame();
  const phone = usePhoneEntrance("right");

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 24], [20, 0], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const badgeOpacity = interpolate(frame, [30, 46], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 90,
        }}
      >
        {/* Copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 460 }}>
          <Eyebrow>The x402 Protocol</Eyebrow>
          <div
            style={{
              fontSize: 50,
              fontWeight: 800,
              color: Colors.cream,
              lineHeight: 1.1,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
            }}
          >
            Agents that pay the instant you tap.
          </div>
          <div style={{ fontSize: 20, color: Colors.mutedWhite, lineHeight: 1.5, opacity: titleOpacity }}>
            Each device gets its own x402 agent wallet with a spending budget. It
            signs automatically — no unlock, no app, no confirmation.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              opacity: badgeOpacity,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 6, background: Colors.success }} />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 20,
                color: Colors.success,
                fontWeight: 600,
              }}
            >
              settled in &lt; 2 seconds
            </span>
          </div>
        </div>

        {/* Real app — Agents */}
        <div style={{ ...phone, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -30,
              borderRadius: 60,
              background: withAlpha(Colors.gold, "10"),
              filter: "blur(40px)",
            }}
          />
          <PhoneFrame height={600}>
            <AgentsApp />
          </PhoneFrame>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
