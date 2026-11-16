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
//   • the green light sits at the BOTTOM, strongest on the left (sampled from the board's render)

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
      <Image src={`/section-substrate/icon${n}.svg`} alt="" width={76} height={76} unoptimized className="relative h-full w-full" />
    </div>
  );
}

export function SubstrateSection({ t }: { t: Dict }) {
  return (
    <section
      id="substrate"
      data-page-after-pin="1"
      className="relative flex scroll-mt-(--header-h) flex-col items-center overflow-hidden px-(--grid-inset) max-lg:py-16 lg:block"
      style={{
        minHeight: `max(calc(100svh - var(--header-h)), ${s(797)})`,
        background:
          "radial-gradient(45% 55% at 17% 104%, rgba(35,150,85,0.30) 0%, rgba(35,150,85,0) 70%)," +
          "radial-gradient(55% 45% at 55% 108%, rgba(17,163,42,0.14) 0%, rgba(17,163,42,0) 70%)",
      }}
    >
      {/* the hairline that separates the band from the scene above it */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/10" />

      {/* desktop: the board's absolute tile positions on a 1920-wide canvas, centred */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 lg:block" style={{ width: s(1920) }}>
        {TILES.map((tile) => (
          <Tile key={tile.n} n={tile.n} style={{ position: "absolute", left: s(tile.x), top: s(tile.y) }} />
        ))}
      </div>

      <div className="relative flex flex-col items-center text-center lg:absolute lg:inset-x-0 lg:top-[calc(var(--s)*258)]">
        <p className="flex items-center" style={{ ...txt(16, 13, 300), gap: s(6) }}>
          <Image src="/section-hero/hatch.svg" alt="" width={58} height={26} aria-hidden className="h-auto" style={{ width: `max(22px, ${s(31.8)})` }} />
          {t.substrate.eyebrow}
        </p>
        <h2 style={{ ...txt(64, 30, 500), maxWidth: s(1100) }}>{t.substrate.heading}</h2>
        <p style={{ ...txt(24, 15, 300), maxWidth: `max(300px, ${s(800)})`, marginTop: s(17) }}>{t.substrate.body}</p>
        <Link
          href={SIGNUP_URL}
          {...ctaAttr("substrate")}
          className={BTN_BRAND_HOVER}
          style={{ ...btnStyle(227), height: fz(48, 42), marginTop: s(45), gap: s(4) }}
        >
          {t.substrate.cta} <ButtonArrow size={fz(24, 20)} />
        </Link>
      </div>

      {/* phone / tablet: the fourteen tiles in rows under the copy */}
      <div aria-hidden className="mt-10 flex max-w-[520px] flex-wrap justify-center gap-4 lg:hidden">
        {Array.from({ length: 14 }, (_, i) => (
          <Tile key={i} n={i + 1} />
        ))}
      </div>
    </section>
  );
}
