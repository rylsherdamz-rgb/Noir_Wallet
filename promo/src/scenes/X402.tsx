import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
  Easing,
} from "remotion";

export const X402: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const protocolY = interpolate(frame, [0, fps * 0.5], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const lineOpacity = interpolate(frame, [fps * 0.5, fps * 1.0], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const pulse = interpolate(frame, [0, fps * 2], [1, 1.05], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <div
        style={{
          opacity,
          translate: `0px ${protocolY}px`,
        }}
      >
        <h2
          style={{
            fontFamily: "monospace",
            fontSize: 48,
            fontWeight: 700,
            color: "#C6A15B",
            margin: 0,
            textAlign: "center",
            scale: String(pulse),
          }}
        >
          x402 Protocol
        </h2>
      </div>
      <div
        style={{
          opacity: lineOpacity,
          marginTop: 32,
          maxWidth: 600,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            color: "#EDE4D0",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Hardware tap triggers instant wallet debit.
          <br />
          No unlock. No app. No confirmation.
        </p>
      </div>
      <div
        style={{
          opacity: lineOpacity,
          marginTop: 40,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#3ED598",
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            color: "#3ED598",
          }}
        >
          {"< 2 seconds"}
        </span>
      </div>
    </AbsoluteFill>
  );
};
