import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { DEMO_FONT, G, DarkBG, Watermark, Particles, PulseRings, Caption, useSceneFade } from "../DemoShell";
import { DevicesApp } from "../app-screens/DevicesApp";
import { withAlpha } from "../theme";
import { Icon } from "../components/Icon";

type SceneProps = { durationInFrames: number };

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** The link moment: an NFC tag taps the phone and the device registers on-chain. */
export const NfcTagScene: React.FC<SceneProps> = ({ durationInFrames }) => {
  const fade = useSceneFade(durationInFrames);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CONTACT = 44; // tag reaches the phone
  const DONE = 95; // matches DevicesApp SUCCESS_AT

  const enter = spring({ frame, fps, config: { damping: 200 } });

  // Tag slides in from off-screen left until it touches the phone's edge
  const tagX = interpolate(frame, [12, CONTACT], [-1400, 44], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const tagProgress = (tagX + 300) / 344;
  const ringFade = interpolate(tagProgress, [0.55, 0.9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phone enters from the right
  const phoneX = interpolate(frame, [8, 40], [460, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  // Contact ripples on the phone's edge
  const ripple = interpolate(frame, [CONTACT, CONTACT + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleScale = interpolate(ripple, [0, 1], [0.3, 3.2]);
  const rippleOpacity = interpolate(ripple, [0, 0.15, 1], [0, 0.8, 0]);

  // Premium contact flash burst
  const flash = interpolate(frame, [CONTACT, CONTACT + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashScale = interpolate(flash, [0, 1], [0.4, 2.8]);
  const flashOpacity = interpolate(flash, [0, 0.22, 1], [0, 0.9, 0]);

  // Phone recoils subtly at contact
  const bounce = interpolate(frame, [CONTACT, CONTACT + 6, CONTACT + 16], [1, 0.99, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  // Screen glow flash on contact
  const glowFlash = interpolate(frame, [CONTACT, CONTACT + 18], [0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shine sweep across the tag material
  const shine = ((frame * 2.4) % 240) - 90;

  const tagGlow = 0.5 + 0.5 * Math.sin(frame / 12);
  const float = Math.sin((frame / fps) * 1.1) * 8;
  const done = frame >= DONE;

  return (
      <AbsoluteFill style={{ opacity: fade }}>
      <DarkBG />
      <Particles count={22} dark />


      {/* Stage: NFC tag -> phone, pinned right like the walkthrough scenes */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", paddingRight: 150 }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 44,
            opacity: enter,
            transform: "translateY(-64px)",
          }}
        >
          {/* NFC tag / wearable */}
          <div style={{ transform: `translateX(${tagX}px)`, position: "relative", zIndex: 3 }}>
            {/* rings collapse as the tag reaches the phone */}
            <div style={{ position: "absolute", inset: -30, opacity: ringFade }}>
              <PulseRings size={220} count={3} thickness={2} />
            </div>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: 42,
                background: "linear-gradient(150deg, #1c1c1c, #000)",
                border: `1px solid ${withAlpha(G.gold, "55")}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 ${24 + tagGlow * 34}px ${withAlpha(G.gold, "55")}`,
              }}
            >
              {/* moving shine */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  bottom: -40,
                  left: -60,
                  width: 90,
                  background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.16), transparent)",
                  transform: `translateX(${shine}px) skewX(-18deg)`,
                }}
              />
              <Icon name="radio" size={68} color={G.gold} />
              <span style={{ fontFamily: DEMO_FONT, fontSize: 21, fontWeight: 600, color: G.grey200 }}>
                NFC Tag
              </span>
            </div>
          </div>

          {/* Phone with the live provisioning screen */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              transform: `translateX(${phoneX}px) translateY(${float}px) scale(${bounce})`,
            }}
          >
            {done && <PulseRings size={470} count={3} thickness={2} color={G.green} />}
            <div
              style={{
                width: 360,
                height: 780,
                borderRadius: 56,
                background: "linear-gradient(155deg, #3a3a3a, #0a0a0a 55%, #000)",
                padding: 10,
                boxShadow:
                  "0 60px 120px rgba(0,0,0,0.75), 0 0 0 2px rgba(198,161,91,0.28), inset 0 0 3px rgba(255,255,255,0.22)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: 46,
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                {/* notch */}
                <div
                  style={{
                    position: "absolute",
                    top: 9,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 128,
                    height: 24,
                    borderRadius: 13,
                    background: "#000",
                    zIndex: 30,
                  }}
                />
                {/* status bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 42,
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                    fontFamily: DEMO_FONT,
                    fontSize: 15,
                    fontWeight: 600,
                    color: G.white,
                  }}
                >
                  <span>9:41</span>
                  <span style={{ letterSpacing: 2 }}>••••  5G  ▮</span>
                </div>
                <div style={{ position: "absolute", inset: 0, paddingTop: 42 }}>
                  <DevicesApp />
                </div>
                {/* contact glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 6% 50%, ${withAlpha(G.gold, "40")}, transparent 65%)`,
                    opacity: glowFlash,
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 108,
                    height: 5,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.55)",
                    zIndex: 20,
                  }}
                />
              </div>
            </div>
          </div>
          {/* contact ripples + flash nailed at the seam: x=224 (tag 180 + gap 44), y=390 (container center) */}
          {[0, 0.12, 0.24].map((o, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 154,
                top: 320,
                width: 140,
                height: 140,
                borderRadius: "50%",
                border: `3px solid ${G.gold}`,
                zIndex: 10,
                transform: `scale(${Math.max(0, rippleScale - o * 2)})`,
                opacity: rippleOpacity,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 109,
              top: 275,
              width: 230,
              height: 230,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${withAlpha(G.gold, "66")}, transparent 65%)`,
              zIndex: 10,
              transform: `scale(${flashScale})`,
              opacity: flashOpacity,
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Caption, left like the walkthrough scenes */}
      <Caption
        step="03 · Link your tag"
        title={<>Tap your tag to your phone.</>}
        body="Sign once — Soroban registers your device and its x402 agent on-chain."
      />

      <Watermark dark />
    </AbsoluteFill>
  );
};
