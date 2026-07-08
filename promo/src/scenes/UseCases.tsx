import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, withAlpha } from "../theme";
import { SceneShell, Eyebrow, usePhoneEntrance } from "./SceneShell";
import { PhoneFrame } from "../components/PhoneFrame";
import { DashboardApp } from "../app-screens/DashboardApp";
import { SendApp } from "../app-screens/SendApp";
import { ReceiveApp } from "../app-screens/ReceiveApp";
import { TransactionsApp } from "../app-screens/TransactionsApp";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const cases = [
  { icon: "arrow-up" as const, label: "Transit Turnstiles" },
  { icon: "cash" as const, label: "Campus Canteens" },
  { icon: "receipt" as const, label: "Event Gates" },
  { icon: "cube" as const, label: "Retail Checkout" },
];

// Cross-fading carousel through the real app screens.
const SCREENS = [DashboardApp, SendApp, ReceiveApp, TransactionsApp];
const HOLD = 34; // frames per screen

const ScreenCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <PhoneFrame height={600}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {SCREENS.map((Screen, i) => {
          const start = i * HOLD;
          // fade in over 10f, hold, fade out over 10f (except last stays)
          const opacity = interpolate(
            frame,
            [start - 10, start, start + HOLD - 10, start + HOLD],
            [0, 1, 1, i === SCREENS.length - 1 ? 1 : 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          if (opacity <= 0) return null;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity }}>
              <Screen />
            </div>
          );
        })}
      </div>
    </PhoneFrame>
  );
};

// Scene 5 — "Built for high-throughput environments..."
export const UseCases: React.FC = () => {
  const frame = useCurrentFrame();
  const phone = usePhoneEntrance("left");

  return (
    <SceneShell>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 80,
        }}
      >
        {/* Real app — carousel */}
        <div style={phone}>
          <ScreenCarousel />
        </div>

        {/* Use cases */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 460 }}>
          <Eyebrow>Built for High Throughput</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cases.map((c, i) => {
              const delay = 10 + i * 10;
              const opacity = interpolate(frame, [delay, delay + 16], [0, 1], {
                extrapolateRight: "clamp",
              });
              const x = interpolate(frame, [delay, delay + 20], [30, 0], {
                extrapolateRight: "clamp",
                easing: ease,
              });
              return (
                <div
                  key={c.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    background: Colors.cardBg,
                    border: `1px solid ${Colors.borderGrey}`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    opacity,
                    transform: `translateX(${x}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      background: withAlpha(Colors.gold, "15"),
                      border: `1px solid ${withAlpha(Colors.gold, "25")}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={c.icon} size={22} color={Colors.gold} />
                  </div>
                  <div style={{ fontSize: 26, color: Colors.cream, fontWeight: 700 }}>
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
