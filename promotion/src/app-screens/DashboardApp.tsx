import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS, FONT_MONO, withAlpha } from "../theme";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const assets = [
  { icon: "cash" as const, label: "PHP", amount: "₱12,480.00", value: "Fiat", color: Colors.gold },
  { icon: "usd" as const, label: "USDC", amount: "142.50", value: "₱8,265.00", color: Colors.silver },
  { icon: "planet" as const, label: "XLM", amount: "1,204.8710", value: "₱8,380.14", color: Colors.goldDim },
];

const actions = [
  { icon: "arrow-up" as const, label: "Send" },
  { icon: "arrow-down" as const, label: "Receive" },
  { icon: "radio" as const, label: "Link" },
  { icon: "receipt" as const, label: "History" },
];

/** Faithful recreation of the app's DashboardScreen with BalanceCard. */
export const DashboardApp: React.FC = () => {
  const frame = useCurrentFrame();

  const rise = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 18], [0, 1], {
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [delay, delay + 22], [24, 0], {
      extrapolateRight: "clamp",
      easing: ease,
    })}px)`,
  });

  // Portfolio value counts up
  const total = Math.round(
    interpolate(frame, [8, 48], [0, 29125.14], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    }) * 100,
  ) / 100;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: Colors.black,
        fontFamily: FONT_SANS,
        padding: `${Spacing.sm}px ${Spacing.md}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${Spacing.md}px 0`,
          ...rise(0),
        }}
      >
        <div>
          <div style={{ fontSize: 20, color: Colors.cream, fontWeight: 700 }}>
            Welcome, richie
          </div>
          <div
            style={{
              fontSize: 11,
              color: Colors.mutedWhite,
              fontFamily: FONT_MONO,
              marginTop: 2,
            }}
          >
            GDX7F2QA...9K4P
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: BorderRadius.full,
            background: Colors.cardBg,
            border: `1px solid ${Colors.borderGrey}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="person" size={20} color={Colors.cream} />
        </div>
      </div>

      {/* Balance card */}
      <div
        style={{
          background: Colors.cardBg,
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          border: `1px solid ${Colors.borderGrey}`,
          ...rise(6),
        }}
      >
        <div style={{ textAlign: "center", paddingBottom: Spacing.sm }}>
          <div
            style={{
              fontSize: 11,
              color: Colors.mutedWhite,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Portfolio Value
          </div>
          <div
            style={{
              fontSize: 32,
              color: Colors.cream,
              fontWeight: 800,
              marginTop: Spacing.xs,
            }}
          >
            ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            style={{
              fontSize: 13,
              color: Colors.gold,
              marginTop: Spacing.xs,
              fontWeight: 500,
            }}
          >
            ${(total / 58).toFixed(2)} USD
          </div>
        </div>

        <div style={{ height: 1, background: Colors.borderGrey, margin: `${Spacing.lg}px 0` }} />

        <div style={{ display: "flex", flexDirection: "column", gap: Spacing.md }}>
          {assets.map((a) => (
            <div key={a.label} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BorderRadius.full,
                  background: withAlpha(a.color, "15"),
                  border: `1px solid ${Colors.borderGrey}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={a.icon} size={20} color={a.color} />
              </div>
              <div style={{ flex: 1, marginLeft: Spacing.md }}>
                <div
                  style={{
                    fontSize: 11,
                    color: Colors.mutedWhite,
                    fontWeight: 500,
                    textTransform: "uppercase",
                  }}
                >
                  {a.label}
                </div>
                <div style={{ fontSize: 14, color: Colors.white, fontWeight: 600, marginTop: 1 }}>
                  {a.amount}
                </div>
              </div>
              <div style={{ fontSize: 13, color: Colors.mutedWhite }}>{a.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: Spacing.lg,
          ...rise(14),
        }}
      >
        {actions.map((a) => (
          <div
            key={a.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: Spacing.xs,
              width: "22%",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: BorderRadius.full,
                background: withAlpha(Colors.gold, "15"),
                border: `1px solid ${withAlpha(Colors.gold, "25")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={a.icon} size={22} color={Colors.gold} />
            </div>
            <div style={{ fontSize: 11, color: Colors.mutedWhite, fontWeight: 500 }}>
              {a.label}
            </div>
          </div>
        ))}
      </div>

      {/* My Wallets */}
      <div style={{ marginTop: Spacing.xl, ...rise(22) }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: Spacing.sm,
          }}
        >
          <div style={{ fontSize: 18, color: Colors.cream, fontWeight: 700 }}>My Wallets</div>
          <div style={{ fontSize: 13, color: Colors.gold, fontWeight: 500 }}>Manage</div>
        </div>
        <div style={{ display: "flex", gap: Spacing.md }}>
          {[
            { label: "Blue Keychain", rem: "₱4,500" },
            { label: "Office Card", rem: "₱1,200" },
          ].map((w) => (
            <div
              key={w.label}
              style={{
                width: 150,
                background: Colors.cardBg,
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                border: `1px solid ${Colors.borderGrey}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: Spacing.lg,
                }}
              >
                <Icon name="radio" size={24} color={Colors.gold} />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: Colors.success,
                    marginTop: 4,
                  }}
                />
              </div>
              <div style={{ fontSize: 15, color: Colors.cream, fontWeight: 700 }}>{w.label}</div>
              <div style={{ fontSize: 11, color: Colors.mutedWhite, marginTop: Spacing.sm }}>
                Daily Remaining
              </div>
              <div style={{ fontSize: 18, color: Colors.gold, fontWeight: 700 }}>{w.rem}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
