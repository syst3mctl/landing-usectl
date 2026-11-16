// Shared constants for the page's background grid (see BackgroundLines.tsx) — anything that needs
// to align with the grid should import from here instead of hardcoding its own copy of these
// numbers, so the two can't silently drift apart.

const CANVAS_WIDTH_REF = 1920; // Figma canvas reference width

// The narrowest width the design scales down to — below it --s stops shrinking (see globals.css).
const SCALE_FLOOR_WIDTH = 1024; // was 1280; lowered 2026-09-29 so 1024-1279 tablets (landscape) get the whole desktop scene scaled to fit instead of clipped at the right edge
const SCALE_FLOOR = SCALE_FLOOR_WIDTH / CANVAS_WIDTH_REF; // 0.53333

// THE way to write a design measurement in CSS. `s(136)` means "136px at 1920, proportionally less
// below, proportionally more above" — see the --s comment in globals.css. It works anywhere a length
// does: inline styles, Tailwind arbitrary values (`text-[calc(var(--s)*136)]`), inside calc().
export const s = (px: number) => `calc(var(--s) * ${px})`;

// The historical name for the same thing (used below for the grid geometry).
const vw = (px: number) => s(px);

// The same factor as a NUMBER, for the GSAP/JS side (px offsets, pin distances). Reads the
// resolved custom property so the CSS stays the single source of truth; the innerWidth fallback
// covers non-browser paths and mirrors the formula in globals.css.
export const readScale = (): number => {
  if (typeof window === "undefined") return 1;
  const raw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--s"));
  if (Number.isFinite(raw) && raw > 0) return raw;
  return Math.max(SCALE_FLOOR, window.innerWidth / CANVAS_WIDTH_REF);
};

export const INSET_VW = vw(99); // content container inset — must stay in sync with Header.tsx's own left/right padding
export const COLUMN_PITCH = vw(82); // vertical line spacing
export const ROW_PITCH = vw(114); // horizontal line spacing
export const HEADER_HEIGHT_PX = 96; // Header.tsx h-24 — fixed on purpose, does NOT scale

export const NUM_COLUMNS = 22; // 1722 / 82 + 1, matches the confirmed x=99..1820 span

// The line's WEIGHT and COLOUR are CSS variables (--grid-line-w / --grid-line-color, defined in
// globals.css) rather than numbers baked in here, so both can be tuned in ONE place without
// touching any component. They were 2px / rgba(255,255,255,0.02) until 2026-11-16, when the design
// was matched properly: Figma strokes the grid at 0.05px, white 5%.
// Everything that draws a line uses these three strings; LINE_HALF is the half-weight offset that
// centres a line on its grid coordinate (a 0.5px line sits 0.25px left of the column's x).
export const LINE_W = "var(--grid-line-w, 0.5px)";
// 0 since 2026-11-16: centring the line on its x (−half its width) put a one-device-pixel line
// ACROSS two device pixels whenever x is a whole pixel, which the rasteriser paints as two
// half-strength pixels — the "faint / missing at some zoom levels" lines. Starting the line ON the
// x keeps it on one pixel; the shift is a quarter / half of a CSS pixel, invisible.
export const LINE_HALF = "0px";
export const LINE_COLOR = "var(--grid-line-color, rgba(255,255,255,0.05))";

// Explicit hide-lists for vertical columns — replaces four failed CSS-mask attempts (mask-composite, data-URI SVG
// mask, inline SVG mask with userSpaceOnUse, inline SVG mask with objectBoundingBox — see PROJECT.md for why).
// Column numbers are 1-indexed left to right (BackgroundLines' data-col attribute matches).
// "Start" columns (2-3) sit under the header logo; "middle" columns (9-14 wide / 8-15 narrow) sit under the header
// nav text. The middle gap continues for exactly one row below the header, then the rest of the page shows the
// full, unbroken grid.
const START_COLUMNS = new Set([2, 3]);
const MIDDLE_COLUMNS_WIDE = new Set([9, 10, 11, 12, 13, 14]); // hidden at >=1800px (FullHD-ish)
const MIDDLE_COLUMNS_NARROW = new Set([8, 9, 10, 11, 12, 13, 14, 15]); // hidden below 1800px

export const HEADER_HIDE_WIDE = new Set([...START_COLUMNS, ...MIDDLE_COLUMNS_WIDE]);
export const HEADER_HIDE_NARROW = new Set([...START_COLUMNS, ...MIDDLE_COLUMNS_NARROW]);
