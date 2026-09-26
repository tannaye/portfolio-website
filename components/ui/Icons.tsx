import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({ width: 20, height: 20, "aria-hidden": true, focusable: false, ...p });
const stroke = (p: P): P => ({
  ...base(p),
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const ArrowUpRight = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const ArrowRight = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);
export const ArrowLeft = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
);
export const ArrowUp = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M12 20V4M6 10l6-6 6 6" />
  </svg>
);
export const ArrowDown = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </svg>
);
export const Copy = (p: P) => (
  <svg {...stroke(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...stroke(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const Download = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const Sun = (p: P) => (
  <svg {...stroke(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);
export const Moon = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </svg>
);
export const Volume = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);
export const VolumeOff = (p: P) => (
  <svg {...stroke(p)}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </svg>
);
export const Play = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

/* Brand marks (simplified, single-colour) */
export const Instagram = (p: P) => (
  <svg {...stroke(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
export const TikTok = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1c-1.4.1-2.7-.3-3.9-1.1v5.9c0 3.9-3.2 6.3-6.5 5.8-2.7-.4-4.6-2.7-4.6-5.5 0-3.4 3-6 6.6-5.4v3.2c-1.6-.5-3.3.6-3.3 2.3 0 1.4 1.1 2.5 2.4 2.5 1.5 0 2.5-1.1 2.5-2.7V3h2.9Z" />
  </svg>
);
export const XLogo = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
  </svg>
);
export const LinkedIn = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 3A1.9 1.9 0 1 1 4.5 6.8 1.9 1.9 0 0 1 4.5 3ZM2.9 8.5h3.3V21H2.9V8.5Zm5.4 0h3.1v1.7h.1c.4-.8 1.5-2 3.2-2 3.4 0 4 2.2 4 5.1V21h-3.3v-6.9c0-1.6 0-3.7-2.3-3.7s-2.6 1.8-2.6 3.6v7H8.3V8.5Z" />
  </svg>
);
export const GitHub = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2.2Z" />
  </svg>
);

export const brandIcon = {
  Instagram,
  TikTok,
  X: XLogo,
  LinkedIn,
  GitHub,
} as const;
