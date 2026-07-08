import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS, withAlpha } from "../theme";
import { CatLogo } from "../components/CatLogo";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Phase timeline (frames): intro -> scanning -> success
const SCAN_AT = 45;
const SUCCESS_AT = 95;

/** Recreation of the app's DeviceProvisioningScreen (Link Your Device). */
export const DevicesApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase = frame >= SUCCESS_AT ? "success" : frame >= SCAN_AT ? "scanning" : "intro";

  // scanning pulse
  const t = (frame % (fps * 1.2)) / (fps * 1.2);
  const scanScale = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));

  const successScale = interpolate(frame, [SUCCESS_AT, SUCCESS_AT + 14], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: Colors.black,
        fontFamily: FONT_SANS,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${Spacing.lg}px ${Spacing.lg}px ${Spacing.xl}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CatLogo size={44} />
        <div style={{ fontSize: 22, color: Colors.white, fontWeight: 700, marginTop: Spacing.md }}>
          Link Your Device
        </div>
        <div
          style={{
            fontSize: 13,
            color: Colors.mutedWhite,
            textAlign: "center",
            marginTop: Spacing.sm,
            lineHeight: 1.5,
            maxWidth: 260,
          }}
        >
          Tap your NFC tag against the back of your phone to link it.
        </div>
      </div>

      {/* Center illustration by phase */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {phase === "intro" && (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 56,
                height: 84,
                borderRadius: 14,
                border: `2px solid ${Colors.mutedWhite}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  background: withAlpha(Colors.gold, "20"),
                  border: `1.5px solid ${withAlpha(Colors.gold, "30")}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="radio" size={18} color={Colors.gold} />
              </div>
            </div>
            <Icon name="arrow-right" size={18} color={Colors.mutedWhite} />
            <div
              style={{
                width: 56,
                height: 84,
                borderRadius: BorderRadius.sm,
                background: Colors.lightGrey,
                border: `1px solid ${Colors.borderGrey}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="card" size={24} color={Colors.white} />
            </div>
          </div>
        )}

        {phase === "scanning" && (
          <div
            style={{
              width: 180,
              height: 180,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: 70,
                border: `2px solid ${Colors.gold}`,
                transform: `scale(${scanScale})`,
                opacity: 1 - (scanScale - 0.75) / 0.25 * 0.6,
              }}
            />
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                background: withAlpha(Colors.gold, "15"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="radio" size={40} color={Colors.gold} />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 6,
                fontSize: 13,
                color: Colors.gold,
                fontWeight: 500,
              }}
            >
              Scanning...
            </div>
          </div>
        )}

        {phase === "success" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${successScale})` }}>
            <Icon name="checkmark-circle" size={72} color={Colors.success} />
            <div style={{ fontSize: 22, color: Colors.success, fontWeight: 700, marginTop: Spacing.md }}>
              Linked!
            </div>
            <div style={{ fontSize: 13, color: Colors.mutedWhite, marginTop: 4 }}>
              Blue Keychain is now paired
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: Spacing.md,
                padding: "8px 14px",
                borderRadius: BorderRadius.full,
                background: withAlpha(Colors.gold, "15"),
                border: `1px solid ${withAlpha(Colors.gold, "25")}`,
              }}
            >
              <Icon name="flash" size={14} color={Colors.gold} />
              <span style={{ fontSize: 11, color: Colors.gold, fontWeight: 500 }}>
                x402 agent ready — tap to pay without signing
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.sm,
          background: phase === "scanning" ? Colors.lightGrey : Colors.gold,
          color: phase === "scanning" ? Colors.mutedWhite : Colors.black,
          borderRadius: BorderRadius.md,
          padding: "15px 0",
          fontSize: 17,
          fontWeight: 700,
        }}
      >
        {phase !== "success" && (
          <Icon name="radio" size={20} color={phase === "scanning" ? Colors.mutedWhite : Colors.black} />
        )}
        {phase === "success" ? "Done" : phase === "scanning" ? "Hold Steady..." : "Scan My Tag"}
      </div>
    </div>
  );
};
