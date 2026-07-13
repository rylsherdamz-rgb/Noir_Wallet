import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS } from "../theme";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const filters = ["All", "Confirmed", "Pending", "Failed"];

const txs = [
  { name: "Transit Turnstile", time: "Today · 9:41 AM", amount: "-₱25.00", status: "confirmed", dir: "up" as const },
  { name: "Campus Canteen", time: "Today · 12:15 PM", amount: "-₱120.00", status: "confirmed", dir: "up" as const },
  { name: "Top-up · USDC", time: "Yesterday", amount: "+142.50", status: "confirmed", dir: "down" as const },
  { name: "Event Gate", time: "Jul 3", amount: "-₱350.00", status: "confirmed", dir: "up" as const },
  { name: "Retail Checkout", time: "Jul 2", amount: "-₱89.00", status: "pending", dir: "up" as const },
];

/** Recreation of the app's TransactionHistoryScreen. */
export const TransactionsApp: React.FC = () => {
  const frame = useCurrentFrame();

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
        <Icon name="arrow-right" size={22} color={Colors.white} />
        <div style={{ fontSize: 18, color: Colors.white, fontWeight: 700 }}>Transactions</div>
        <Icon name="arrow-down" size={20} color={Colors.gold} />
      </div>

      {/* Search */}
      <div style={{ padding: `0 ${Spacing.md}px ${Spacing.sm}px` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: Spacing.sm,
            background: Colors.cardBg,
            border: `1px solid ${Colors.borderGrey}`,
            borderRadius: BorderRadius.md,
            padding: "10px 14px",
          }}
        >
          <Icon name="search" size={18} color={Colors.mutedWhite} />
          <span style={{ fontSize: 14, color: Colors.mutedWhite }}>Search merchant or amount...</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: Spacing.sm, padding: `${Spacing.sm}px ${Spacing.md}px` }}>
        {filters.map((f, i) => {
          const active = i === 0;
          return (
            <div
              key={f}
              style={{
                padding: "6px 14px",
                borderRadius: BorderRadius.full,
                background: active ? Colors.gold : Colors.lightGrey,
                color: active ? Colors.black : Colors.mutedWhite,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          );
        })}
      </div>

      {/* List */}
      <div style={{ padding: `${Spacing.sm}px ${Spacing.md}px` }}>
        {txs.map((tx, i) => {
          const delay = 8 + i * 8;
          const opacity = interpolate(frame, [delay, delay + 16], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(frame, [delay, delay + 20], [24, 0], {
            extrapolateRight: "clamp",
            easing: ease,
          });
          const positive = tx.amount.startsWith("+");
          return (
            <div
              key={tx.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: Spacing.md,
                background: Colors.cardBg,
                border: `1px solid ${Colors.borderGrey}`,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                marginBottom: Spacing.sm,
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: positive ? "rgba(62,213,152,0.12)" : "rgba(198,161,91,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name={positive ? "arrow-down" : "arrow-up"}
                  size={20}
                  color={positive ? Colors.success : Colors.gold}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: Colors.white, fontWeight: 600 }}>{tx.name}</div>
                <div style={{ fontSize: 11, color: Colors.mutedWhite, marginTop: 2 }}>{tx.time}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 15,
                    color: positive ? Colors.success : Colors.white,
                    fontWeight: 700,
                  }}
                >
                  {tx.amount}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: tx.status === "pending" ? Colors.warning : Colors.success,
                    marginTop: 2,
                    textTransform: "capitalize",
                  }}
                >
                  {tx.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
