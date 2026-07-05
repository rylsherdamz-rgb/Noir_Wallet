import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Easing } from "remotion";

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = (start: number) =>
    interpolate(frame, [start, start + fps * 0.6], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

  const slideUp = (start: number) =>
    interpolate(frame, [start, start + fps * 0.6], [30, 0], {
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

  const items = [
    { icon: "📱", text: "No App Opens", start: 0 },
    { icon: "✅", text: "No Confirmation Needed", start: fps * 0.5 },
    { icon: "⚡", text: "Just Tap & Go", start: fps * 1.0 },
  ];

  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 20,
          color: "#A9A9A9",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          margin: 0,
          marginBottom: 48,
          opacity: fadeIn(0),
        }}
      >
        Zero-Interaction Payments
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {items.map((item, i) => (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: fadeIn(item.start),
              translate: `0px ${slideUp(item.start)}px`,
            }}
          >
            <span style={{ fontSize: 36 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 32,
                color: "#EDE4D0",
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
