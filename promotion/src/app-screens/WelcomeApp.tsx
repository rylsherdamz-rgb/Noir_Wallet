import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS, withAlpha } from "../theme";
import { CatLogo } from "../components/CatLogo";
import { Icon } from "../components/Icon";

const features = [
  {
    icon: "radio" as const,
    label: "NFC Wallet Cards",
    desc: "Link a physical NFC tag as your hardware key",
  },
  {
    icon: "flash" as const,
    label: "x402 Agent Payments",
    desc: "AI agents sign transactions when you tap",
  },
  {
    icon: "cube" as const,
    label: "Stellar Blockchain",
    desc: "Fast, low-cost global payments",
  },
];

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Faithful recreation of the app's WelcomeScreen with entrance animation. */
export const WelcomeApp: React.FC = () => {
  const frame = useCurrentFrame();

  const heroScale = interpolate(frame, [0, 24], [0.85, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const heroOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const glow = interpolate(frame % 120, [0, 60, 120], [0.3, 0.7, 0.3]);
  const slideUp = interpolate(frame, [10, 40], [30, 0], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const bodyOpacity = interpolate(frame, [10, 34], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(160deg, #000000, #0A0A0A 60%, #141414)`,
        fontFamily: FONT_SANS,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${Spacing.xl}px ${Spacing.lg}px ${Spacing.lg}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Hero */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          marginTop: 24,
          opacity: heroOpacity,
          transform: `scale(${heroScale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -6,
            width: 130,
            height: 130,
            borderRadius: 65,
            background: Colors.gold,
            filter: "blur(38px)",
            opacity: glow * 0.5,
          }}
        />
        <CatLogo size={78} />
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: Colors.cream,
            letterSpacing: 12,
            marginTop: Spacing.lg,
            textShadow: `0 2px 8px ${withAlpha(Colors.gold, "40")}`,
          }}
        >
          NOIR
        </div>
        <div
          style={{
            fontSize: 11,
            color: Colors.gold,
            letterSpacing: 6,
            marginTop: Spacing.md,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Tap Into Trust
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: Spacing.lg,
            width: "55%",
          }}
        >
          <div style={{ flex: 1, height: 1, background: withAlpha(Colors.gold, "25") }} />
          <div style={{ width: 5, height: 5, borderRadius: 3, background: Colors.gold }} />
          <div style={{ flex: 1, height: 1, background: withAlpha(Colors.gold, "25") }} />
        </div>
        <div
          style={{
            fontSize: 13,
            color: Colors.mutedWhite,
            textAlign: "center",
            marginTop: Spacing.lg,
            lineHeight: 1.6,
            padding: "0 8px",
          }}
        >
          The first NFC-powered wallet on Stellar. Tap your card. Pay with
          agents. Own your assets.
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: Spacing.md,
          transform: `translateY(${slideUp}px)`,
          opacity: bodyOpacity,
        }}
      >
        {features.map((f) => (
          <div
            key={f.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: Spacing.md,
              background: Colors.cardBg,
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              border: `1px solid ${Colors.borderGrey}`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: BorderRadius.full,
                background: withAlpha(Colors.gold, "15"),
                border: `1px solid ${withAlpha(Colors.gold, "25")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={f.icon} size={20} color={Colors.gold} />
            </div>
            <div>
              <div style={{ fontSize: 15, color: Colors.cream, fontWeight: 600 }}>
                {f.label}
              </div>
              <div style={{ fontSize: 11, color: Colors.mutedWhite, marginTop: 2 }}>
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: Spacing.md,
          transform: `translateY(${slideUp}px)`,
          opacity: bodyOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: Colors.gold,
            color: Colors.black,
            fontWeight: 700,
            fontSize: 15,
            borderRadius: BorderRadius.full,
            padding: "15px 0",
          }}
        >
          <Icon name="radio" size={20} color={Colors.black} />
          Register My Card
        </div>
        <div
          style={{
            textAlign: "center",
            color: Colors.mutedWhite,
            fontSize: 14,
            padding: "12px 0",
          }}
        >
          I already have a wallet
        </div>
      </div>
    </div>
  );
};
