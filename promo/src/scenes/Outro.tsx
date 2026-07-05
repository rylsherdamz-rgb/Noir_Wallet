import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
  Easing,
} from "remotion";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale = interpolate(frame, [0, fps * 0.8], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const subOpacity = interpolate(frame, [fps * 0.4, fps * 0.9], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <div
        style={{
          opacity,
          scale: String(scale),
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
      <div style={{ opacity: subOpacity, marginTop: 24 }}>
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
          Tap the Future
        </p>
      </div>
    </AbsoluteFill>
  );
};
