import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
  Easing,
} from "remotion";

const nodes = [
  { label: "RFID / NFC Tag", x: 15, y: 60 },
  { label: "POS Terminal", x: 38, y: 60 },
  { label: "Payment Gateway", x: 58, y: 60 },
  { label: "Stellar Network", x: 78, y: 60 },
];

export const Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

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
        }}
      >
        How It Works
      </p>
      <svg viewBox={`0 0 ${width} ${height * 0.6}`} style={{ width: "80%", height: "auto" }}>
        {nodes.map((node, i) => {
          const nodeOpacity = interpolate(
            frame,
            [i * fps * 0.3, i * fps * 0.3 + fps * 0.3],
            [0, 1],
            { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) },
          );

          const x = (node.x / 100) * (width * 0.8);
          const y = (node.y / 100) * (height * 0.6);

          return (
            <g key={node.label} opacity={nodeOpacity}>
              <rect
                x={x - 70}
                y={y - 20}
                width={140}
                height={40}
                rx={8}
                fill="#141414"
                stroke="#C6A15B"
                strokeWidth={1}
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="#EDE4D0"
                fontFamily="system-ui, sans-serif"
                fontSize={12}
              >
                {node.label}
              </text>
              {i < nodes.length - 1 && (
                <line
                  x1={x + 70}
                  y1={y}
                  x2={(nodes[i + 1].x / 100) * (width * 0.8) - 70}
                  y2={(nodes[i + 1].y / 100) * (height * 0.6)}
                  stroke="#C6A15B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  opacity={nodeOpacity}
                />
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
