import React from "react";

type IconName =
  | "radio"
  | "flash"
  | "cube"
  | "arrow-up"
  | "arrow-down"
  | "arrow-right"
  | "receipt"
  | "person"
  | "cash"
  | "planet"
  | "usd"
  | "checkmark-circle"
  | "add"
  | "wallet"
  | "copy"
  | "share"
  | "swap"
  | "code"
  | "chevron"
  | "water"
  | "card"
  | "close"
  | "search"
  | "shield";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Minimal stroked icons that echo Ionicons' outline set used across the app.
const PATHS: Record<IconName, React.ReactNode> = {
  radio: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a9.5 9.5 0 0 0 0 14M19 5a9.5 9.5 0 0 1 0 14" />
    </>
  ),
  flash: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />,
  cube: (
    <>
      <path d="M12 2 3 7v10l9 5 9-5V7z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </>
  ),
  "arrow-up": <path d="M12 20V5M6 11l6-6 6 6" />,
  "arrow-down": <path d="M12 4v15M6 13l6 6 6-6" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  receipt: (
    <>
      <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3l-2 1.5L15 3l-2 1.5L11 3 9 4.5 7 3z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  planet: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M4 8c6 5 12 8 17 6" />
    </>
  ),
  usd: <path d="M12 3v18M8 7.5A3.5 3.5 0 0 1 11.5 4h1a3.5 3.5 0 0 1 0 7h-1a3.5 3.5 0 0 0 0 7h1a3.5 3.5 0 0 0 3.5-3.5" />,
  "checkmark-circle": (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M7.5 12.5l3 3 6-6.5" />
    </>
  ),
  add: <path d="M12 5v14M5 12h14" />,
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 9h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3" />
      <circle cx="16" cy="13" r="1" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </>
  ),
  swap: <path d="M7 4v13M7 4L3.5 7.5M7 4l3.5 3.5M17 20V7M17 20l3.5-3.5M17 20l-3.5-3.5" />,
  code: <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  water: <path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3z" />,
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M8.5 12l2.5 2.5L15.5 9.5" />
    </>
  ),
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#fff",
  strokeWidth = 1.8,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {PATHS[name]}
  </svg>
);
