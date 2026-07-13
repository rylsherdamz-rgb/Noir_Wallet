import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, withAlpha } from "../theme";
import { SceneShell, Eyebrow, usePhoneEntrance } from "./SceneShell";
import { PhoneFrame } from "../components/PhoneFrame";
import { BlockchainApp } from "../app-screens/BlockchainApp";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const steps = [
  { icon: "radio" as const, title: "Tap NFC tag", sub: "Sticker, card, or wearable" },
  { icon: "cube" as const, title: "Terminal reads UID", sub: "Hardware device identity" },
  { icon: "code" as const, title: "device_registry resolves", sub: "Soroban maps UID → wallet" },
  { icon: "planet" as const, title: "Stellar settles", sub: "Transfer in under 2 seconds" },
];

// Scene 4 — RFID → terminal reads UID → resolves Stellar wallet → executes transfer.
// Real Blockchain screen shows the on-chain wallet + device_registry contract.
export const Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const phone = usePhoneEntrance("right");

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
        {/* Flow steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 440 }}>
          <div style={{ marginBottom: 12 }}>
            <Eyebrow>How It Works</Eyebrow>
          </div>
          {steps.map((s, i) => {
            const delay = 8 + i * 12;
            const opacity = interpolate(frame, [delay, delay + 16], [0, 1], {
              extrapolateRight: "clamp",
            });
            const x = interpolate(frame, [delay, delay + 20], [-24, 0], {
              extrapolateRight: "clamp",
              easing: ease,
            });
            return (
              <div key={s.title} style={{ opacity, transform: `translateX(${x}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
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
                    <Icon name={s.icon} size={24} color={Colors.gold} />
                  </div>
                  <div>
                    <div style={{ fontSize: 26, color: Colors.cream, fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: 15, color: Colors.mutedWhite }}>{s.sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      height: 18,
                      background: withAlpha(Colors.gold, "30"),
                      marginLeft: 25,
                      marginTop: 4,
                      marginBottom: 4,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Real app — Blockchain */}
        <div style={phone}>
          <PhoneFrame height={600}>
            <BlockchainApp />
          </PhoneFrame>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
