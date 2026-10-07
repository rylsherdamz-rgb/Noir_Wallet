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
import { withAlpha } from "../theme";
import { Icon } from "../components/Icon";

type SceneProps = { durationInFrames: number };

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const AMOUNT = 25.0;

// Phase frames (fps 30) — compressed to the 50s demo cut (~221-frame scene)
const CONTACT = 43; // first card tap
const TAP2 = 110; // second tap
const TAP3 = 144; // third tap
const CLAIM = 184; // merchant batch-settles the queue
const DONE = 208;

const CHECK_LEN = 16; // per-tap "checking agent balance" window

/** The escrow moment: each tap only checks the agent balance and queues the payment. */
export const PosEscrowScene: React.FC<SceneProps> = ({ durationInFrames }) => {
  const fade = useSceneFade(durationInFrames);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });

  // Card slides in from the left until its edge meets the terminal (gap = 88px)
  const cardX = interpolate(frame, [12, CONTACT], [-300, 88], clamp);
  const cardProgress = (cardX + 300) / 388;
  const ringFade = interpolate(cardProgress, [0.55, 0.9], [1, 0], clamp);

  // Little bounce every time the card "taps"
  const pulse = (t: number) =>
    interpolate(frame, [t, t + 4, t + 9], [0, 7, 0], clamp);
  const cardY = pulse(CONTACT) + pulse(TAP2) + pulse(TAP3);

  // Contact ripples per tap
  const ripple = (t: number) => {
    const p = interpolate(frame, [t, t + 26], [0, 1], clamp);
    const scale = interpolate(p, [0, 1], [0.3, 3.4]);
    const opacity = interpolate(p, [0, 0.15, 1], [0, 0.75, 0]);
    return { scale, opacity };
  };

  // Premium contact flash burst per tap
  const flash = (t: number) => interpolate(frame, [t, t + 14], [0, 1], clamp);
  const flashScale = interpolate(flash(CONTACT), [0, 1], [0.4, 2.8]);
  const flashOpacity = interpolate(flash(CONTACT), [0, 0.22, 1], [0, 0.9, 0]);
  const flashScale2 = interpolate(flash(TAP2), [0, 1], [0.4, 2.8]);
  const flashOpacity2 = interpolate(flash(TAP2), [0, 0.22, 1], [0, 0.9, 0]);
  const flashScale3 = interpolate(flash(TAP3), [0, 1], [0.4, 2.8]);
  const flashOpacity3 = interpolate(flash(TAP3), [0, 0.22, 1], [0, 0.9, 0]);

  // Terminal recoils subtly on each tap
  const bounce = (t: number) =>
    interpolate(frame, [t, t + 6, t + 16], [1, 0.97, 1], { ...clamp, easing: ease });
  const terminalBounce = bounce(CONTACT) * bounce(TAP2) * bounce(TAP3);

  // Screen glow flash per tap
  const glowFlash = (t: number) => interpolate(frame, [t, t + 18], [0.45, 0], clamp);
  const screenGlow = Math.max(glowFlash(CONTACT), glowFlash(TAP2), glowFlash(TAP3));

  // Shine sweep across the card material
  const shine = ((frame * 2.4) % 240) - 90;

  const checkingTap1 = frame >= CONTACT && frame < CONTACT + CHECK_LEN;
  const checkingTap2 = frame >= TAP2 && frame < TAP2 + CHECK_LEN;
  const checkingTap3 = frame >= TAP3 && frame < TAP3 + CHECK_LEN;
  const checking = checkingTap1 || checkingTap2 || checkingTap3;

  const authCount = (frame >= CONTACT + CHECK_LEN ? 1 : 0) + (frame >= TAP2 + CHECK_LEN ? 1 : 0) + (frame >= TAP3 + CHECK_LEN ? 1 : 0);
  const claiming = frame >= CLAIM && frame < DONE;
  const settled = frame >= DONE;

  const escrow = settled ? 0 : AMOUNT * authCount;
  const pending = settled ? 0 : authCount;
  const cardGlow = 0.5 + 0.5 * Math.sin(frame / 12);

  const queueRows = [1, 2, 3];
  const terminalGlow = settled
    ? "0 0 0 2px rgba(62,213,152,0.55), 0 0 60px rgba(62,213,152,0.30)"
    : "0 40px 80px rgba(0,0,0,0.65)";

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <DarkBG />
      <Particles count={22} dark />

      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 88 }}>
        <Kicker delay={2} dark>
          The escrow moment
        </Kicker>
      </AbsoluteFill>

      {/* Stage: NFC card -> merchant POS */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 88,
            opacity: enter,
            transform: "translateY(-36px)",
          }}
        >
          {/* NFC card */}
          <div style={{ transform: `translateX(${cardX}px) translateY(${cardY}px)`, position: "relative", zIndex: 3 }}>
            {/* rings collapse as the card reaches the terminal */}
            <div style={{ position: "absolute", inset: -30, opacity: ringFade }}>
              <PulseRings size={300} count={3} thickness={2} />
            </div>
            <div
              style={{
                width: 160,
                height: 250,
                borderRadius: 30,
                background: "linear-gradient(150deg, #23201a, #000)",
                border: `1px solid ${withAlpha(G.gold, "55")}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                overflow: "hidden",
                position: "relative",
                boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 ${22 + cardGlow * 30}px ${withAlpha(G.gold, "55")}`,
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
              {/* EMV chip */}
              <div
                style={{
                  width: 44,
                  height: 34,
                  borderRadius: 8,
                  background: "linear-gradient(140deg, #d8b86a, #8a6a2f)",
                  boxShadow: "inset 0 0 6px rgba(0,0,0,0.5)",
                }}
              />
              <Icon name="radio" size={54} color={G.gold} />
              <span style={{ fontFamily: DEMO_FONT, fontSize: 19, fontWeight: 600, color: G.grey200 }}>
                NFC Card
              </span>
            </div>
          </div>

          {/* Merchant POS terminal */}
          <div style={{ position: "relative", zIndex: 2, transform: `scale(${terminalBounce})` }}>
            {/* contact ripples + flash at the card's contact point */}
            {[CONTACT, TAP2, TAP3].map((t, i) => {
              const r = ripple(t);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: -56,
                    top: "50%",
                    width: 140,
                    height: 140,
                    marginTop: -70,
                    borderRadius: "50%",
                    border: `3px solid ${G.gold}`,
                    zIndex: 5,
                    transform: `scale(${Math.max(0, r.scale - i * 0.4)})`,
                    opacity: r.opacity,
                  }}
                />
              );
            })}
            {[
              { scale: flashScale, opacity: flashOpacity },
              { scale: flashScale2, opacity: flashOpacity2 },
              { scale: flashScale3, opacity: flashOpacity3 },
            ].map((f, i) => (
              <div
                key={`f${i}`}
                style={{
                  position: "absolute",
                  left: -76,
                  top: "50%",
                  width: 180,
                  height: 180,
                  marginTop: -90,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${withAlpha(G.gold, "66")}, transparent 65%)`,
                  zIndex: 5,
                  transform: `scale(${f.scale})`,
                  opacity: f.opacity,
                }}
              />
            ))}
            {settled && <PulseRings size={460} count={3} thickness={2} color={G.green} />}
            <div
              style={{
                width: 340,
                height: 430,
                borderRadius: 36,
                background: "linear-gradient(160deg, #202124, #0b0b0b)",
                border: `1px solid ${G.ink2}`,
                boxShadow: terminalGlow,
                padding: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* terminal screen */}
              <div
                style={{
                  flex: 1,
                  borderRadius: 22,
                  background: settled ? withAlpha(G.green, "10") : "#000",
                  border: `1px solid ${settled ? withAlpha(G.green, "55") : G.ink2}`,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* contact glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 8% 50%, ${withAlpha(G.gold, "4D")}, transparent 70%)`,
                    opacity: screenGlow,
                    pointerEvents: "none",
                  }}
                />
                {/* header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: DEMO_FONT, fontSize: 16, fontWeight: 700, color: G.white }}>
                    Tap to Pay
                  </span>
                  {checking ? (
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 13, fontWeight: 600, color: G.gold }}>
                      checking…
                    </span>
                  ) : settled ? (
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 13, fontWeight: 600, color: G.green }}>
                      settled
                    </span>
                  ) : (
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 13, fontWeight: 600, color: G.slate }}>
                      online
                    </span>
                  )}
                </div>

                {/* amount */}
                <div style={{ textAlign: "center", padding: "6px 0" }}>
                  <div style={{ fontFamily: DEMO_FONT, fontSize: 15, color: G.slate, fontWeight: 500 }}>
                    {checking ? "Checking agent balance…" : "Amount"}
                  </div>
                  <div style={{ fontFamily: DEMO_FONT, fontSize: 38, color: G.white, fontWeight: 800, marginTop: 2 }}>
                    {AMOUNT.toFixed(2)} <span style={{ fontSize: 20, color: G.gold }}>XLM</span>
                  </div>
                </div>

                {/* status line */}
                <div style={{ minHeight: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {checking ? (
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 14, color: G.gold, fontWeight: 600 }}>
                      balance ✓ → authorizing…
                    </span>
                  ) : settled ? (
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 14, color: G.green, fontWeight: 700 }}>
                      3 payments · 1 transaction
                    </span>
                  ) : authCount > 0 ? (
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 14, color: G.white, fontWeight: 600 }}>
                      ✓ authorized — payment queued
                    </span>
                  ) : (
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 14, color: G.slate, fontWeight: 500 }}>
                      Ready to tap
                    </span>
                  )}
                </div>

                {/* queue list */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 11, color: G.slate, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>
                      Pending queue
                    </span>
                    <span
                      style={{
                        fontFamily: DEMO_FONT,
                        fontSize: 11,
                        fontWeight: 700,
                        color: pending > 0 ? G.gold : G.slate,
                      }}
                    >
                      {pending > 0 ? `${pending} pending` : settled ? "0 · claimed" : "0"}
                    </span>
                  </div>
                  {queueRows.map((i) => {
                    const visible = authCount >= i;
                    const rowScale = visible
                      ? interpolate(frame, [CONTACT + CHECK_LEN + (i - 1) * 42, CONTACT + CHECK_LEN + (i - 1) * 42 + 10], [0.85, 1], clamp)
                      : 0.85;
                    const rowOpacity = visible
                      ? interpolate(frame, [CONTACT + CHECK_LEN + (i - 1) * 42, CONTACT + CHECK_LEN + (i - 1) * 42 + 8], [0, 1], clamp)
                      : 0;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: withAlpha(G.grey200, "0A"),
                          borderRadius: 8,
                          padding: "6px 10px",
                          marginBottom: 5,
                          opacity: settled ? 0.45 : rowOpacity,
                          transform: `scale(${settled ? 0.97 : rowScale})`,
                        }}
                      >
                        <Icon name="receipt" size={14} color={settled ? G.green : G.gold} />
                        <span style={{ fontFamily: DEMO_FONT, fontSize: 12, color: G.white, fontWeight: 600, flex: 1 }}>
                          Tap {i} · {AMOUNT.toFixed(2)} XLM
                        </span>
                        <span
                          style={{
                            fontFamily: DEMO_FONT,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: settled ? withAlpha(G.green, "1A") : withAlpha(G.yellow, "1A"),
                            color: settled ? G.green : G.yellow,
                          }}
                        >
                          {settled ? "settled" : "pending"}
                        </span>
                      </div>
                    );
                  })}
                  {authCount === 0 && (
                    <div style={{ fontFamily: DEMO_FONT, fontSize: 11, color: G.slate, textAlign: "center", paddingTop: 8 }}>
                      No payments yet — tap a card when ready.
                    </div>
                  )}
                </div>

                {/* escrow + settle */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 10,
                      background: withAlpha(G.gold, "12"),
                      border: `1px solid ${withAlpha(G.gold, "30")}`,
                    }}
                  >
                    <Icon name="wallet" size={13} color={G.gold} />
                    <span style={{ fontFamily: DEMO_FONT, fontSize: 11, fontWeight: 700, color: G.gold }}>
                      ESCROW {escrow.toFixed(2)} XLM
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "7px 14px",
                      borderRadius: 10,
                      background: claiming ? withAlpha(G.yellow, "20") : settled ? withAlpha(G.green, "1A") : withAlpha(G.gold, "18"),
                      border: `1px solid ${claiming ? withAlpha(G.yellow, "50") : settled ? withAlpha(G.green, "45") : withAlpha(G.gold, "35")}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: DEMO_FONT,
                        fontSize: 11,
                        fontWeight: 800,
                        color: claiming ? G.yellow : settled ? G.green : G.gold,
                      }}
                    >
                      {claiming ? "claiming…" : settled ? "claim settled" : "batch settle"}
                    </span>
                  </div>
                </div>
              </div>

              {/* brand bar */}
              <div
                style={{
                  marginTop: 12,
                  textAlign: "center",
                  fontFamily: DEMO_FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 2,
                  color: G.slate,
                }}
              >
                NOIR · ESCROW POS
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Caption */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
        <div style={{ ...useReveal(8, 26), textAlign: "center", maxWidth: 1160 }}>
          <div
            style={{
              fontFamily: DEMO_FONT,
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: G.white,
            }}
          >
            Authorize in a tap. Settle in a batch.
          </div>
          <div style={{ fontFamily: DEMO_FONT, fontSize: 26, fontWeight: 400, color: G.grey200, marginTop: 12 }}>
            Every tap just checks the agent's escrow balance and queues the payment — no chain round-trip.
            Merchants settle the whole queue in one transaction: faster on-chain, tiny fees, fully offline.
          </div>
        </div>
      </AbsoluteFill>

      <Watermark dark />
    </AbsoluteFill>
  );
};
