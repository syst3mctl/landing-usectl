"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonArrow } from "@/components/ui/icons";
import { Noise } from "@/components/ui/Noise";
import { GlassRim } from "@/components/ui/GlassRim";
import { openBookDemo } from "@/lib/bookDemo";
import { ctaAttr, DOCS_URL, SIGNUP_URL } from "@/lib/nav";
import type { Dict } from "@/lib/i18n";
import { CtaCard } from "@/components/page/CtaCard";
import { BTN_BRAND_HOVER, BTN_WHITE_HOVER, btnStyle, fz, s, txt } from "@/components/page/scale";
import { LINE_COLOR, LINE_W, NUM_COLUMNS } from "@/lib/grid";

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

/** A block heading lands this far (board px) under the stuck bar after a tab click. */
const LAND_GAP = 40;
/** The bar sticks centred in the grid cell under the header: header seam + (row − bar) / 2 (user,
 *  2026-11-17). Both from live values — the row pitch and the bar's height differ per width (a
 *  phone grid's rows are its column pitch; the bar's tabs have minimum sizes) — so it is centred
 *  on every screen, not only at 1920 (where it is (114 − 78) / 2 = 18). Measured from --header-h,
 *  which is where the grid's rows start (the header's own seam is its 1px border just below);
 *  --fe-bar-h is measured below. On the board the bar sits between rows 4 and 5
 *  (552 / 666), so at the moment it sticks the page's rows line up with that cell exactly. */
