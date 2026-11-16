import type { CSSProperties } from "react";
import {
  INSET_VW,
  COLUMN_PITCH,
  ROW_PITCH,
  HEADER_HEIGHT_PX,
  LINE_COLOR,
  LINE_W,
  LINE_HALF,
  NUM_COLUMNS,
} from "@/lib/grid";

const ROW_GRID_TOP = `calc(var(--header-h, ${HEADER_HEIGHT_PX}px) + var(--grid-row, ${ROW_PITCH}))`; // first horizontal line sits one full (vw-scaled) row pitch below the header, so that gap matches every later gap at any viewport width — none render inside the header row itself (its own border-b is the only line at that seam)


// Literal class strings (not built from a template-interpolated variable) — Tailwind's build-time scanner needs the
// exact "min-[1800px]:hidden" text to appear in the source to generate that utility; a `` `min-[${x}px]:hidden` ``
// template would be invisible to it and silently produce no CSS at all.
//
// The narrow one is `max-[1800px]`, NOT `max-[1799px]`, and that is deliberate: Tailwind v4 compiles
// `max-[Npx]` to `@media not (min-width: Npx)`, i.e. strictly LESS than N — so the old
// `max-[1799px]` left a one-pixel hole at exactly 1799px where neither rule matched and every
// column showed (measured 2026-09-20 at 1798/1799/1800). `max-[1800px]` is the exact complement of
// `min-[1800px]`, so the two can no longer disagree at any width.
/** rows for the longest page: /features is ~7 300 board px tall; 140 × 114 ≈ 16 000 */
const ROW_COUNT = 140;

const HIDDEN_AT_WIDE = "min-[1800px]:hidden";
const HIDDEN_AT_NARROW = "max-[1800px]:hidden";

export function ColumnLines({
  hideWide,
  hideNarrow,
  className,
  style,
  color = LINE_COLOR,
}: {
  hideWide: Set<number>;
  hideNarrow: Set<number>;
  className: string;
  style: CSSProperties;
  color?: string;
}) {
  return (
    <div className={className} style={style}>
      {Array.from({ length: NUM_COLUMNS }, (_, idx) => {
        const col = idx + 1;
        const visibilityClass = [
          hideWide.has(col) ? HIDDEN_AT_WIDE : "",
          hideNarrow.has(col) ? HIDDEN_AT_NARROW : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div
            key={col}
            data-col={col}
            className={`absolute top-0 h-full ${visibilityClass}`}
            style={{
              left: `calc(${idx} * ${COLUMN_PITCH} - ${LINE_HALF})`,
              width: LINE_W,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * The grid itself, as CSS gradient layers — three absolutely-positioned children that expect a
 * positioned parent spanning the viewport.
 */
function CssGridLines({ color = LINE_COLOR }: { color?: string }) {
  return (
    <>
      {/* Header-band column lines are NOT rendered here — this whole layer sits behind the sticky
          header's own `backdrop-blur-md` (see Header.tsx), and at this grid's real production
          opacity (2%) the blur+60%-tint washes them out to fully invisible (confirmed 2026-09-18 via
          a Playwright pixel check: a solid, fully-opaque red override in this band produced zero
          visible pixels through the header, while the identical override one row below painted
          cleanly). Rendered instead as a child of <header> itself, above its blur/tint layer, so it
          reads at the same weight as the rest of the page's grid instead of being dampened by it. */}
      {/* vertical column lines — the full, unbroken grid from the header's bottom edge down.
          There used to be a one-row band right under the header in which the middle (nav)
          columns stayed hidden; team feedback 2026-09-29 ("ხაზების ბოლომდე აწევა header-თან")
          asked for every column to run all the way up to the header instead. Inside the header
          itself the nav gap stays (Header.tsx's own ColumnLines). */}
      {/* Lines are real 1-line DIVs, not repeating gradients (2026-11-16: "ზოგ ზუმზე ხაზები
          ქრება"). A gradient stop thinner than a device pixel, or one that falls between two, is
          dropped or halved by the rasteriser depending on zoom and width; a positioned box is
          snapped to whole device pixels instead, so every line always paints. Extra columns /
          rows past the layer's edge are clipped (overflow-hidden), which is how the same markup
          serves the 22-column desktop grid and the 6/10-column phone and tablet grids.
          --grid-* / --header-h (globals.css) equal INSET_VW / COLUMN_PITCH / 96px on desktop; below
          1024 they switch to a phone/tablet grid whose last line lands exactly on the right inset. */}
      <div
        className="absolute bottom-0 overflow-hidden"
        style={{
          left: `var(--grid-inset, ${INSET_VW})`,
          right: `calc(var(--grid-inset, ${INSET_VW}) - var(--grid-edge, 0px) - ${LINE_W})`,
          top: `var(--header-h, ${HEADER_HEIGHT_PX}px)`,
        }}
      >
        {Array.from({ length: NUM_COLUMNS }, (_, i) => (
          <div
            key={i}
            className="absolute inset-y-0"
            style={{ left: `calc(${i} * var(--grid-pitch, ${COLUMN_PITCH}) - ${LINE_HALF})`, width: LINE_W, backgroundColor: color }}
          />
        ))}
      </div>
      {/* horizontal row lines — full viewport width, starting one row below the header so none land
          inside it. ROW_COUNT covers the longest page at any scale; the rest is clipped. */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: ROW_GRID_TOP }}>
        {Array.from({ length: ROW_COUNT }, (_, i) => (
          <div
            key={i}
            className="absolute inset-x-0"
            style={{ top: `calc(${i} * var(--grid-row, ${ROW_PITCH}))`, height: LINE_W, backgroundColor: color }}
          />
        ))}
      </div>
    </>
  );
}

export function BackgroundLines() {
  return (
    // FIXED to the viewport, not to the page — the header-band column lines always line up with the
    // sticky header, and pinned/scrolling content never shows the grid sliding behind it.
    // `bg-lines`: on the long scrolling pages (/features, /agents — they carry [data-grid-scroll]) this
    // layer is switched from fixed to absolute in globals.css, so the grid scrolls WITH the content,
    // as on the Figma boards, where the cards' corner marks sit on the grid's crossings.
    <div aria-hidden className="bg-lines pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* The design's #00000040 layer, VARIANT (B): below the grain and the grid, i.e. it only
          darkens the page colour and the lines keep their full strength. One variable picks which
          of the two is live — see --bg-tint-above in globals.css. The two layers are deliberately
          both in the DOM: switching is then a repaint, not a re-render. */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--bg-tint)", opacity: "calc(1 - var(--bg-tint-above, 1))" }}
      />
      {/* Grain texture (Figma's own `feTurbulence` noise filter, exported as-is in the SVG) —
          at full opacity its thresholded noise reads as scattered white dots in some browsers
          (`feFuncA type="discrete"` makes a binary stipple pattern by construction, and some
          browsers rasterize the filter at a capped resolution before scaling, exaggerating the
          dots). Cut opacity here (CSS, not touching the Figma-exported SVG itself) so it stays a
          one-line, easily reversible knob. */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-multiply"
        style={{
          backgroundImage: "url(/background/background-lines.svg)",
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% auto",
        }}
      />
      <CssGridLines />
      {/* Same layer, VARIANT (A): on top of the grain AND the grid, so it dims those too — the
          literal reading of the Figma file, where #00000040 is the topmost background layer. */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--bg-tint)", opacity: "var(--bg-tint-above, 1)" }}
      />
    </div>
  );
}
