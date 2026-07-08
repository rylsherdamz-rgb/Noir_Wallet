import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS, FONT_MONO, withAlpha } from "../theme";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const agents = [
  {
    label: "Blue Keychain",
    key: "GC7X9F2A...4K9P2M",
    balance: "42.50",
    remaining: "31.25",
    spent: "11.25",
    budget: "42.50",
    pct: 26,
  },
  {
    label: "Office Card",
    key: "GB3M8R1D...7Q2W5X",
    balance: "18.00",
    remaining: "6.40",
    spent: "11.60",
    budget: "18.00",
    pct: 64,
  },
];

/** Recreation of the app's AgentListScreen (x402 agent wallets). */
export const AgentsApp: React.FC = () => {
  const frame = useCurrentFrame();

  const rise = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [delay, delay + 22], [24, 0], {
      extrapolateRight: "clamp",
      easing: ease,
    })}px)`,
  });

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
      <div style={{ padding: `${Spacing.md}px 0`, ...rise(0) }}>
        <div style={{ fontSize: 28, color: Colors.cream, fontWeight: 800 }}>Agents</div>
        <div style={{ fontSize: 13, color: Colors.mutedWhite, marginTop: 6, lineHeight: 1.5 }}>
          Autonomous wallets linked to your NFC devices for tap-and-go payments.
        </div>
      </div>

      {agents.map((a, i) => {
        const delay = 8 + i * 12;
        const fill = interpolate(frame, [delay + 12, delay + 40], [0, a.pct], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
        return (
          <div
            key={a.label}
            style={{
              background: Colors.cardBg,
              border: `1px solid ${Colors.borderGrey}`,
              borderRadius: BorderRadius.lg,
              padding: Spacing.md,
              marginBottom: Spacing.md,
              ...rise(delay),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: Spacing.md,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: Spacing.md }}>
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
                  <Icon name="flash" size={22} color={Colors.gold} />
                </div>
                <div>
                  <div style={{ fontSize: 15, color: Colors.white, fontWeight: 700 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: Colors.mutedWhite, fontFamily: FONT_MONO, marginTop: 2 }}>
                    {a.key}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: BorderRadius.full,
                  background: withAlpha(Colors.success, "20"),
                }}
              >
                <span style={{ fontSize: 11, color: Colors.success, fontWeight: 600 }}>active</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: Spacing.md, marginBottom: Spacing.md }}>
              <div
                style={{
                  flex: 1,
                  background: Colors.lightGrey,
                  borderRadius: BorderRadius.md,
                  padding: Spacing.sm,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 11, color: Colors.mutedWhite, marginBottom: 2 }}>Balance</div>
                <div style={{ fontSize: 18, color: Colors.white, fontWeight: 700 }}>{a.balance} XLM</div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: Colors.lightGrey,
                  borderRadius: BorderRadius.md,
                  padding: Spacing.sm,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 11, color: Colors.mutedWhite, marginBottom: 2 }}>Remaining</div>
                <div style={{ fontSize: 18, color: Colors.gold, fontWeight: 700 }}>{a.remaining} XLM</div>
              </div>
            </div>

            <div style={{ height: 4, borderRadius: 2, background: Colors.lightGrey, marginBottom: 6 }}>
              <div style={{ height: 4, borderRadius: 2, background: Colors.gold, width: `${fill}%` }} />
            </div>
            <div style={{ fontSize: 11, color: Colors.mutedWhite }}>
              {a.spent} XLM spent of {a.budget} XLM budget
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.sm,
          padding: `${Spacing.md}px 0`,
          borderRadius: BorderRadius.md,
          border: `1px dashed ${Colors.borderGrey}`,
          ...rise(34),
        }}
      >
        <Icon name="add" size={22} color={Colors.gold} />
        <span style={{ fontSize: 15, color: Colors.gold, fontWeight: 600 }}>Link Another Device</span>
      </div>
    </div>
  );
};
