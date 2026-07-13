import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { DEMO_FONT, G, DarkBG, Kicker, Watermark, Particles, PulseRings, useSceneFade, useReveal } from "../DemoShell";
import { Icon } from "../components/Icon";
import { withAlpha } from "../theme";

type SceneProps = { durationInFrames: number };

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** The x402 hero: a tag taps a terminal and the wallet is debited instantly. */
export const TapToPayScene: React.FC<SceneProps> = ({ durationInFrames }) => {
  const fade = useSceneFade(durationInFrames);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timeline
  const CONTACT = 52;
  const DEBIT = 74;
  const DONE = 104;

  const enter = spring({ frame, fps, config: { damping: 200 } });

  // Tag slides from left toward the terminal, then rests on contact
  const tagX = interpolate(frame, [12, CONTACT], [-260, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  // Ripple on contact
  const ripple = interpolate(frame, [CONTACT, CONTACT + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleScale = interpolate(ripple, [0, 1], [0.3, 3.4]);
  const rippleOpacity = interpolate(ripple, [0, 0.15, 1], [0, 0.75, 0]);

  const phase = frame >= DONE ? "done" : frame >= DEBIT ? "debit" : "idle";

  const debitPop = spring({ frame: frame - DEBIT, fps, config: { damping: 160 } });
  const donePop = spring({ frame: frame - DONE, fps, config: { damping: 140 } });
  const tagGlow = 0.5 + 0.5 * Math.sin(frame / 12);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <DarkBG />
      <Particles count={22} dark />

      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 96 }}>
        <Kicker delay={2} dark>
          The x402 moment
        </Kicker>
      </AbsoluteFill>

      {/* Stage */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 120, opacity: enter }}>
          {/* NFC tag / wearable */}
          <div style={{ transform: `translateX(${tagX}px)`, position: "relative", zIndex: 3 }}>
            {/* perpetual NFC broadcast rings */}
            <PulseRings size={230} count={3} thickness={2} />
            <div
              style={{
                width: 190,
                height: 190,
                borderRadius: 44,
                background: "linear-gradient(150deg, #1c1c1c, #000)",
                border: `1px solid ${withAlpha(G.gold, "55")}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 ${24 + tagGlow * 34}px ${withAlpha(G.gold, "55")}`,
              }}
            >
              <Icon name="radio" size={72} color={G.gold} />
              <span style={{ fontFamily: DEMO_FONT, fontSize: 22, fontWeight: 600, color: G.grey200 }}>
                NFC Tag
              </span>
            </div>
          </div>

          {/* POS terminal */}
          <div style={{ position: "relative", zIndex: 2 }}>
            {/* contact ripples */}
            {[0, 0.12, 0.24].map((o, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: -40,
                  top: "50%",
                  width: 120,
                  height: 120,
                  marginTop: -60,
                  borderRadius: "50%",
                  border: `3px solid ${G.gold}`,
                  transform: `scale(${Math.max(0, rippleScale - o * 2)})`,
                  opacity: rippleOpacity,
                }}
              />
            ))}
            {phase === "done" && <PulseRings size={420} count={3} thickness={2} color={G.green} />}
            <div
              style={{
                width: 300,
                height: 380,
                borderRadius: 40,
                background: "linear-gradient(160deg, #202124, #0b0b0b)",
                border: `1px solid ${G.ink2}`,
                boxShadow: "0 40px 80px rgba(0,0,0,0.65)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* terminal screen */}
              <div
                style={{
                  flex: 1,
                  borderRadius: 24,
                  background: phase === "done" ? withAlpha(G.green, "1E") : "#000",
                  border: `1px solid ${phase === "done" ? withAlpha(G.green, "66") : G.ink2}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {phase === "idle" && (
                  <>
                    <Icon name="wallet" size={54} color={G.slate} />
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 22, color: G.slate, fontWeight: 600 }}>
                      Ready to tap
                    </span>
                  </>
                )}
                {phase === "debit" && (
                  <div style={{ transform: `scale(${debitPop})`, textAlign: "center" }}>
                    <div style={{ fontFamily: DEMO_FONT, fontSize: 20, color: G.slate, fontWeight: 600 }}>
                      Debiting…
                    </div>
                    <div style={{ fontFamily: DEMO_FONT, fontSize: 56, color: G.white, fontWeight: 800, marginTop: 6 }}>
                      −₱25.00
                    </div>
                  </div>
                )}
                {phase === "done" && (
                  <div style={{ transform: `scale(${donePop})`, textAlign: "center" }}>
                    <Icon name="checkmark-circle" size={72} color={G.green} />
                    <div style={{ fontFamily: DEMO_FONT, fontSize: 30, color: G.white, fontWeight: 800, marginTop: 10 }}>
                      Paid
                    </div>
                    <div style={{ fontFamily: DEMO_FONT, fontSize: 20, color: G.green, fontWeight: 600, marginTop: 2 }}>
                      Settled · 1.8s
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  marginTop: 16,
                  textAlign: "center",
                  fontFamily: DEMO_FONT,
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 2,
                  color: G.slate,
                }}
              >
                NOIR · POS TERMINAL
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Caption */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
        <div style={{ ...useReveal(8, 26), textAlign: "center" }}>
          <div
            style={{
              fontFamily: DEMO_FONT,
              fontSize: 66,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: G.white,
            }}
          >
            Tap. Debited instantly.
          </div>
          <div style={{ fontFamily: DEMO_FONT, fontSize: 30, fontWeight: 400, color: G.grey200, marginTop: 16 }}>
            Your x402 agent pays — no unlock, no app, no confirmation.
          </div>
        </div>
      </AbsoluteFill>

      <Watermark dark />
    </AbsoluteFill>
  );
};
