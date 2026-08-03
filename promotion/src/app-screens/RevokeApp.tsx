import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Colors, Spacing, BorderRadius, FONT_SANS, FONT_MONO, withAlpha } from "../theme";
import { Icon } from "../components/Icon";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Frames relative to scene start (fps = 30). Scene fallback is 8.5s = 255 frames.
const CARD1 = 8; // Blue Keychain card rises in
const CARD2 = 22; // Office Card rises in
const TAP = 66; // user taps Revoke
const MODAL_IN = 74; // confirmation sheet slides up
const CONFIRM = 108; // user confirms
const SWEEP = 122; // funds sweep back to main wallet
const SWEEP_END = 180;
const TOAST = 196; // success toast

const RETURN_AMOUNT = 42.5; // full agent balance swept back to the main wallet

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/** Recreation of the app's revoke-agent flow: tap revoke, confirm, funds return. */
export const RevokeApp: React.FC = () => {
  const frame = useCurrentFrame();

  const rise = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 18], [0, 1], clamp),
    transform: `translateY(${interpolate(frame, [delay, delay + 22], [24, 0], {
      ...clamp,
      easing: ease,
    })}px)`,
  });

  // Revoke pill press
  const press = interpolate(frame, [TAP, TAP + 4, TAP + 9], [1, 0.9, 1], clamp);
  const confirmPress = interpolate(frame, [CONFIRM, CONFIRM + 4, CONFIRM + 9], [1, 0.92, 1], clamp);

  // Confirmation sheet
  const modalVisible = frame >= MODAL_IN && frame < CONFIRM + 8;
  const modalRise = interpolate(frame, [MODAL_IN, MODAL_IN + 16], [360, 0], {
    ...clamp,
    easing: ease,
  });
  const modalLeave = interpolate(frame, [CONFIRM + 8, CONFIRM + 24], [0, 380], {
    ...clamp,
    easing: ease,
  });
  const modalY = frame >= CONFIRM + 8 ? modalLeave : modalRise;
  const backdropOpacity = interpolate(
    frame,
    [MODAL_IN, MODAL_IN + 12, CONFIRM + 8, CONFIRM + 20],
    [0, 1, 1, 0],
    clamp,
  );

  // Funds return sweep
  const sweep = interpolate(frame, [SWEEP, SWEEP_END], [0, 1], { ...clamp, easing: ease });
  const returned = RETURN_AMOUNT * sweep;
  const returnedFmt = returned.toFixed(2);
  const revoked = frame >= SWEEP + 30;

  // Second card stays untouched but dims under the revocation to keep focus on card 1
  const card2Opacity = revoked ? 0.55 : interpolate(frame, [CARD2, CARD2 + 18], [0, 1], clamp);

  // Chip flies from the card up toward the main-wallet pill
  const chipY = interpolate(sweep, [0, 1], [0, -150]);
  const chipScale = interpolate(sweep, [0, 0.25, 1], [0, 1.1, 1], clamp);
  const chipOpacity = interpolate(frame, [SWEEP, SWEEP + 10, SWEEP_END, SWEEP_END + 10], [0, 1, 1, 0], clamp);

  // Toast
  const toastY = interpolate(frame, [TOAST, TOAST + 16], [90, 0], { ...clamp, easing: ease });
  const toastOpacity = interpolate(frame, [TOAST, TOAST + 12], [0, 1], clamp);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: Colors.black,
        fontFamily: FONT_SANS,
        padding: `${Spacing.sm}px ${Spacing.md}px`,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: `${Spacing.md}px 0`, ...rise(0) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 28, color: Colors.cream, fontWeight: 800 }}>Agents</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: BorderRadius.full,
              background: withAlpha(Colors.gold, "15"),
              border: `1px solid ${withAlpha(Colors.gold, "25")}`,
            }}
          >
            <Icon name="arrow-down" size={13} color={Colors.gold} />
            <span
              style={{
                fontSize: 12,
                color: Colors.gold,
                fontWeight: 700,
                fontFamily: FONT_MONO,
              }}
            >
              +{returnedFmt} XLM
            </span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: Colors.mutedWhite, marginTop: 6, lineHeight: 1.5 }}>
          Autonomous wallets linked to your NFC devices for tap-and-go payments.
        </div>
      </div>

      {/* Agent card being revoked */}
      <div
        key="blue"
        style={{
          background: revoked ? withAlpha(Colors.mutedWhite, "0A") : Colors.cardBg,
          border: `1px solid ${
            revoked ? withAlpha(Colors.mutedWhite, "25") : frame >= SWEEP ? withAlpha(Colors.danger, "40") : Colors.borderGrey
          }`,
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          marginBottom: Spacing.md,
          ...rise(CARD1),
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: Spacing.md,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: Spacing.md }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: revoked ? withAlpha(Colors.mutedWhite, "0F") : withAlpha(Colors.gold, "15"),
                border: `1px solid ${revoked ? withAlpha(Colors.mutedWhite, "20") : withAlpha(Colors.gold, "25")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="flash" size={22} color={revoked ? Colors.mutedWhite : Colors.gold} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  color: revoked ? Colors.mutedWhite : Colors.white,
                  fontWeight: 700,
                  textDecoration: revoked ? "line-through" : "none",
                }}
              >
                Blue Keychain
              </div>
              <div style={{ fontSize: 11, color: Colors.mutedWhite, fontFamily: FONT_MONO, marginTop: 2 }}>
                GC7X9F2A...4K9P2M
              </div>
            </div>
          </div>
          {revoked ? (
            <div
              style={{
                padding: "3px 10px",
                borderRadius: BorderRadius.full,
                background: Colors.lightGrey,
              }}
            >
              <span style={{ fontSize: 11, color: Colors.mutedWhite, fontWeight: 600, fontStyle: "italic" }}>
                revoked
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: BorderRadius.full,
                  background: withAlpha(Colors.success, "20"),
                }}
              >
                <span style={{ fontSize: 11, color: Colors.success, fontWeight: 600 }}>active</span>
              </div>
              <button
                style={{
                  border: `1px solid ${withAlpha(Colors.danger, "45")}`,
                  background: withAlpha(Colors.danger, "12"),
                  borderRadius: BorderRadius.full,
                  padding: "5px 14px",
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                  transform: `scale(${frame >= CONFIRM ? confirmPress : press})`,
                }}
              >
                <span style={{ fontSize: 12, color: Colors.danger, fontWeight: 700 }}>Revoke</span>
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: Spacing.md, marginBottom: Spacing.md }}>
          <div
            style={{
              flex: 1,
              background: Colors.lightGrey,
              borderRadius: BorderRadius.md,
              padding: Spacing.sm,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: Colors.mutedWhite, marginBottom: 2 }}>Balance</div>
            <div
              style={{
                fontSize: 18,
                color: revoked ? Colors.mutedWhite : Colors.white,
                fontWeight: 700,
                fontFamily: FONT_MONO,
              }}
            >
              {revoked ? "0.00" : RETURN_AMOUNT.toFixed(2)} XLM
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: Colors.lightGrey,
              borderRadius: BorderRadius.md,
              padding: Spacing.sm,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: Colors.mutedWhite, marginBottom: 2 }}>Remaining</div>
            <div
              style={{
                fontSize: 18,
                color: revoked ? Colors.mutedWhite : Colors.gold,
                fontWeight: 700,
                fontFamily: FONT_MONO,
              }}
            >
              {(revoked ? 0 : RETURN_AMOUNT - 11.25).toFixed(2)} XLM
            </div>
          </div>
        </div>

        <div style={{ height: 4, borderRadius: 2, background: Colors.lightGrey, marginBottom: 6 }}>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: revoked ? Colors.mutedWhite : Colors.gold,
              width: `${(1 - sweep) * 26}%`,
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: Colors.mutedWhite }}>
          {revoked ? "Funds returned · device disabled on-chain" : "11.25 XLM spent of 42.50 XLM budget"}
        </div>
      </div>

      {/* Funds chip flying to the header */}
      {sweep > 0 && (
        <div
          style={{
            position: "absolute",
            right: 52,
            top: 178,
            opacity: chipOpacity,
            transform: `translateY(${chipY}px) scale(${chipScale})`,
            zIndex: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: BorderRadius.full,
              background: Colors.gold,
              boxShadow: `0 6px 24px ${withAlpha(Colors.gold, "55")}`,
            }}
          >
            <Icon name="arrow-down" size={14} color={Colors.black} />
            <span style={{ fontSize: 13, color: Colors.black, fontWeight: 800, fontFamily: FONT_MONO }}>
              {returnedFmt} XLM
            </span>
          </div>
        </div>
      )}

      {/* Second agent (untouched) */}
      <div
        key="office"
        style={{
          background: Colors.cardBg,
          border: `1px solid ${Colors.borderGrey}`,
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          marginBottom: Spacing.md,
          opacity: card2Opacity,
          transform: `translateY(${interpolate(frame, [CARD2, CARD2 + 22], [24, 0], {
            ...clamp,
            easing: ease,
          })}px)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: Spacing.md }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: withAlpha(Colors.gold, "15"),
                border: `1px solid ${withAlpha(Colors.gold, "25")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="card" size={22} color={Colors.gold} />
            </div>
            <div>
              <div style={{ fontSize: 15, color: Colors.white, fontWeight: 700 }}>Office Card</div>
              <div style={{ fontSize: 11, color: Colors.mutedWhite, fontFamily: FONT_MONO, marginTop: 2 }}>
                GB3M8R1D...7Q2W5X
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "3px 10px",
              borderRadius: BorderRadius.full,
              background: withAlpha(Colors.success, "20"),
            }}
          >
            <span style={{ fontSize: 11, color: Colors.success, fontWeight: 600 }}>active</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.sm,
          padding: `${Spacing.md}px 0`,
          borderRadius: BorderRadius.md,
          border: `1px dashed ${Colors.borderGrey}`,
          ...rise(36),
        }}
      >
        <Icon name="add" size={22} color={Colors.gold} />
        <span style={{ fontSize: 15, color: Colors.gold, fontWeight: 600 }}>Link Another Device</span>
      </div>

      {/* Confirmation sheet */}
      {modalVisible && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              opacity: backdropOpacity,
              zIndex: 20,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              background: Colors.cardBg,
              borderTop: `1px solid ${Colors.borderGrey}`,
              borderTopLeftRadius: BorderRadius.xl,
              borderTopRightRadius: BorderRadius.xl,
              padding: Spacing.lg,
              paddingBottom: Spacing.xl,
              transform: `translateY(${modalY}px)`,
              opacity: backdropOpacity,
              zIndex: 21,
            }}
          >
            <div
              style={{
                width: 44,
                height: 5,
                borderRadius: 3,
                background: Colors.borderGrey,
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: withAlpha(Colors.danger, "15"),
                border: `1px solid ${withAlpha(Colors.danger, "30")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: Spacing.md,
              }}
            >
              <Icon name="shield" size={28} color={Colors.danger} />
            </div>
            <div style={{ fontSize: 21, color: Colors.white, fontWeight: 800 }}>
              Revoke Blue Keychain?
            </div>
            <div
              style={{
                fontSize: 13,
                color: Colors.mutedWhite,
                lineHeight: 1.55,
                marginTop: Spacing.sm,
                marginBottom: Spacing.lg,
              }}
            >
              The agent stops paying immediately and <span style={{ color: Colors.gold, fontWeight: 700 }}>42.50 XLM</span>{" "}
              returns to your main wallet.
            </div>
            <div style={{ display: "flex", gap: Spacing.sm }}>
              <div
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: BorderRadius.md,
                  background: Colors.lightGrey,
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 14, color: Colors.white, fontWeight: 700 }}>Cancel</span>
              </div>
              <div
                style={{
                  flex: 1.4,
                  padding: "13px 0",
                  borderRadius: BorderRadius.md,
                  background: Colors.danger,
                  textAlign: "center",
                  boxShadow: `0 6px 20px ${withAlpha(Colors.danger, "45")}`,
                }}
              >
                <span style={{ fontSize: 14, color: Colors.white, fontWeight: 800 }}>Revoke agent</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success toast */}
      {frame >= TOAST && (
        <div
          style={{
            position: "absolute",
            left: Spacing.md,
            right: Spacing.md,
            bottom: Spacing.lg,
            display: "flex",
            alignItems: "center",
            gap: Spacing.sm,
            background: "#0E2017",
            border: `1px solid ${withAlpha(Colors.success, "45")}`,
            borderRadius: BorderRadius.md,
            padding: `${Spacing.sm}px ${Spacing.md}px`,
            opacity: toastOpacity,
            transform: `translateY(${toastY}px)`,
            zIndex: 25,
          }}
        >
          <Icon name="checkmark-circle" size={20} color={Colors.success} />
          <span style={{ fontSize: 13, color: Colors.success, fontWeight: 700 }}>
            {returnedFmt} XLM returned to your main wallet
          </span>
        </div>
      )}
    </div>
  );
};
