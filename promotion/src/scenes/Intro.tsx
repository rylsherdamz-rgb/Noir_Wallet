import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, withAlpha } from "../theme";
import { SceneShell, usePhoneEntrance } from "./SceneShell";
import { PhoneFrame } from "../components/PhoneFrame";
import { WelcomeApp } from "../app-screens/WelcomeApp";
import { CatLogo } from "../components/CatLogo";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Scene 1 — "Noir Wallet. Contactless payments powered by Stellar."
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const phone = usePhoneEntrance("right");

  const logoScale = interpolate(frame, [0, 26], [0.7, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const logoOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const brandOpacity = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: "clamp" });
  const brandY = interpolate(frame, [12, 34], [20, 0], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const subOpacity = interpolate(frame, [24, 44], [0, 1], { extrapolateRight: "clamp" });

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
        {/* Brand lockup */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})`, transformOrigin: "left" }}>
            <CatLogo size={96} />
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: Colors.cream,
              letterSpacing: 16,
              marginTop: 24,
              opacity: brandOpacity,
              transform: `translateY(${brandY}px)`,
              textShadow: `0 2px 12px ${withAlpha(Colors.gold, "40")}`,
            }}
          >
            NOIR
          </div>
          <div
            style={{
              fontSize: 18,
              color: Colors.gold,
              letterSpacing: 8,
              textTransform: "uppercase",
              fontWeight: 500,
              marginTop: 14,
              opacity: brandOpacity,
            }}
          >
            Tap Into Trust
          </div>
          <div
            style={{
              fontSize: 21,
              color: Colors.mutedWhite,
              marginTop: 26,
              maxWidth: 420,
              lineHeight: 1.5,
              opacity: subOpacity,
            }}
          >
            Contactless payments powered by Stellar.
          </div>
        </div>

        {/* Real app — Welcome screen */}
        <div style={phone}>
          <PhoneFrame height={600}>
            <WelcomeApp />
          </PhoneFrame>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
