import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { btnStyle, BTN_BRAND_HOVER, fz, s, txt } from "@/components/page/scale";
import { ButtonArrow } from "@/components/ui/icons";
import { ctaAttr, SIGNUP_URL } from "@/lib/nav";
import type { Dict } from "@/lib/i18n";

// "The Substrate" — the band between the closing CTA and the footer on the landing page.
//
// It is page 8 of the scroll journey (SECTION_HASHES / PAGES_AFTER_PIN in lib/nav.ts): the pinned
// scene ends above it, so this is ordinary flow, and `data-page-after-pin="1"` is what
// HeroSectionClient scrolls to.
//
// 1:1 with Figma (Usectil-Landing → FullLanding → "Frame 1552", 1920 × 797), read 2026-11-16.
// Board px × --s (components/page/scale.ts). The page grid shows through, as on the board.
//   • tiles: the team's exports public/section-substrate/icon1–14.svg (76×76, tile included);
//     columns x 184 / 266 (left) and 1578 / 1660 (right); the outer columns hold 4 tiles at
//     y 70 / 242 / 424 / 624, the inner ones 3 at y 150 / 332 / 517
//   • under each tile a soft light: ellipse 49×11, #D9D9D9 40 %, layer blur 20, 60 below its top
//   • copy: eyebrow y258 (16 Light), H1 y279 (64 Medium), lead y377 (24 Light), button 227×48 y483
//   • the lights: two blurred ellipses rising from the bottom edge (see Glows)

const OUTER_Y = [70, 242, 424, 624];
const INNER_Y = [150, 332, 517];
// left: 1 outer, 2 inner, 3 outer, 4 inner, 5 outer, 6 inner, 7 outer — right: 8 … 14 the same way
const TILES: { n: number; x: number; y: number }[] = [
  ...[1, 3, 5, 7].map((n, i) => ({ n, x: 184, y: OUTER_Y[i] })),
  ...[2, 4, 6].map((n, i) => ({ n, x: 266, y: INNER_Y[i] })),
  ...[8, 10, 12, 14].map((n, i) => ({ n, x: 1660, y: OUTER_Y[i] })),
  ...[9, 11, 13].map((n, i) => ({ n, x: 1578, y: INNER_Y[i] })),
];

function Tile({ n, style }: { n: number; style?: CSSProperties }) {
  return (
    <div data-substrate-icon className="relative" style={{ width: s(76), height: s(76), minWidth: 44, minHeight: 44, ...style }}>
      {/* the soft light under the tile */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          left: "50%",
          top: s(60),
          width: s(49),
          height: s(11),
          transform: "translateX(-50%)",
          // board: #D9D9D9 40 %; the export's tile is see-through, so at 40 % it read as a white
          // blob — 22 % matches the board's render
          background: "rgba(217,217,217,0.22)",
          filter: `blur(${s(10)})`,
        }}
      />
      {/* board: each tile is a 76×76 r16 frame with Figma's Glass effect (white 1 % fill) — a
          frosted dark plate with a light rim, strongest at the top-left and bottom-right corners.
          The SVG export drops the effect, so it is rebuilt here; without it the glyphs float soft
          and washed-out on the background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: s(16),
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 45%, rgba(255,255,255,0.035) 100%), rgba(22,22,22,0.6)",
          backdropFilter: `blur(${s(4)})`,
          WebkitBackdropFilter: `blur(${s(4)})`,
          boxShadow: `0 ${s(8)} ${s(18)} rgba(0,0,0,0.35), inset 0 0 ${s(12)} rgba(255,255,255,0.03)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: s(16),
          padding: "1px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.08) 72%, rgba(255,255,255,0.32) 100%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        }}
      />
      <Image src={`/section-substrate/icon${n}.svg`} alt="" width={76} height={76} unoptimized className="relative h-full w-full" />
    </div>
  );
}

/** The board's two lights (Frame 1552, section px): Ellipse 1468 1988×970 at (−38, 600), #11A32A
 *  17 %; Ellipse 1469 509×528 at (0, 612), #0D9488 25 %; both layer blur 400 (≈ CSS blur 200) and
 *  clipped by the section — so all that shows is the glow rising from the bottom edge, teal on the
 *  left. (Their monotone-noise effect is left to the page's own grain.) */
function Glows() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute rounded-full" style={{ left: s(-38), top: s(600), width: s(1988), height: s(970), background: "rgba(17,163,42,0.17)", filter: `blur(${s(200)})` }} />
      <div className="absolute rounded-full" style={{ left: 0, top: s(612), width: s(509), height: s(528), background: "rgba(13,148,136,0.25)", filter: `blur(${s(200)})` }} />
    </div>
  );
}

export function SubstrateSection({ t }: { t: Dict }) {
  const copy = (
    <>
      <p className="flex items-center" style={{ ...txt(16, 13, 300), gap: s(6) }}>
        <Image src="/section-hero/hatch.svg" alt="" width={58} height={26} aria-hidden className="h-auto" style={{ width: `max(22px, ${s(31.8)})` }} />
        {t.substrate.eyebrow}
      </p>
      <h2 style={{ ...txt(64, 30, 500), maxWidth: s(1100) }}>{t.substrate.heading}</h2>
      <p style={{ ...txt(24, 15, 300), maxWidth: `max(300px, ${s(760)})`, marginTop: s(17) }}>{t.substrate.body}</p>
      <Link
        href={SIGNUP_URL}
        {...ctaAttr("substrate")}
        className={BTN_BRAND_HOVER}
        style={{ ...btnStyle(227), height: fz(48, 42), marginTop: s(45), gap: s(4) }}
      >
        {t.substrate.cta} <ButtonArrow size={fz(24, 20)} />
      </Link>
    </>
  );

  return (
    <section
      id="substrate"
      data-page-after-pin="1"
      // fills the screen below the header like a scene state does; the board's 797-tall canvas is
      // centred in it (a tall window used to leave the canvas glued to the top)
      className="relative flex scroll-mt-(--header-h) flex-col items-center justify-center overflow-hidden px-(--grid-inset) max-lg:py-16"
      style={{ minHeight: `max(calc(100svh - var(--header-h)), ${s(797)})` }}
    >
      {/* the hairline that separates the band from the scene above it */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/10" />

      {/* desktop: the board's 1920 × 797 canvas, centred; everything inside sits at board px */}
      <div className="relative hidden shrink-0 lg:block" style={{ width: s(1920), height: s(797) }}>
        <Glows />
        {TILES.map((tile) => (
          <Tile key={tile.n} n={tile.n} style={{ position: "absolute", left: s(tile.x), top: s(tile.y) }} />
        ))}
        <div className="absolute inset-x-0 flex flex-col items-center text-center" style={{ top: s(258) }}>
          {copy}
        </div>
      </div>

      {/* phone / tablet: copy, then the fourteen tiles in rows; the lights at the bottom */}
      <div className="contents lg:hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] overflow-hidden">
          <div className="absolute rounded-full" style={{ left: "-10%", bottom: "-40%", width: "120%", height: "90%", background: "rgba(17,163,42,0.17)", filter: "blur(80px)" }} />
          <div className="absolute rounded-full" style={{ left: "-10%", bottom: "-30%", width: "50%", height: "70%", background: "rgba(13,148,136,0.25)", filter: "blur(80px)" }} />
        </div>
        <div className="relative flex flex-col items-center text-center">{copy}</div>
        <div aria-hidden className="relative mt-10 flex max-w-[520px] flex-wrap justify-center gap-4">
          {Array.from({ length: 14 }, (_, i) => (
            <Tile key={i} n={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
