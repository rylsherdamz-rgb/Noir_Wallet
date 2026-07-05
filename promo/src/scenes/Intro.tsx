import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Easing } from "remotion";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const titleY = interpolate(frame, [0, fps], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const subtitleOpacity = interpolate(frame, [fps * 0.6, fps * 1.2], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <div
        style={{
          opacity: titleOpacity,
          translate: `0px ${titleY}px`,
        }}
      >
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 72,
            fontWeight: 700,
            color: "#C6A15B",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          Noir Wallet
        </h1>
      </div>
      <div style={{ opacity: subtitleOpacity, marginTop: 24 }}>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 28,
            color: "#EDE4D0",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Contactless Payments Powered by Stellar
        </p>
      </div>
    </AbsoluteFill>
  );
};
