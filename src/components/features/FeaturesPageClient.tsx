"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonArrow } from "@/components/ui/icons";
import { openBookDemo } from "@/lib/bookDemo";
import { ctaAttr, DOCS_URL, SIGNUP_URL } from "@/lib/nav";
import type { Dict } from "@/lib/i18n";
import { CtaCard } from "@/components/page/CtaCard";
import { BTN_BRAND_HOVER, BTN_WHITE_HOVER, btnStyle, fz, s, txt } from "@/components/page/scale";

// The /features page. Same header, footer, background and grid as the landing page — this
// component only lays content on top of them, so there is no background of its own here.
//
// 1:1 with Figma (Usectil-Landing → frame "Features", 732:1108, 1920 wide). Every length is the
// board's px × --s (globals.css: 100vw / 1920), the same scale the landing uses, so the page is
// the board at 1920 and the board scaled at any other width. Fonts get a px floor so phones stay
// readable. The numbers come from design/features/FIGMA-SPEC.md — change both together.
//
// Artwork (Figma "Features", 732:1108):
//   • BlockIllustration — public/features/main1.svg … main7.svg, one composed export per block
//   • CardIcon — public/features/icons/b{block}-c{card}.svg: the team's mini-cube with the card's
//       Figma glyph (Iconify, same icon names as the board) centred on it
//   • the section anchors (`block-1` … `block-7`) are derived from the dictionary's order, so
//     adding or reordering a block in i18n moves its tab, its anchor and its spy entry together.

const BLOCK_ID = (i: number) => `block-${i + 1}`;

/** Tab widths on the board (EN). Used as a MIN width so a longer label (KA) still fits. */
const TAB_W = [123, 195, 123, 201, 123, 241, 178];

// The team's composed exports (2026-11-16). Every file holds the SAME 509×316 plate; what differs
// is how much artwork rises above it (cubes, floating cards) and, for main7, 10px past its right
// edge. So the layout box is the plate, and each export is placed by where its plate sits inside
// it (`plateTop`, measured from the files) — that keeps all seven plates on the same line under
// their headings, exactly as on the board, while the extra artwork overflows upward.
const PLATE_W = 509;
const PLATE_H = 316;
const ART: { w: number; h: number; plateTop: number }[] = [
  { w: 509, h: 479, plateTop: 162.5 },
  { w: 509, h: 440, plateTop: 123.5 },
  { w: 509, h: 326, plateTop: 9.5 },
  { w: 509, h: 332, plateTop: 15.3 },
  { w: 509, h: 316, plateTop: 0 },
  { w: 509, h: 316, plateTop: 0 },
  { w: 519, h: 430, plateTop: 113.66 },
];

function BlockIllustration({ index, label }: { index: number; label: string }) {
  const art = ART[index] ?? { w: PLATE_W, h: PLATE_H, plateTop: 0 };
  return (
    // Below lg the blocks stack, so the artwork that rises above the plate needs its own room
    // (as a % of the width, which is what the plate scales with); on desktop it may overflow
    // upward into the heading's row, exactly as on the board.
    <div className="w-full pt-(--fe-art-rise) lg:pt-0" style={{ ["--fe-art-rise" as string]: `${(art.plateTop / PLATE_W) * 100}%` }}>
    <div data-fe-art={index + 1} className="relative w-full" style={{ aspectRatio: `${PLATE_W} / ${PLATE_H}` }}>
      <Image
        src={`/features/main${index + 1}.svg`}
        alt=""
        aria-hidden
        width={art.w}
        height={art.h}
        // the plates are 1px, very low-opacity strokes — exactly the content next/image's
        // resample+recompress erases (PROJECT.md, the ruler PNG). Serve the file as exported.
        unoptimized
        className="pointer-events-none absolute left-0 max-w-none"
        style={{
          top: `${(-art.plateTop / PLATE_H) * 100}%`,
          width: `${(art.w / PLATE_W) * 100}%`,
          height: `${(art.h / PLATE_H) * 100}%`,
        }}
        title={label}
      />
    </div>
    </div>
  );
}

/**
 * The card's mini-cube (41×46 on the 1920 board) with its glyph baked in —
 * public/features/icons/b{block}-c{card}.svg. Its top sits 7px (board) above the title's top,
 * which is what the negative margin reproduces.
 */
/**
 * The card's mini-cube (41.4×45.8 on the board) with its glyph baked in —
 * public/features/icons/b{block}-c{card}.svg. Its top sits 7px above the title's top.
 */
function CardIcon({ block, card }: { block: number; card: number }) {
  return (
    <Image
      src={`/features/icons/b${block + 1}-c${card + 1}.svg`}
      alt=""
      aria-hidden
      width={42}
      height={46}
      unoptimized
      className="h-auto shrink-0"
      style={{ width: s(41.4), minWidth: 28, marginTop: `calc(-1 * ${s(7)})` }}
    />
  );
}

