import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS, FONT_MONO, withAlpha } from "../theme";
import { CatLogo } from "../components/CatLogo";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const activity = [
  { name: "Transit Turnstile", date: "Jul 5, 2026", amount: "-25.00 PHP" },
  { name: "Campus Canteen", date: "Jul 5, 2026", amount: "-120.00 PHP" },
  { name: "Event Gate", date: "Jul 3, 2026", amount: "-350.00 PHP" },
];

/** Recreation of the app's BlockchainScreen (wallet, contract, activity). */
export const BlockchainApp: React.FC = () => {
  const frame = useCurrentFrame();

  const rise = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [delay, delay + 22], [24, 0], {
      extrapolateRight: "clamp",
      easing: ease,
    })}px)`,
  });

  const sectionTitle: React.CSSProperties = {
    fontSize: 11,
    color: Colors.mutedWhite,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    margin: `${Spacing.md}px 0 ${Spacing.sm}px`,
  };

  const card: React.CSSProperties = {
    background: Colors.cardBg,
    border: `1px solid ${Colors.borderGrey}`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: Colors.black,
        fontFamily: FONT_SANS,
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
        <CatLogo size={24} ring={false} />
        <div style={{ fontSize: 18, color: Colors.white, fontWeight: 700 }}>Blockchain</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: BorderRadius.full,
            background: Colors.lightGrey,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: 3, background: Colors.warning }} />
          <span style={{ fontSize: 10, color: Colors.mutedWhite, fontWeight: 700 }}>TESTNET</span>
        </div>
      </div>

      <div style={{ padding: `0 ${Spacing.md}px` }}>
        {/* Wallet */}
        <div style={{ ...sectionTitle, ...rise(0) }}>Wallet</div>
        <div style={{ ...card, ...rise(2) }}>
          <div style={{ display: "flex", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.md }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: withAlpha(Colors.gold, "15"),
                border: `1px solid ${withAlpha(Colors.gold, "25")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="wallet" size={22} color={Colors.gold} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: Colors.mutedWhite }}>Stellar Address</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 13, color: Colors.white, fontFamily: FONT_MONO }}>
                  GDX7F2QANK...9K4P30XZ
                </span>
                <Icon name="copy" size={14} color={Colors.gold} />
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: `${Spacing.sm}px 0`,
              borderTop: `1px solid ${Colors.borderGrey}`,
            }}
          >
            <span style={{ fontSize: 14, color: Colors.mutedWhite, fontWeight: 500 }}>XLM</span>
            <span style={{ fontSize: 15, color: Colors.white, fontWeight: 700 }}>1,204.8710</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: `${Spacing.sm}px 0`,
              borderTop: `1px solid ${Colors.borderGrey}`,
            }}
          >
            <span style={{ fontSize: 14, color: Colors.mutedWhite, fontWeight: 500 }}>USDC</span>
            <span style={{ fontSize: 15, color: Colors.white, fontWeight: 700 }}>142.50</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: Spacing.sm,
              marginTop: Spacing.md,
              padding: "10px 0",
              borderRadius: BorderRadius.md,
              background: Colors.gold,
            }}
          >
            <Icon name="water" size={16} color={Colors.black} />
            <span style={{ fontSize: 13, color: Colors.black, fontWeight: 700 }}>Fund with Testnet XLM</span>
          </div>
        </div>

        {/* Contract */}
        <div style={{ ...sectionTitle, ...rise(10) }}>Device Registry Contract</div>
        <div style={{ ...card, ...rise(12) }}>
          <div style={{ display: "flex", alignItems: "center", gap: Spacing.md }}>
            <Icon name="code" size={20} color={Colors.mutedWhite} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: Colors.white, fontWeight: 500 }}>DeviceRegistry</div>
              <div style={{ fontSize: 11, color: Colors.mutedWhite, fontFamily: FONT_MONO, marginTop: 1 }}>
                CBQK7X2M...9F4D0Z
              </div>
            </div>
            <Icon name="arrow-right" size={16} color={Colors.mutedWhite} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: Spacing.sm,
              marginTop: Spacing.md,
              paddingTop: Spacing.md,
              borderTop: `1px solid ${Colors.borderGrey}`,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: Colors.success }} />
            <span style={{ fontSize: 11, color: Colors.success }}>Deployed &amp; Verified</span>
          </div>
        </div>

        {/* Activity */}
        <div style={{ ...sectionTitle, ...rise(18) }}>Recent Activity</div>
        <div style={{ ...card, ...rise(20) }}>
          {activity.map((a, i) => (
            <div
              key={a.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: Spacing.md,
                padding: `${Spacing.sm}px 0`,
                borderBottom: i < activity.length - 1 ? `1px solid ${Colors.borderGrey}` : "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: withAlpha(Colors.gold, "10"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="swap" size={18} color={Colors.gold} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: Colors.white, fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: Colors.mutedWhite, marginTop: 1 }}>{a.date}</div>
              </div>
              <span style={{ fontSize: 14, color: Colors.white, fontWeight: 700 }}>{a.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
