import type { CSSProperties } from "react";

// Shared by the board-built pages (/features, /agents). Every length is the Figma board's px × --s
// (globals.css: 100vw / 1920 — the same scale the landing uses), so a page IS the board at 1920 and
// the board scaled at any other width. Fonts get a px floor so phones stay readable.

/** board px → CSS length on the page's scale */
export const s = (n: number) => `calc(var(--s) * ${n})`;

/** board px font size with a readable floor for small screens */
export const fz = (n: number, min: number) => `max(${min}px, calc(var(--s) * ${n}))`;

/** Space Grotesk at the board's tracking (−2% everywhere) and `line-height: normal` */
export const txt = (
  size: number,
  min: number,
  weight: 300 | 400 | 500,
  color = "rgba(255,255,255,0.8)",
): CSSProperties => ({
  fontSize: fz(size, min),
  fontWeight: weight,
  letterSpacing: "-0.02em",
  lineHeight: "normal",
  color,
});

/** The board's outline button: 1px white .6, radius 40, 44 tall, 22 side padding, 14 Medium .7 */
export const btnStyle = (w: number): CSSProperties => ({
  ...txt(14, 13, 500, "rgba(255,255,255,0.7)"),
  minWidth: s(w),
  height: fz(44, 40),
  paddingInline: s(22),
  borderRadius: 40,
  border: "1px solid rgba(255,255,255,0.6)",
});

/** hover classes that go with btnStyle (inline styles need !important to be overridden) */
export const BTN_BRAND_HOVER =
  "inline-flex items-center justify-center transition-colors duration-300 ease-out hover:!border-brand hover:!text-brand";
export const BTN_WHITE_HOVER =
  "inline-flex items-center justify-center transition-colors duration-300 ease-out hover:!border-white hover:!text-white";
