import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from "remotion";
import { Colors, withAlpha } from "./theme";

/* ------------------------------------------------------------------ *
 * Google-flavoured design language
 * A clean, premium keynote look: Product Sans-like type, generous
 * whitespace, soft Material motion, the four Google accent colors used
 * sparingly, and the Noir brand gold as the primary accent.
 * ------------------------------------------------------------------ */

export const DEMO_FONT =
  "'Google Sans','Product Sans','Roboto','Helvetica Neue',system-ui,-apple-system,'Segoe UI',sans-serif";

export const G = {
  // Google surface neutrals
  white: "#FFFFFF",
  grey50: "#F8F9FA",
  grey100: "#F1F3F4",
  grey200: "#E8EAED",
  ink: "#202124",
  ink2: "#3C4043",
  slate: "#5F6368",
  // Google brand accents
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC05",
  green: "#34A853",
  // Noir brand
  gold: Colors.gold,
  black: Colors.black,
} as const;

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

/** Scene-level fade envelope so cuts feel like soft Material cross-dissolves. */
export const useSceneFade = (durationInFrames: number, fadeFrames = 12) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

/** Spring-based reveal helper (opacity + translateY). */
export const useReveal = (delay = 0, distance = 34) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.7 },
  });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
  } as React.CSSProperties;
};

/* -------------------------------- Backgrounds ------------------------------- */

/** Bright, airy Google-style backdrop with soft drifting color orbs. */
export const LightBG: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (a: number, b: number) =>
    interpolate(frame % 300, [0, 150, 300], [a, b, a], { easing: Easing.inOut(Easing.ease) });
  const orb = (color: string, x: number, y: number, size: number, o: string) => (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${withAlpha(color, o)}, transparent 70%)`,
        filter: "blur(20px)",
        transform: "translate(-50%,-50%)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: G.grey50 }}>
      {orb(G.blue, drift(18, 22), 24, 720, "22")}
      {orb(G.gold, drift(82, 78), 30, 760, "30")}
      {orb(G.red, 70, drift(78, 82), 560, "14")}
      {orb(G.green, 26, drift(82, 78), 560, "12")}
    </AbsoluteFill>
  );
};

/** Deep noir stage backdrop for device walkthrough scenes. */
export const DarkBG: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % 240, [0, 120, 240], [0.35, 0.6, 0.35], {
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, ${withAlpha(
            G.gold,
            "22",
          )}, transparent 55%)`,
          opacity: pulse,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${withAlpha(G.gold, "0A")} 1px, transparent 1px), linear-gradient(90deg, ${withAlpha(G.gold, "0A")} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* -------------------------------- Typography -------------------------------- */

export const Kicker: React.FC<{ children: React.ReactNode; delay?: number; dark?: boolean }> = ({
  children,
  delay = 0,
  dark = false,
}) => {
  const style = useReveal(delay, 18);
  return (
    <div
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        borderRadius: 999,
        background: dark ? withAlpha(G.gold, "1A") : G.white,
        border: `1px solid ${dark ? withAlpha(G.gold, "3A") : G.grey200}`,
        boxShadow: dark ? "none" : "0 2px 10px rgba(60,64,67,0.08)",
        fontFamily: DEMO_FONT,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 0.4,
        color: dark ? G.gold : G.ink2,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: G.gold,
          boxShadow: `0 0 12px ${G.gold}`,
        }}
      />
      {children}
    </div>
  );
};