const STICK_TOP = "calc(var(--header-h) + max(1px, (var(--grid-row) - var(--fe-bar-h, 78px)) / 2))";

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
          {/* one line whenever the column has room (max-content); wraps instead of overflowing when it doesn't */}
          <h3 className="text-balance" style={txt(20, 15, 400)}>
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
  const capRef = useRef<HTMLDivElement>(null);
  const barSentinelRef = useRef<HTMLDivElement>(null);

  // --- the bar's layout, re-run on resize and when the fonts land:
  //  (a) FIT — every tab label visible with no horizontal scroll: the whole row is zoomed down
  //      just enough to fit (on the board it fits at 1920; at 1440 / 1280 the labels' minimum
  //      font size made it overflow). Below 70 % that would be unreadable — there (phones) the
  //      bar stays one swipeable row.
  //  (b) ALIGN — the bar's resting place is centred in a grid cell, as on the board (between rows
  //      4 and 5 at 1920). The hero above it reflows per width, so the bar is shifted by at most
  //      half a row to the nearest cell centre; then the moment it sticks, its cell under the
  //      header lines up with the page's rows on every screen.
  useEffect(() => {
    const tabs = tabsRef.current;
    const cap = capRef.current;
    const bar = barRef.current;
    const sentinel = barSentinelRef.current;
    const probe = rowProbeRef.current;
    if (!tabs || !cap || !bar || !sentinel || !probe) return;
    const root = document.documentElement;
    const fit = () => {
      tabs.style.zoom = "1";
      const k = Math.min(1, tabs.clientWidth / tabs.scrollWidth);
      // below 70 % (phones) the labels would be unreadable, and wrapping made a 229px-tall sticky
      // block on a 390 phone — there the bar stays one row that swipes, the active tab kept centred
      if (k >= 0.7) tabs.style.zoom = k < 1 ? String(Math.floor(k * 1000) / 1000) : "1";
    };
    const align = () => {
      const header = parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 96;
      const row = probe.getBoundingClientRect().height || 114;
      const h = bar.offsetHeight;
      const natural = sentinel.getBoundingClientRect().top + window.scrollY;
      const inset = (row - h) / 2;
      if (inset <= 0) {
        root.style.setProperty("--fe-bar-shift", "0px");
        return;
      }
      const n = Math.round((natural - header - inset) / row);
      const shift = header + n * row + inset - natural;
      root.style.setProperty("--fe-bar-shift", `${shift.toFixed(2)}px`);
    };
    const run = () => {
      fit();
      align();
    };
    run();
    document.fonts?.ready.then(run);
    window.addEventListener("resize", run);
    return () => {
      window.removeEventListener("resize", run);
      root.style.removeProperty("--fe-bar-shift");
    };
  }, []);
  const rowProbeRef = useRef<HTMLDivElement>(null);

  // --- the page grid redrawn inside the capsule: where its columns and its rows fall relative to
  // the capsule, kept current on scroll (the rows scroll with the page here; the stuck bar
  // doesn't) and on resize. The page's columns are at --grid-inset + c·pitch in the viewport; its
  // rows at --header-h + n·row in the DOCUMENT (BackgroundLines, scrolling with [data-grid-scroll]).
  useEffect(() => {
    const cap = capRef.current;
    const probe = rowProbeRef.current;
    if (!cap || !probe) return;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const r = cap.getBoundingClientRect();
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 96;
      const row = probe.getBoundingClientRect().height || 114;
      const capDocTop = r.top + window.scrollY + 1; // inside the 1px border
      const off = (((header - capDocTop) % row) + row) % row;
      cap.style.setProperty("--cap-x", `${r.left + 1}px`);
      cap.style.setProperty("--cap-row0", `${off}px`);
    };
    const later = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later);
    const ro = new ResizeObserver(later);
    ro.observe(cap);
    return () => {
      window.removeEventListener("scroll", later);
      window.removeEventListener("resize", later);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

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

  // --- where a block should rest, as a window scroll position. A block's VISIBLE extent is its
  // section plus whatever overflows it (the first blocks' illustrations rise up to 68px above the
  // heading — landing the heading under the bar hid their tops, user 2026-11-17). That extent is
  // centred in the room left under the STUCK bar; if it is taller than the room, its top lands
  // LAND_GAP under the bar instead. Measured live: header, --s, the bar's height and the blocks'
  // sizes all change with width and language.
  const blockTarget = useCallback((i: number) => {
    const el = document.getElementById(BLOCK_ID(i));
    const bar = barRef.current;
    if (!el || !bar) return 0;
    const unit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--s")) || 1;
    const r = el.getBoundingClientRect();
    let top = r.top;
    let bottom = r.bottom;
    el.querySelectorAll<HTMLElement>("*").forEach((n) => {
      const b = n.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) return;
      top = Math.min(top, b.top);
      bottom = Math.max(bottom, b.bottom);
    });
    const barBottom = parseFloat(getComputedStyle(bar).top) + bar.offsetHeight;
    const room = window.innerHeight - barBottom;
    const gap = unit * LAND_GAP;
    const h = bottom - top;
    const restTop = h + 2 * gap <= room ? barBottom + (room - h) / 2 : barBottom + gap;
    return Math.max(0, top + window.scrollY - restTop);
  }, []);

  // While a click's smooth scroll runs, the spy must not walk the tabs through every block it
  // passes — the clicked tab is lit at once and the spy resumes when the scroll has settled.
  const lockRef = useRef(false);

  // --- which block is on screen: the LAST one whose resting position (blockTarget — where a click
  // would put it) has been reached, with 8px of slack. Same rule as the clicks, so a click and the
  // spy always agree. A plain scroll listener
  // (rAF-throttled) rather than IntersectionObserver — the blocks are taller than the viewport,
  // so "which one is intersecting" is ambiguous while a long block fills the screen, whereas "the
  // last one I have scrolled into" always has one answer. At the very bottom of the page the last
  // block wins even if its heading can't climb that high.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      if (lockRef.current) return;
      const y = window.scrollY + 8;
      let idx = 0;
      f.blocks.forEach((_, i) => {
        if (blockTarget(i) <= y) idx = i;
      });
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) idx = f.blocks.length - 1;
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
  }, [f.blocks, blockTarget]);

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

  // --- a tab click: scroll the block to its resting position (blockTarget). Computed, not
  // scrollIntoView + scroll-margin: the bar is only "stuck" below the hero, and the line depends on
  // live sizes. The target is re-measured when the scroll settles and corrected once — images and
  // the fade-up entrances can shift the layout while the smooth scroll runs.
  const goTo = useCallback(
    (i: number) => {
      if (!document.getElementById(BLOCK_ID(i))) return;
      const target = () => blockTarget(i);
      setActive(i);
      lockRef.current = true;
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: target(), behavior: smooth ? "smooth" : "auto" });
      let done = false;
      const settle = () => {
        if (done) return;
        done = true;
        window.removeEventListener("scrollend", settle);
        const t = target();
        if (Math.abs(t - window.scrollY) > 2) window.scrollTo({ top: t, behavior: "auto" });
        // release the spy on the next frame, after the correction has applied
        requestAnimationFrame(() => {
          lockRef.current = false;
          setActive(i);
        });
      };
      window.addEventListener("scrollend", settle);
      window.setTimeout(settle, 1400); // browsers without scrollend
    },
    [blockTarget],
  );

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    // overflow-x-clip: decorations that reach past the page's edge (the CTA card's side lights)
    // must not widen the page — on a phone they made it 429px wide, so a sideways swipe dragged the
    // whole site over and left it there (user, 2026-11-17). `clip`, not `hidden`: it creates no
    // scroll container, so the sticky tab bar keeps sticking. /agents and /pricing already had it.
    <div data-grid-scroll className="fe-page relative w-full overflow-x-clip">
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
          board (Frame 486): capsule 1474×78, fill #4D4D4D33, 1px #FFFFFF1A inside, radius 100,
          padding 15 / 57–58; tabs (Frame 479–485) 48 tall, gap 20, fill #3A3A3A33, radius 40,
          16 Regular; active = green text only.
          Measured on the board's render (2026-11-17): the capsule's inside is GRAINY (the page's
          noise shows through it), while each tab is SMOOTH and a touch lighter — frosted glass
          (no grain) with a 1px rim that catches light at the top-left and
          bottom-right corners (≈ white 12 %) and fades along the sides (≈ 4–9 %).
          The capsule has NO blur (user, 2026-11-17: see-through enough for the grid lines to show):
          just the board's #4D4D4D33, so the page's grain and lines read through it as on the
          board; the tabs are smooth plates on it, which is what makes each one sit on the bar
          like glass. */}
      {/* where the bar would start with no alignment — read by the layout effect */}
      <div ref={barSentinelRef} aria-hidden />
      <div ref={barRef} className="sticky z-30 w-full" style={{ top: STICK_TOP, marginTop: "var(--fe-bar-shift, 0px)" }}>
        <div className="mx-auto w-full px-(--grid-inset)" style={{ maxWidth: `calc(${s(1474)} + 2 * var(--grid-inset))` }}>
          {/* the capsule: the board's fill and rim, a blur (labels stay readable over the blocks),
              the page grain, and the page's own grid lines redrawn on top of the blur at exactly
              the page's positions — so the bar reads see-through (lines run through it) without
              the blocks' text showing through it */}
          <div
            ref={capRef}
            className="relative overflow-hidden backdrop-blur-md"
            style={{
              borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.1)",
              // the board's #4D4D4D33 over a slight dark base (user: a touch darker, lines barely there)
              background: "linear-gradient(rgba(77,77,77,0.2), rgba(77,77,77,0.2)), rgba(0,0,0,0.3)",
            }}
          >
            <Noise />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 0.45 /* barely there: the page's lines, seen through dark glass */ }}>
              {Array.from({ length: NUM_COLUMNS }, (_, c) => (
                <div
                  key={c}
                  className="absolute inset-y-0"
                  style={{ left: `calc(var(--grid-inset) + ${c} * var(--grid-pitch) - var(--cap-x, 9999px))`, width: LINE_W, background: LINE_COLOR }}
                />
              ))}
              {[0, 1].map((r) => (
                <div
                  key={r}
                  className="absolute inset-x-0"
                  style={{ top: `calc(var(--cap-row0, -9999px) + ${r} * var(--grid-row))`, height: LINE_W, background: LINE_COLOR }}
                />
              ))}
              {/* measures the row pitch in px for the effect above */}
              <div ref={rowProbeRef} className="invisible absolute w-px" style={{ height: "var(--grid-row)" }} />
            </div>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label={f.title}
            className="relative flex overflow-x-auto [justify-content:safe_center] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              gap: s(20),
              // 78 tall with the capsule's 1px border: 14 + 48 + 14 + 2
              padding: `${s(14)} ${s(57)}`,
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
                className="relative shrink-0 whitespace-nowrap transition-colors duration-200 hover:!text-brand"
                style={{
                  ...txt(16, 12.5, 400, i === active ? "#11a32a" : "#ffffff"),
                  height: fz(48, 36),
                  minWidth: s(TAB_W[i] ?? 123),
                  // board: the tabs are FIXED widths (TAB_W — Scale 123, Network & Routing 195 …) with
                  // the label centred; the frame's 45 / 46 padding is nominal (Network's label alone is
                  // wider than 195 − 91). 20 each side only guards longer labels (Georgian).
                  paddingInline: s(20),
                  borderRadius: 40,
                  // the glass: #3A3A3A33 on a SOLID frost — the capsule's own average colour (page
                  // + #4D4D4D33 ≈ rgb(31,30,30)), so the tab is smooth where the capsule is grainy.
                  // Not backdrop-filter: nested under the capsule's own blur it came out ~+8 levels
                  // lighter than the board (measured), whatever the fill; a solid base lands on the
                  // board's +3.6 over the capsule.
                  background: "linear-gradient(rgba(58,58,58,0.2), rgba(58,58,58,0.2)), rgb(31,30,30)",
                }}
              >
                {/* the board's glass rim, lit from the top-left (components/ui/GlassRim) */}
                <GlassRim w={TAB_W[i] ?? 123} h={48} r={24} />
                <span className="relative">{b.tab}</span>
              </button>
            ))}
          </div>
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
            // a deep link (#block-N) lands where a tab click does: under the stuck bar + LAND_GAP
            style={{ scrollMarginTop: `calc(${STICK_TOP} + var(--fe-bar-h, 56px) + ${s(LAND_GAP)})`, marginBottom: s(305), columnGap: s(61) }}
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
                // lg–xl: the copy column sits beside the illustration and is too narrow for three
                // cards (long Georgian titles overflowed), so two there. Ranges are exclusive on purpose.
                className="grid gap-y-8 max-sm:grid-cols-1 sm:max-lg:grid-cols-[repeat(3,minmax(0,max-content))] lg:max-xl:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,max-content))]"
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
