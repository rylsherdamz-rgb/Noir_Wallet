import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, withAlpha } from "../theme";
import { SceneShell } from "./SceneShell";
import { CatLogo } from "../components/CatLogo";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Scene 6 — "Noir Wallet. Tap the future."
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const logoScale = interpolate(frame, [0, 24], [0.7, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const logoOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const brandOpacity = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: "clamp" });
  const brandY = interpolate(frame, [12, 34], [20, 0], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const subOpacity = interpolate(frame, [26, 46], [0, 1], { extrapolateRight: "clamp" });
  const glow = interpolate(frame % 120, [0, 60, 120], [0.35, 0.7, 0.35]);

  return (
    <SceneShell>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: 130,
            background: Colors.gold,
            filter: "blur(90px)",
            opacity: glow * 0.4,
          }}
        />
        <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})` }}>
          <CatLogo size={120} />
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: Colors.cream,
            letterSpacing: 18,
            marginTop: 30,
            opacity: brandOpacity,
            transform: `translateY(${brandY}px)`,
            textShadow: `0 2px 16px ${withAlpha(Colors.gold, "50")}`,
          }}
        >
          NOIR
        </div>
        <div
          style={{
            fontSize: 24,
            color: Colors.gold,
            letterSpacing: 10,
            textTransform: "uppercase",
            fontWeight: 500,
            marginTop: 18,
            opacity: brandOpacity,
          }}
        >
          Tap Into Trust
        </div>
        <div
          style={{
            fontSize: 22,
            color: Colors.mutedWhite,
            marginTop: 28,
            opacity: subOpacity,
          }}
        >
          Tap the future.
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