export const Title: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  dark?: boolean;
  align?: "left" | "center";
}> = ({ children, delay = 0, size = 96, dark = false, align = "left" }) => {
  const style = useReveal(delay, 40);
  return (
    <div
      style={{
        ...style,
        fontFamily: DEMO_FONT,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1.04,
        letterSpacing: -2,
        color: dark ? G.white : G.ink,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
};

export const Body: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  dark?: boolean;
  align?: "left" | "center";
  maxWidth?: number;
}> = ({ children, delay = 0, size = 30, dark = false, align = "left", maxWidth = 720 }) => {
  const style = useReveal(delay, 24);
  return (
    <div
      style={{
        ...style,
        fontFamily: DEMO_FONT,
        fontSize: size,
        fontWeight: 400,
        lineHeight: 1.5,
        color: dark ? G.grey200 : G.slate,
        textAlign: align,
        maxWidth,
        marginLeft: align === "center" ? "auto" : undefined,
        marginRight: align === "center" ? "auto" : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Gradient word used to highlight a single phrase — with a continuous shimmer sweep. */
export const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const pos = (frame * 1.6) % 200; // continuous left→right sweep
  return (
    <span
      style={{
        background: `linear-gradient(100deg, ${G.gold} 0%, ${G.yellow} 30%, #fff6df 50%, ${G.yellow} 70%, ${G.gold} 100%)`,
        backgroundSize: "200% 100%",
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
};

/** Gentle perpetual float (sine) for keeping foreground elements alive. */
export const useFloat = (ampPx = 10, speed = 1, phase = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.sin((frame / fps) * speed + phase) * ampPx;
};

/**
 * Drifting ambient particles — keeps "empty" areas of a scene alive so there is
 * no dead air on scenes without a device on screen.
 */
export const Particles: React.FC<{ count?: number; dark?: boolean }> = ({
  count = 18,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const seed = i * 47.13;
        const baseX = ((Math.sin(seed) * 0.5 + 0.5) * width) | 0;
        const speed = 0.08 + ((i % 5) / 5) * 0.12;
        const yRaw = height + 60 - ((t * speed * height + (i * height) / count) % (height + 120));
        const drift = Math.sin(t * 0.6 + seed) * 40;
        const size = 3 + (i % 4);
        const twinkle = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.4 + seed));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: baseX + drift,
              top: yRaw,
              width: size,
              height: size,
              borderRadius: "50%",
              background: dark ? G.gold : G.gold,
              opacity: dark ? twinkle : twinkle * 0.5,
              boxShadow: `0 0 ${size * 2}px ${withAlpha(G.gold, "88")}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Concentric pulse rings (NFC/tap motif) that loop forever. */
export const PulseRings: React.FC<{
  size?: number;
  color?: string;
  count?: number;
  thickness?: number;
}> = ({ size = 360, color = G.gold, count = 3, thickness = 2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = fps * 2.4;
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      {Array.from({ length: count }).map((_, i) => {
        const p = ((frame + (i * period) / count) % period) / period;
        const scale = interpolate(p, [0, 1], [0.4, 1.8]);
        const opacity = interpolate(p, [0, 0.1, 1], [0, 0.5, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `${thickness}px solid ${color}`,
              transform: `scale(${scale})`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------------------------- Lower-third caption --------------------------- */

/** Synced caption for device walkthrough scenes. */
export const Caption: React.FC<{
  step: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  delay?: number;
}> = ({ step, title, body, delay = 6 }) => {
  const style = useReveal(delay, 30);
  return (
    <div
      style={{
        ...style,
        position: "absolute",
        left: 96,
        top: "50%",
        transform: `translateY(-50%) ${(style.transform as string) ?? ""}`,
        maxWidth: 560,
      }}
    >
      <div
        style={{
          fontFamily: DEMO_FONT,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: G.gold,
          marginBottom: 18,
        }}
      >
        {step}
      </div>
      <div
        style={{
          fontFamily: DEMO_FONT,
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -1.5,
          color: G.white,
        }}
      >
        {title}
      </div>
      {body ? (
        <div
          style={{
            fontFamily: DEMO_FONT,
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.5,
            color: G.grey200,
            marginTop: 24,
          }}
        >
          {body}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------- Phone stage -------------------------------- */

/**
 * Presents a phone with a Material entrance + gentle float.
 * `align` controls where the device sits so captions can share the frame.
 */
export const PhoneStage: React.FC<{
  children: React.ReactNode;
  align?: "center" | "right";
  height?: number;
}> = ({ children, align = "center", height = 880 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.9 } });
  const y = interpolate(enter, [0, 1], [90, 0]);
  const scale = interpolate(enter, [0, 1], [0.92, 1]);
  const float = Math.sin((frame / fps) * 1.1) * 8;
  const glowScale = interpolate(enter, [0, 1], [0.7, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: align === "right" ? "flex-end" : "center",
        paddingRight: align === "right" ? 150 : 0,
      }}
    >
      <div
        style={{
          position: "relative",
          opacity: enter,
          transform: `translateY(${y + float}px) scale(${scale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -80,
            background: `radial-gradient(circle, ${withAlpha(G.gold, "2E")}, transparent 68%)`,
            filter: "blur(30px)",
            transform: `scale(${glowScale})`,
          }}
        />
        <PhoneShell height={height}>{children}</PhoneShell>
      </div>
    </AbsoluteFill>
  );
};

/* Local premium phone bezel (larger, glossier variant of the app PhoneFrame). */
const PhoneShell: React.FC<{ children: React.ReactNode; height: number }> = ({
  children,
  height,
}) => {
  const width = Math.round((height * 9) / 19.5);
  const bezel = Math.round(height * 0.011);
  const radius = Math.round(height * 0.058);
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(155deg, #3a3a3a, #0a0a0a 55%, #000)",
        padding: bezel,
        boxShadow:
          "0 60px 120px rgba(0,0,0,0.75), 0 0 0 2px rgba(198,161,91,0.28), inset 0 0 3px rgba(255,255,255,0.22)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          overflow: "hidden",
          backgroundColor: G.black,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 46,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            fontFamily: DEMO_FONT,
            fontSize: 16,
            fontWeight: 600,
            color: G.white,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>••••  5G  ▮</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 11,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.34,
            height: 30,
            borderRadius: 16,
            backgroundColor: "#000",
            zIndex: 30,
          }}
        />
        <div style={{ position: "absolute", inset: 0, paddingTop: 46 }}>{children}</div>
        <div
          style={{
            position: "absolute",
            bottom: 11,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.32,
            height: 6,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.55)",
            zIndex: 20,
          }}
        />
      </div>
    </div>
  );
};

/* ------------------------------ Global chrome ------------------------------- */

/** Thin brand progress bar pinned to the top across the whole film. */
export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, zIndex: 100 }}>
    <div
      style={{
        height: "100%",
        width: `${Math.min(100, Math.max(0, progress * 100))}%`,
        background: `linear-gradient(90deg, ${G.gold}, ${G.yellow})`,
        boxShadow: `0 0 12px ${withAlpha(G.gold, "88")}`,
      }}
    />
  </div>
);

/** Small persistent product wordmark, keynote lower/upper corner. */
export const Watermark: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <div
    style={{
      position: "absolute",
      bottom: 46,
      right: 64,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: DEMO_FONT,
      zIndex: 90,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        background: `linear-gradient(140deg, ${G.gold}, ${G.yellow})`,
        boxShadow: `0 0 16px ${withAlpha(G.gold, "66")}`,
      }}
    />
    <span style={{ fontSize: 22, fontWeight: 700, color: dark ? G.white : G.ink, letterSpacing: -0.4 }}>
      Noir&nbsp;Wallet
    </span>
  </div>
);
