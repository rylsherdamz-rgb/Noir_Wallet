import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
  Easing,
} from "remotion";

const cases = [
  "🚇 Transit Turnstiles",
  "🍽️ Campus Canteens",
  "🎟️ Event Gates",
  "🛒 Retail Checkout",
];

export const UseCases: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 20,
          color: "#A9A9A9",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: titleOpacity,
          margin: 0,
          marginBottom: 48,
        }}
      >
        Built for High-Throughput Environments
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {cases.map((item, i) => {
          const itemOpacity = interpolate(
            frame,
            [fps * 0.3 + i * fps * 0.25, fps * 0.6 + i * fps * 0.25],
            [0, 1],
            { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
          );
          const itemX = interpolate(
            frame,
            [fps * 0.3 + i * fps * 0.25, fps * 0.6 + i * fps * 0.25],
            [-30, 0],
            { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
          );

          return (
            <div
              key={item}
              style={{
                opacity: itemOpacity,
                translate: `${itemX}px 0px`,
              }}
            >
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 28,
                  color: "#EDE4D0",
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
