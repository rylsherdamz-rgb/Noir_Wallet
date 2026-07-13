import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS, FONT_MONO, withAlpha } from "../theme";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const assets = ["USDC", "XLM", "PHP"] as const;

// Deterministic QR-like matrix (21x21) with 3 finder patterns.
const N = 21;
const isFinder = (r: number, c: number) => {
  const inBox = (br: number, bc: number) =>
    r >= br && r < br + 7 && c >= bc && c < bc + 7;
  return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0);
};
const finderModule = (r: number, c: number) => {
  // relative pattern within a 7x7 finder box
  const rr = r < 7 ? r : r - (N - 7);
  const cc = c < 7 ? c : c - (N - 7);
  const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6;
  const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
  return edge || core;
};
// pseudo-random but stable
const rand = (r: number, c: number) => {
  const v = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
  return v - Math.floor(v) > 0.5;
};

const QRCodePattern: React.FC<{ size: number }> = ({ size }) => {
  const cell = size / N;
  const modules: React.ReactNode[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const on = isFinder(r, c) ? finderModule(r, c) : rand(r, c);
      if (on) {
        modules.push(
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={Colors.black} />,
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={Colors.white} />
      {modules}
    </svg>
  );
};

/** Recreation of the app's ReceiveScreen (QR + address). */
export const ReceiveApp: React.FC = () => {
  const frame = useCurrentFrame();
  const qrScale = interpolate(frame, [10, 34], [0.85, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const qrOpacity = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: Colors.black,
        fontFamily: FONT_SANS,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${Spacing.md}px ${Spacing.md}px`,
        }}
      >
        <Icon name="close" size={22} color={Colors.white} />
        <div style={{ fontSize: 18, color: Colors.white, fontWeight: 700 }}>Receive</div>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: `0 ${Spacing.md}px` }}>
        {/* Asset chips */}
        <div style={{ display: "flex", gap: Spacing.sm, marginBottom: Spacing.xl }}>
          {assets.map((a) => {
            const active = a === "USDC";
            return (
              <div
                key={a}
                style={{
                  padding: "8px 16px",
                  borderRadius: BorderRadius.full,
                  background: active ? withAlpha(Colors.gold, "20") : Colors.lightGrey,
                  border: `1px solid ${active ? Colors.gold : Colors.borderGrey}`,
                  color: active ? Colors.gold : Colors.mutedWhite,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {a}
              </div>
            );
          })}
        </div>

        {/* QR */}
        <div
          style={{
            background: Colors.white,
            borderRadius: BorderRadius.lg,
            padding: Spacing.md,
            marginBottom: Spacing.xl,
            opacity: qrOpacity,
            transform: `scale(${qrScale})`,
          }}
        >
          <QRCodePattern size={180} />
        </div>

        {/* Address */}
        <div
          style={{
            width: "100%",
            background: Colors.cardBg,
            borderRadius: BorderRadius.md,
            padding: Spacing.md,
            border: `1px solid ${Colors.borderGrey}`,
            marginBottom: Spacing.md,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: Colors.mutedWhite,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: Spacing.sm,
            }}
          >
            Your Stellar Address
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: Spacing.sm }}>
            <div style={{ flex: 1, fontSize: 14, color: Colors.white, fontFamily: FONT_MONO }}>
              GDX7F2QANK...9K4P30XZ
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: withAlpha(Colors.gold, "15"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="copy" size={18} color={Colors.gold} />
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: withAlpha(Colors.gold, "15"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="share" size={18} color={Colors.gold} />
            </div>
          </div>
        </div>

        {/* Balance */}
        <div
          style={{
            width: "100%",
            background: withAlpha(Colors.gold, "10"),
            borderRadius: BorderRadius.md,
            padding: Spacing.md,
            border: `1px solid ${withAlpha(Colors.gold, "25")}`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: Colors.gold, marginBottom: 4 }}>Your USDC Balance</div>
          <div style={{ fontSize: 24, color: Colors.gold, fontWeight: 700 }}>142.50 USDC</div>
        </div>
      </div>
    </div>
  );
};
