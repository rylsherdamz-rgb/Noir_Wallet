import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DEMO_FONT } from "../DemoShell";
import { withAlpha } from "../theme";

type SubtitleProps = {
  text: string;
  durationInFrames: number;
};

/**
 * Bottom-center subtitle pill. Sits at y ≈ 1000–1050 so it never covers the
 * left captions, the phone/terminal stages, the bottom-right watermark, or
 * the top progress bar.
 */
export const Subtitle: React.FC<SubtitleProps> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [10, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames - 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 42,
        pointerEvents: "none",
        zIndex: 80,
      }}
    >
      <div
        style={{
          opacity,
          maxWidth: 1000,
          textAlign: "center",
          background: withAlpha("#0a0a0a", "A8"),
          border: `1px solid ${withAlpha("#ffffff", "1A")}`,
          borderRadius: 14,
          padding: "10px 26px",
          fontFamily: DEMO_FONT,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: 0.2,
          lineHeight: 1.35,
          color: "#ffffff",
          boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
