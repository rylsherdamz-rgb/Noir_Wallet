import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, FONT_SANS, withAlpha } from "../theme";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Shared black + gold-glow background used by every scene. */
export const SceneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: Colors.black, fontFamily: FONT_SANS }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 40%, ${withAlpha(
          Colors.gold,
          "12",
        )}, transparent 60%)`,
      }}
    />
    {children}
  </AbsoluteFill>
);

/** Small uppercase eyebrow label (muted). */
export const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontSize: 16,
        color: Colors.gold,
        letterSpacing: 4,
        textTransform: "uppercase",
        fontWeight: 600,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

/** Headline text that fades + slides up. */
export const Headline: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
}> = ({ children, delay = 0, size = 46 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [delay, delay + 24], [24, 0], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <div
      style={{
        fontSize: size,
        color: Colors.cream,
        fontWeight: 800,
        lineHeight: 1.1,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Supporting paragraph text. */
export const Sub: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontSize: 20,
        color: Colors.mutedWhite,
        lineHeight: 1.5,
        maxWidth: 460,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Slides a phone in from the given side.
 * Returns a style object to spread onto the phone wrapper.
 */
export const usePhoneEntrance = (from: "left" | "right" | "bottom" = "right") => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const dist = 80;
  const tx = from === "left" ? -dist * (1 - p) : from === "right" ? dist * (1 - p) : 0;
  const ty = from === "bottom" ? dist * (1 - p) : 0;
  return {
    opacity: p,
    transform: `translate(${tx}px, ${ty}px)`,
  } as React.CSSProperties;
};
