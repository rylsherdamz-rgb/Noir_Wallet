import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, withAlpha } from "../theme";
import { SceneShell, Eyebrow, usePhoneEntrance } from "./SceneShell";
import { PhoneFrame } from "../components/PhoneFrame";
import { DevicesApp } from "../app-screens/DevicesApp";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const points = [
  { icon: "radio" as const, text: "No app to open" },
  { icon: "checkmark-circle" as const, text: "No confirmation needed" },
  { icon: "flash" as const, text: "Just tap and go" },
];

// Scene 2 — "No app opens. No confirmation needed. Just tap and go."
// Shows the real Devices screen: tap an NFC tag to pair it (scan → linked).
export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const phone = usePhoneEntrance("left");

  return (
    <SceneShell>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 90,
        }}
      >
        {/* Real app — Devices / Link a tag */}
        <div style={phone}>
          <PhoneFrame height={600}>
            <DevicesApp />
          </PhoneFrame>
        </div>

        {/* Points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 440 }}>
          <Eyebrow>Zero-Interaction Payments</Eyebrow>
          {points.map((p, i) => {
            const delay = 10 + i * 12;
            const opacity = interpolate(frame, [delay, delay + 16], [0, 1], {
              extrapolateRight: "clamp",
            });
            const x = interpolate(frame, [delay, delay + 20], [-24, 0], {
              extrapolateRight: "clamp",
              easing: ease,
            });
            return (
              <div
                key={p.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity,
                  transform: `translateX(${x}px)`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    background: withAlpha(Colors.gold, "15"),
                    border: `1px solid ${withAlpha(Colors.gold, "25")}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={p.icon} size={24} color={Colors.gold} />
                </div>
                <div style={{ fontSize: 30, color: Colors.cream, fontWeight: 700 }}>
                  {p.text}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
