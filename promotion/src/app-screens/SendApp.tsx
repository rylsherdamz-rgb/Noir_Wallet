import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS } from "../theme";
import { Icon } from "../components/Icon";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
const assets = ["USDC", "XLM", "PHP"] as const;

/** Recreation of the app's SendScreen (amount entry step). */
export const SendApp: React.FC = () => {
  const frame = useCurrentFrame();

  // amount types in: 0 -> 42.50
  const typed = ["", "4", "42", "42.", "42.5", "42.50"];
  const idx = Math.min(
    typed.length - 1,
    Math.floor(interpolate(frame, [10, 46], [0, typed.length - 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })),
  );
  const amount = typed[idx] || "0";
  const blink = Math.floor(frame / 15) % 2 === 0;

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
        <div style={{ fontSize: 18, color: Colors.white, fontWeight: 700 }}>Send</div>
        <div style={{ width: 22 }} />
      </div>

      {/* Amount */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", gap: Spacing.sm, marginBottom: Spacing.lg }}>
          {assets.map((a) => {
            const active = a === "USDC";
            return (
              <div
                key={a}
                style={{
                  padding: "8px 16px",
                  borderRadius: BorderRadius.full,
                  background: active ? "rgba(198,161,91,0.20)" : Colors.lightGrey,
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
        <div style={{ fontSize: 64, fontWeight: 800, color: Colors.white, letterSpacing: -1 }}>
          {amount}
          <span style={{ color: Colors.gold, opacity: blink ? 1 : 0.2 }}>|</span>
        </div>
        <div style={{ fontSize: 14, color: Colors.mutedWhite, marginTop: Spacing.sm }}>
          Balance: 142.50 USDC
        </div>
      </div>

      {/* Keypad */}
      <div style={{ padding: `0 ${Spacing.xl}px` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: Spacing.sm }}>
          {KEYS.map((k) => (
            <div
              key={k}
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: Colors.midGrey,
                borderRadius: BorderRadius.md,
                color: Colors.white,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {k}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: Spacing.sm, marginTop: Spacing.md, marginBottom: Spacing.lg }}>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "14px 0",
              color: Colors.mutedWhite,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Cancel
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "14px 0",
              background: Colors.gold,
              color: Colors.black,
              borderRadius: BorderRadius.md,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Continue
          </div>
        </div>
      </div>
    </div>
  );
};
