import type { CSSProperties } from "react";

/**
 * Figma's "Noise" effect (monotone, black 25 %) as a layer of its own, rebuilt from the filters the
 * team's SVG exports carry: fractal noise → luminance → a hard threshold → black specks at 25 %.
 * Drawn as a stitched 256-unit tile instead of a full-board filter (a 1920-wide feTurbulence +
 * blur is a heavy paint), sized as a 1920th of the viewport so the speck size follows the board.
 *
 * Defaults = the page grain (public/background/background-lines.svg): baseFrequency 0.769, seed
 * 6207, specks where luminance < 51 %, layered at 30 % (BackgroundLines' own knob). Server
 * component, no JS.
 */
const TILE = 256;

function tileUrl(freq: number, seed: number, cut: number) {
  const table = `${"1 ".repeat(cut)}${"0 ".repeat(100 - cut)}`.trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><filter id="n" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="luminanceToAlpha"/><feComponentTransfer><feFuncA type="discrete" tableValues="${table}"/></feComponentTransfer><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function Noise({
  opacity = 0.3,
  freq = 0.76923,
  seed = 6207,
  cut = 51,
  tile = `calc(100vw * ${TILE} / 1920)`,
  className = "",
  style,
}: {
  /** layer opacity — 0.3 is the page grain's; a board's own Noise effect is drawn at 1 */
  opacity?: number;
  /** feTurbulence baseFrequency, as in the export */
  freq?: number;
  /** feTurbulence seed, as in the export */
  seed?: number;
  /** % of the luminance range that becomes a speck (the export's run of 1s in tableValues) */
  cut?: number;
  /** rendered tile size; the default follows the board at every width */
  tile?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 mix-blend-multiply ${className}`}
      style={{ backgroundImage: tileUrl(freq, seed, cut), backgroundSize: `${tile} ${tile}`, opacity, ...style }}
    />
  );
}
