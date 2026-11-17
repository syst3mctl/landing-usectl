import Image from "next/image";
import type { ReactNode } from "react";
import { s, txt } from "./scale";

// The closing card of the board-built pages (Figma: /features "Group 1893", /agents "Group 1869").
// Board: 1394×298, 1px white .1, radius 53; inside: eyebrow +52, H2 32 Medium +87, body 16 Regular
// +140, buttons +202. Layer order is the board's: the card's fill, THEN the three glows (so they
// tint the card itself and the left one spills past its corner), THEN the copy.


export function CtaCard({
  eyebrow,
  heading,
  body,
  bodyWidth = 550,
  children,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  /** the body's text box on the board: 550 on /features, 580 on /agents */
  bodyWidth?: number;
  /** the buttons */
  children: ReactNode;
}) {
  return (
    <div data-fe-reveal className="relative mx-auto" style={{ width: `min(100%, ${s(1394)})` }}>
      <div
        aria-hidden
        className="absolute inset-0"
        // #1E1D1D under the page's #00000040 sheet (globals.css --bg-tint) = what the board shows:
        // the card reads as the page colour with the grid hidden, not as a lighter panel
        style={{ borderRadius: s(53), border: "1px solid rgba(255,255,255,0.1)", background: "var(--page)" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* board (card px), read from Figma 2026-11-16:
            Vector 202 — 422×268 at (466, 5.5), #11A32A 20 %, layer blur 80 (drawn at 22 % — 42 % read as
              too bright on screen, user 2026-11-16). Its mass is at the top
              (it lights the eyebrow and the card's top edge), drawn as a downward wedge.
            Vector 198 / 203 — 213×236 at (1215, 145) and (−83, −70), linear gradient
              #B6F1C0 → #11A32A, layer blur 200.
            Figma's layer-blur value is about twice CSS blur()'s radius. */}
        {/* blur on the wrapper, shape on the child: clip-path on the blurred element itself would
            cut the blur back to hard edges */}
        <div
          className="absolute"
          style={{
            left: `${(466 / 1394) * 100}%`,
            top: s(5.5),
            width: `${(422 / 1394) * 100}%`,
            height: s(268),
            filter: `blur(${s(40)})`,
          }}
        >
          <div
            className="h-full w-full"
            style={{ background: "rgba(17,163,42,0.22)", clipPath: "polygon(0 0, 100% 0, 62% 100%, 38% 100%)" }}
          />
        </div>
        {/* The side lights, Vector 198 (1215, 145) and 203 (−83, −70): 213×236, #B6F1C0 → #11A32A
            with translucent stops, layer blur 200. A PRE-RENDERED image (public/cta/glow-side.webp,
            made by scripts/make-cta-glow-side.py): the blob convolved with a true Gaussian (σ 100 ≈
            Figma's blur 200), peak ~6 % of its mean colour, and dithered in the alpha (±3 LSB) —
            a light this faint lifts the page only ~5–11 levels, and every CSS way of drawing it
            (blur(), a radial gradient, either with grain on top) quantised into visible rings
            ("spiral"). The image is 613×636 board px (the blob + 200 each side) at 1.5 px each, so
            on a retina screen it is drawn about 1:1 and the dither survives. */}
        {[
          { l: 1215, t: 145 },
          { l: -83, t: -70 },
        ].map((g, k) => (
          // eslint-disable-next-line @next/next/no-img-element -- a decorative, fixed-size layer; next/image adds nothing here
          <img
            key={k}
            src="/cta/glow-side.webp"
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute max-w-none select-none"
            style={{
              left: `${((g.l - 200) / 1394) * 100}%`,
              top: s(g.t - 200),
              width: `${(613 / 1394) * 100}%`,
              height: s(636),
            }}
          />
        ))}
      </div>
      <div
        className="relative flex flex-col items-center text-center"
        style={{ minHeight: s(298), padding: `${s(52)} ${s(24)} ${s(52)}` }}
      >
        <p className="flex items-center" style={{ ...txt(16, 12, 300), gap: s(6) }}>
          <Image
            src="/section-hero/hatch.svg"
            alt=""
            width={58}
            height={26}
            aria-hidden
            className="h-auto"
            style={{ width: `max(20px, ${s(31.8)})` }}
          />
          {eyebrow}
        </p>
        <h2 style={{ ...txt(32, 20, 500), marginTop: s(14) }}>{heading}</h2>
        <p style={{ ...txt(16, 13, 400), maxWidth: `max(260px, ${s(bodyWidth)})`, marginTop: s(12) }}>{body}</p>
        <div className="flex flex-wrap items-center justify-center" style={{ gap: s(18), marginTop: s(22) }}>
          {children}
        </div>
      </div>
    </div>
  );
}