/**
 * One card under a block's copy. No box: label (14 Light green) on top, RIGHT-aligned to the text's
 * right edge; then cube + title (20 Regular); body (16 Light) 11px under the title, 216 wide
 * (192 on Deploy). `w-fit` makes the card as wide as its text.
 */
function FeatureCard({
  block,
  card,
  label,
  title,
  body,
}: {
  block: number;
  card: number;
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div data-fe-reveal className="flex w-fit min-w-0 max-w-full flex-col">
      {/* always rendered so the three titles share a baseline when only some cards have a label */}
      <p className="text-right" style={{ ...txt(14, 11, 300, "#11a32a"), minHeight: "1.276em" }}>
        {label}
      </p>
      <div className="flex items-start" style={{ gap: s(11) }}>
        <CardIcon block={block} card={card} />
        <div className="min-w-0">
          <h3 className="whitespace-nowrap" style={txt(20, 15, 400)}>
            {title}
          </h3>
          <p style={{ ...txt(16, 13, 300), lineHeight: 1.25, marginTop: s(11), maxWidth: `max(170px, ${s(block === 0 ? 192 : 216)})` }}>
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesPageClient({ t }: { t: Dict }) {
  const f = t.featuresPage;
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // --- the sticky bar's height feeds the blocks' scroll-margin, so a click lands the block's
  // heading just below the bar instead of behind it. Measured rather than hardcoded: the bar
  // wraps differently per language and width.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const sync = () => {
      document.documentElement.style.setProperty("--fe-bar-h", `${bar.offsetHeight}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(bar);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--fe-bar-h");
    };
  }, []);

  // --- which block is on screen: the LAST one whose top has passed just under the sticky bar.
  // A plain scroll listener (rAF-throttled) rather than IntersectionObserver — the blocks are
  // taller than the viewport, so "which one is intersecting" is ambiguous while a long block
  // fills the screen, whereas "the last one I have scrolled into" always has one answer.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
      const bar = barRef.current?.offsetHeight ?? 0;
      const line = header + bar + 24;
      let idx = 0;
      f.blocks.forEach((_, i) => {
        const el = document.getElementById(BLOCK_ID(i));
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [f.blocks]);

  // keep the active tab visible inside the bar's own horizontal scroll (phones / long labels)
  useEffect(() => {
    const tabs = tabsRef.current;
    const el = tabs?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!tabs || !el) return;
    const left = el.offsetLeft - tabs.clientWidth / 2 + el.offsetWidth / 2;
    tabs.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  // --- entrance: each block fades up once, the first time it comes near. Skipped entirely under
  // prefers-reduced-motion (the CSS below leaves those elements at their final values).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-fe-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-fe-in", "");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = useCallback((i: number) => {
    document.getElementById(BLOCK_ID(i))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div data-grid-scroll className="fe-page relative w-full">
      {/* ── hero ─────────────────────────────────────────────────────────────────────────
          board: eyebrow y184 (88 under the 96 header), H1 y204, lead y303 (913 wide),
          buttons y394 (156×44 / 158×44, gap 18), then 132 to the tab capsule. */}
      <section
        className="mx-auto flex w-full flex-col items-center px-(--grid-inset) text-center"
        style={{ paddingTop: s(88), paddingBottom: s(132) }}
      >
        <p data-fe-reveal className="flex items-center" style={{ ...txt(16, 13, 300), gap: s(6) }}>
          <Image
            src="/section-hero/hatch.svg"
            alt=""
            width={58}
            height={26}
            aria-hidden
            className="h-auto"
            style={{ width: `max(22px, ${s(31.8)})` }}
          />
          {f.eyebrow}
        </p>
        <h1 data-fe-reveal style={{ ...txt(64, 30, 500), maxWidth: s(1354) }}>
          {f.heading}
        </h1>
        <p data-fe-reveal style={{ ...txt(24, 15, 300), maxWidth: `max(300px, ${s(913)})`, marginTop: s(17) }}>
          {f.body}
        </p>
        <div data-fe-reveal className="flex flex-wrap items-center justify-center" style={{ gap: s(18), marginTop: s(30) }}>
          <Link
            href={SIGNUP_URL}
            {...ctaAttr("features-hero")}
            className="inline-flex items-center justify-center transition-colors duration-300 ease-out hover:!border-brand hover:!text-brand"
            style={btnStyle(156)}
          >
            {f.startFree} <ButtonArrow size={fz(24, 20)} />
          </Link>
          <button
            type="button"
            onClick={openBookDemo}
            className="inline-flex items-center justify-center transition-colors duration-300 ease-out hover:!border-white hover:!text-white"
            style={btnStyle(158)}
          >
            {f.talkToSales}
          </button>
        </div>
      </section>

      {/* ── sticky tab bar ─────────────────────────────────────────────────────────────
          board: capsule 1474×78, bg rgba(77,77,77,.2), 1px white .1, radius 100, 15/57 padding;
          tabs 48 tall, gap 20, bg rgba(58,58,58,.2), radius 40, 16 Regular; active = green text only.
          The blur is not on the board — it keeps the labels readable once the bar sticks over
          the blocks. */}
      <div ref={barRef} className="sticky z-30 w-full" style={{ top: "var(--header-h)" }}>
        <div className="mx-auto w-full px-(--grid-inset)" style={{ maxWidth: `calc(${s(1474)} + 2 * var(--grid-inset))` }}>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label={f.title}
            className="flex overflow-x-auto backdrop-blur-md [justify-content:safe_center] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              gap: s(20),
              // 78 tall with the 1px border: 14 + 48 + 14 + 2
              padding: `${s(14)} ${s(57)}`,
              borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(77,77,77,0.2)",
            }}
          >
            {f.blocks.map((b, i) => (
              <button
                key={b.tab}
                type="button"
                role="tab"
                data-tab={i}
                aria-selected={i === active}
                aria-controls={BLOCK_ID(i)}
                onClick={() => goTo(i)}
                className="shrink-0 whitespace-nowrap transition-colors duration-200 hover:!text-brand"
                style={{
                  ...txt(16, 12.5, 400, i === active ? "#11a32a" : "#ffffff"),
                  height: fz(48, 36),
                  minWidth: s(TAB_W[i] ?? 123),
                  paddingInline: s(20),
                  borderRadius: 40,
                  background: "rgba(58,58,58,0.2)",
                }}
              >
                {b.tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── the seven blocks ─────────────────────────────────────────────────────────────
          board: row 193 → 1727 (symmetric 193 margins), columns 508 | 61 | 965; first heading
          187 under the capsule; heading → heading 706 (plate 401 + 305). */}
      <div className="mx-auto w-full px-(--grid-inset) lg:px-[calc(var(--s)*193)]" style={{ paddingTop: s(187) }}>
        {f.blocks.map((b, i) => (
          <section
            key={b.title}
            id={BLOCK_ID(i)}
            // clears the sticky header AND the sticky tab bar on a click or a deep link
            style={{ scrollMarginTop: `calc(var(--header-h) + var(--fe-bar-h, 56px) + ${s(40)})`, marginBottom: s(305), columnGap: s(61) }}
            className="grid grid-cols-1 items-start gap-y-8 lg:grid-cols-[minmax(0,508fr)_minmax(0,965fr)]"
          >
            {/* board: the plate's top is 86 below the heading's top */}
            <div data-fe-reveal className="w-full max-lg:order-last lg:mt-[calc(var(--s)*86)]">
              <BlockIllustration index={i} label={b.title} />
            </div>

            <div className="flex flex-col">
              <h2 data-fe-reveal style={txt(36, 22, 500)}>
                {b.title}
              </h2>
              <p data-fe-reveal style={{ ...txt(24, 15, 300), lineHeight: 1.33, maxWidth: `max(300px, ${s(679)})`, marginTop: s(13) }}>
                {b.body}
              </p>
              {/* board: cards are as wide as their text, 40 apart (762 → 1045 → 1369) */}
              <div
                className="grid gap-y-8 max-sm:grid-cols-1 sm:grid-cols-[repeat(3,max-content)]"
                style={{ columnGap: s(40), marginTop: s(40) }}
              >
                {b.cards.map((c, ci) => (
                  <FeatureCard key={c.title} block={i} card={ci} label={c.label} title={c.title} body={c.body} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── closing CTA card + Scroll UP ─────────────────────────────────────────────────
          board: card 1394×298, bg #1E1D1D, 1px white .1, radius 53; inside: eyebrow +52, H2 32
          +87, body 16 Regular 550 wide +140, buttons +202. Scroll UP 110×36, 224 under the card,
          154 above the footer. The glows are the board's three blurred green shapes (Vector
          202 / 198), redrawn as blurred ellipses at their board positions. */}
      <section className="mx-auto w-full px-(--grid-inset)" style={{ paddingBottom: s(154) }}>
        <CtaCard eyebrow={f.final.eyebrow} heading={f.final.heading} body={f.final.body}>
          <Link href={SIGNUP_URL} {...ctaAttr("features-final")} className={BTN_BRAND_HOVER} style={btnStyle(156)}>
            {f.final.start} <ButtonArrow size={fz(24, 20)} />
          </Link>
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={BTN_WHITE_HOVER} style={btnStyle(158)}>
            {f.final.docs}
          </a>
        </CtaCard>

        <div className="flex justify-center" style={{ marginTop: s(224) }}>
          <button
            type="button"
            onClick={toTop}
            className="inline-flex items-center justify-center transition-colors duration-300 ease-out hover:!border-brand hover:!text-brand"
            style={{
              ...txt(12, 12, 400, "rgba(255,255,255,0.7)"),
              minWidth: s(110),
              height: fz(36, 34),
              paddingInline: s(22),
              borderRadius: 40,
              border: "1px solid rgba(255,255,255,0.2)",
              gap: s(2),
            }}
          >
            {f.scrollUp}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden style={{ width: fz(24, 18), height: fz(24, 18) }}>
              <path d="M12 17V7M12 7L8 11M12 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
