import React from "react";
import { Colors } from "../theme";

interface PhoneFrameProps {
  children: React.ReactNode;
  /** Height of the phone in px. Width is derived from a 19.5:9 aspect ratio. */
  height?: number;
  style?: React.CSSProperties;
}

/**
 * A realistic phone bezel used to present the real Noir Wallet app screens.
 * The inner screen renders children clipped to the rounded viewport, matching
 * the app's black background and gold-accented dark theme.
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  height = 620,
  style,
}) => {
  const width = Math.round((height * 9) / 19.5);
  const bezel = Math.round(height * 0.014);
  const radius = Math.round(height * 0.06);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(160deg, #2a2a2a, #050505)",
        padding: bezel,
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(198,161,91,0.25), inset 0 0 2px rgba(255,255,255,0.15)",
        ...style,
      }}
    >
      {/* Screen */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          overflow: "hidden",
          backgroundColor: Colors.black,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 34,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 22px",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            color: Colors.white,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>••••  5G  ▮</span>
        </div>

        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.34,
            height: 22,
            borderRadius: 12,
            backgroundColor: "#000",
            zIndex: 30,
          }}
        />

        {/* App content */}
        <div style={{ position: "absolute", inset: 0, paddingTop: 34 }}>
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.32,
            height: 5,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.55)",
            zIndex: 20,
          }}
        />
      </div>
    </div>
  );
};
