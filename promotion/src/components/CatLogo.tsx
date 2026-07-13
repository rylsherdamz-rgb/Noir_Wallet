import React from "react";
import { Img, staticFile } from "remotion";
import { Colors, withAlpha } from "../theme";

interface CatLogoProps {
  /** Diameter of the logo mark in px. */
  size?: number;
  /** Show the circular gold-tinted container ring (as on the Welcome screen). */
  ring?: boolean;
}

/**
 * The real Noir Wallet cat-head mark (frontend/assets/logo.jpg), presented the
 * same way as the app's <NoirLogo variant="mark" /> inside a gold-tinted circle.
 */
export const CatLogo: React.FC<CatLogoProps> = ({ size = 80, ring = true }) => {
  const img = (
    <Img
      src={staticFile("logo.jpg")}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        objectFit: "contain",
      }}
    />
  );

  if (!ring) return img;

  const box = size * 1.5;
  return (
    <div
      style={{
        width: box,
        height: box,
        borderRadius: box / 2,
        backgroundColor: withAlpha(Colors.gold, "10"),
        border: `1px solid ${withAlpha(Colors.gold, "20")}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {img}
    </div>
  );
};
