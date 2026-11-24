"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CtaCard } from "@/components/page/CtaCard";
import { BTN_BRAND_HOVER, btnStyle, fz, s, txt } from "@/components/page/scale";
import { SceneLight } from "@/components/layout/SceneLight";
import { ButtonArrow } from "@/components/ui/icons";
import { Noise } from "@/components/ui/Noise";
import { ctaAttr, SIGNUP_URL } from "@/lib/nav";
import type { Dict } from "@/lib/i18n";

// The /agents page — 1:1 with Figma (Usectil-Landing → frame "Agents", 833:2833, 1920 wide).
// Numbers: design/agents/FIGMA-SPEC.md. Lengths are board px × --s (components/page/scale.ts), the
// same scale as /features and the landing. Same header, footer, background and grid as the rest of
// the site — this component only lays content on top of them.
//
// Not drawn yet (waiting for the team's exports): the two "»" chevron decorations (Vector 196–199).
// The two side glows are the board's Group 1889 / 1890: the same pair of blurred blobs as the
// footer and /pricing (Vector 7 #B6F1C0 → #11A32A, Vector 8 #11A32A → #8FC6FF, layer blur 200),
// drawn with SceneLight's "pricing" shapes and placed / scaled onto the groups' board boxes.

/** "Setup guide" and "Deploy template" go to the manager (user, 2026-11-16) */
const MANAGER_URL = "https://manager.usectl.com";

/** the agent logos row, left → right; x = each 64×64 tile's offset inside the 287-wide group */
const LOGOS: { src: string; w: number; h: number; x: number }[] = [
  { src: "claude", w: 40, h: 40, x: 0 },
  { src: "chatgpt", w: 40, h: 40, x: 37 },
  { src: "cursor", w: 40, h: 40, x: 76 },
  { src: "opencode", w: 40, h: 40, x: 116 },
  { src: "grok", w: 40, h: 38, x: 152 },
  { src: "gemini", w: 40, h: 40, x: 188 },
  { src: "devin", w: 32, h: 37, x: 223 },
];

const H2 = (): CSSProperties => txt(40, 24, 500); // ≈ (box 51) — section headings
const CARD_TITLE = (): CSSProperties => txt(28, 18, 500); // ≈ (box 36)
// Georgian runs longer than the board's English: these scale down under html[lang="ka"]
// (globals.css --ka-*), so the copy keeps the board's line count and sits inside its band.
const CARD_BODY = (): CSSProperties => {
  const t = txt(24, 15, 300); // ≈ (box 31 per line)
  return { ...t, fontSize: `calc(${t.fontSize} * var(--ka-body, 1))` };
};

/** A "Setup guide ›" / "Deploy template ›" link: text + the 24px chevron */
function MoreLink({ href, children, size = 16, place }: { href: string; children: ReactNode; size?: number; place: "agents-setup" | "agents-template" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...ctaAttr(place)}
      className="inline-flex items-center transition-colors duration-200 hover:!text-brand"
      style={txt(size, size === 16 ? 13 : 15, size === 16 ? 400 : 300)}
    >
      {children}
      <Image src="/agents/next.svg" alt="" aria-hidden width={24} height={24} unoptimized style={{ width: fz(24, 18), height: "auto", opacity: 0.8 }} />
    </a>
  );
}

/**
 * The board's section bands — Rectangle 227 (copilots, y1236 h681) and 228 (templates, y2718
 * h447). On the board they are the SAME colour as the page (measured on the Figma canvas
 * 2026-11-17: 24 inside = 24 outside) — all they do is stop the page grid. So a band is painted
 * with the page's own layers (#1e1d1d, the grain tile, the #00000040 sheet), like the header.
 *
 * ≥1024 the bands sit ON the grid's rows, as on the board (1236 − 96 = 10 × 114; 2718 − 96 =
 * 23 × 114), positioned in the page wrapper's coordinates: the wrapper starts under the 97px header
 * (96 + its 1px border), the grid's row k runs [96 + k·row, + line width] in the document, so a
 * band from row k to row m covers [k·row − 1 + line, m·row − 1] — the grid's own row line stays
 * visible above and below it, ONE line at each edge (an extra line drawn by the band sat a few px
 * off the row and read as a double line, 2026-11-17). < 1024 the grid's rows are a different scale,
 * so the band simply wraps its section (FlowBand).
 * z −1 inside the wrapper's stacking context (`isolate`): above the page grid, below the glows and
 * the text.
 */
function BandFill() {
  return (
    <>
      {/* Rectangle 227/228: #1E1D1D + Monotone noise size 1.5, #000 25 % */}
      <Noise freq={0.66667} />
    </>
  );
}

function GridBand({ from, to }: { from: number; to: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -z-10 hidden bg-background lg:block"
      style={{
        top: `calc(${from} * var(--grid-row) - 1px + var(--grid-line-w))`,
        height: `calc(${to - from} * var(--grid-row) - var(--grid-line-w))`,
      }}
    >
      <BandFill />
    </div>
  );
}

function FlowBand({ top }: { top: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute bottom-0 -z-10 w-screen bg-background lg:hidden" style={{ top: s(top), left: "calc(50% - 50vw)" }}>
      <BandFill />
    </div>
  );
}

/** The board's thin "+" that marks each corner of a card (28×28) */
function CornerMark({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 28 28" fill="none" className={`absolute ${className}`} style={{ width: s(28), height: s(28) }}>
      <path d="M14 4v20M4 14h20" stroke="rgba(255,255,255,0.22)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * A card framed only by four corner "+" marks (Choose your agent, Untrusted execution).
 * Board: 256 tall; title at +42 / +73, body 47 under the title's top.
 */
function CornerCard({ title, body, bodyWidth, children }: { title: string; body: string; bodyWidth: number; children?: ReactNode }) {
  return (
    <div data-fe-reveal className="relative w-full" style={{ minHeight: s(256), padding: `${s(73)} ${s(28)} ${s(28)} ${s(42)}` }}>
      <CornerMark className="left-0 top-0" />
      <CornerMark className="right-0 top-0" />
      <CornerMark className="bottom-0 left-0" />
      <CornerMark className="bottom-0 right-0" />
      <h3 style={CARD_TITLE()}>{title}</h3>
      <p style={{ ...CARD_BODY(), lineHeight: 1.29, maxWidth: `max(240px, ${s(bodyWidth)})`, marginTop: s(11) }}>{body}</p>
      {children}
    </div>
  );
}

function CopyPrompt({ text, copy, copied }: { text: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // older browsers / denied permission: fall back to a hidden textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2000);
  }, [text]);

  // board: 751×62, bg rgba(217,217,217,.01), radius 100, padding 21 / 28, gap 34
  return (
    <div
      data-fe-reveal
      className="flex max-w-full items-center"
      style={{
        gap: s(34),
        padding: `${s(21)} ${s(28)}`,
        borderRadius: 100,
        background: "rgba(217,217,217,0.01)",
        border: "1px solid rgba(255,255,255,0.1)",
        // board 751×62 (border included)
        height: fz(62, 48),
        minWidth: `min(calc(100vw - 2 * var(--grid-inset)), ${s(751)})`,
        boxSizing: "border-box",
        justifyContent: "space-between",
      }}
    >
      {/* invisible twin of the Copy button, so the prompt sits in the true centre of the pill;
          dropped on phones, where the prompt needs every pixel */}
      <span aria-hidden className="invisible hidden shrink-0 items-center sm:inline-flex" style={{ ...txt(14, 12, 300), gap: s(4) }}>
        {done ? copied : copy}
        <span style={{ display: "inline-block", width: fz(20, 16) }} />
      </span>
      <code className="min-w-0 flex-1 truncate text-center font-heading" style={txt(14, 12, 500, "rgba(255,255,255,0.7)")}>
        {text}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-live="polite"
        className="inline-flex shrink-0 items-center transition-colors duration-200 hover:!text-brand"
        style={{ ...txt(14, 12, 300), gap: s(4) }}
      >
        {done ? copied : copy}
        <Image src="/agents/copy.svg" alt="" aria-hidden width={20} height={20} unoptimized style={{ width: fz(20, 16), height: "auto", opacity: 0.8 }} />
      </button>
    </div>
  );
}

export function AgentsPageClient({ t }: { t: Dict }) {
  const a = t.agentsPage;

  // --- the bands follow their sections. They sit on the grid's rows (see GridBand), but WHICH rows
  // depends on how tall the copy above them runs: the board's rows (copilots 10 → 16, templates
  // 23 → 27) fit its English, and the Georgian copy, being longer, pushed the templates down off
  // their band and onto the grid (user, 2026-11-18). So each band starts on the row nearest to
  // where it begins on the board (63 above its heading) and ends on the row nearest to its
  // section's end, measured live.
  const copRef = useRef<HTMLElement>(null);
  const tplRef = useRef<HTMLElement>(null);
  const [bands, setBands] = useState({ cop: [10, 16] as [number, number], tpl: [23, 27] as [number, number] });
  // The band snaps to the nearest grid row, which is up to half a row (57 design px) off the
  // board's "63 above the heading" — at 1470 wide (a 13" MacBook) "Explore templates" ended up
  // 34 under the band's top edge, pressed against it (user, 2026-11-24). So the heading follows
  // the band instead: each section's top padding takes the snap's difference, and the heading
  // always sits exactly 63 under the band. ≥1024 only (FlowBand wraps the section on phones).
  const [shift, setShift] = useState({ cop: 0, tpl: 0 });
  useEffect(() => {
    const measure = () => {
      const root = getComputedStyle(document.documentElement);
      const header = parseFloat(root.getPropertyValue("--header-h")) || 96;
      const unit = parseFloat(root.getPropertyValue("--s")) || 1;
      const row = unit * 114;
      const rows = (el: HTMLElement | null, startAbove: number, fallback: [number, number]): [number, number] => {
        if (!el) return fallback;
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY + unit * startAbove;
        const bottom = r.bottom + window.scrollY;
        const from = Math.round((top - header) / row);
        const to = Math.max(from + 1, Math.round((bottom - header) / row));
        return [from, to];
      };
      // the section's top doesn't move with its own padding, so this stays stable
      const snap = (el: HTMLElement | null, startAbove: number, from: number) => {
        if (!el || !window.matchMedia("(min-width: 1024px)").matches) return 0;
        const top = el.getBoundingClientRect().top + window.scrollY + unit * startAbove;
        return Math.round(((header + from * row - top) / unit) * 10) / 10;
      };
      const next = { cop: rows(copRef.current, 214, [10, 16]), tpl: rows(tplRef.current, 215, [23, 27]) };
      setBands((b) => (b.cop.join() === next.cop.join() && b.tpl.join() === next.tpl.join() ? b : next));
      const nextShift = { cop: snap(copRef.current, 214, next.cop[0]), tpl: snap(tplRef.current, 215, next.tpl[0]) };
      setShift((v) => (v.cop === nextShift.cop && v.tpl === nextShift.tpl ? v : nextShift));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (copRef.current) ro.observe(copRef.current);
    if (tplRef.current) ro.observe(tplRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

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

  // the board's content column: headings at x185, corner cards from x167 (= 185 − 18)
  const col = "mx-auto w-full px-(--grid-inset) lg:px-[calc(var(--s)*167)]";

  return (
    <div data-grid-scroll className="relative isolate w-full overflow-x-clip">
      {/* the section bands on the grid's rows (≥1024; see GridBand): copilots rows 10 → 16
          (board 1236 → 1917 ≈ row 15.97), templates rows 23 → 27 (2718 → 3165 ≈ 26.92) */}
      <GridBand from={bands.cop[0]} to={bands.cop[1]} />
      <GridBand from={bands.tpl[0]} to={bands.tpl[1]} />
      {/* side glows, in page coordinates (board y − the 96 header). Group 1890 (right, behind the
          copilots): x1610 y1554, 599×499; Group 1889 (left, behind the templates): x−223 y2820,
          555×443. The SceneLight blobs' union (≈200→830 × 200→740 in its 950×901 box) is fitted
          onto each. */}
      <SceneLight variant="pricing" style={{ left: s(1424), top: s(1554 - 186 - 96), width: s(884), height: s(838) }} />
      <SceneLight variant="pricing" style={{ left: s(-223 - 170), top: s(2820 - 170 - 96), width: s(808), height: s(766) }} />

      {/* ── hero ─────────────────────────────────────────────────────────────────────────
          board: eyebrow y184, H1 y205 (1029), lead y303 (913), prompt y399 (751×62),
          logos y475 (287×64), then 154 to "Choose your agent". */}
      <section className="flex w-full flex-col items-center px-(--grid-inset) text-center" style={{ paddingTop: s(88) }}>
        <p data-fe-reveal className="flex items-center" style={{ ...txt(16, 13, 300), gap: s(6) }}>
          <Image src="/section-hero/hatch.svg" alt="" width={58} height={26} aria-hidden className="h-auto" style={{ width: `max(22px, ${s(31.8)})` }} />
          {a.eyebrow}
        </p>
        <h1 data-fe-reveal style={{ ...txt(64, 30, 500), fontSize: `calc(${txt(64, 30, 500).fontSize} * var(--ka-h1, 1))`, maxWidth: s(1029), textWrap: "balance" }}>
          {a.heading}
        </h1>
        <p data-fe-reveal style={{ ...txt(24, 15, 300), maxWidth: `max(300px, ${s(913)})`, marginTop: s(16) }}>
          {a.body}
        </p>
        <div style={{ marginTop: s(35) }} className="flex max-w-full justify-center">
          <CopyPrompt text={a.prompt} copy={a.copy} copied={a.copied} />
        </div>
        {/* 7 overlapping 64×64 tiles, radius 16, 40px logos at white 56 % (the board's grey: 154 on a
            26 tile) */}
        <div role="img" aria-label={a.logosLabel} className="relative" style={{ width: s(287), height: s(64), marginTop: s(14), minWidth: 200, minHeight: 45 }}>
          {LOGOS.map((l, i) => (
            <div
              key={l.src}
              className="absolute top-0 flex items-center justify-center"
              style={{
                left: `${(l.x / 287) * 100}%`,
                width: `${(64 / 287) * 100}%`,
                height: "100%",
                borderRadius: s(16),
                // board: Figma's glass effect on a white-1 % fill — the tile frosts whatever is under
                // it, so where the tiles overlap the previous logo shows through BLURRED (each tile
                // carries a soft smear of its neighbour, the "glow" between the icons) and the tile
                // catches light on its top-left edge. Measured on the board (2026-11-17): the tile's
                // inside = the page colour, so the fill is all but clear; only a 30 % page-colour base
                // stays, for the frame or two before backdrop-filter starts after a load (it showed
                // the covered logo sharp at 1 %). Was 82 % — that hid the smear entirely.
                background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 60%), rgba(30,29,29,0.3)",
                backdropFilter: `blur(${s(7)})`,
                WebkitBackdropFilter: `blur(${s(7)})`,
                boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.22), inset -1px -1px 0 rgba(255,255,255,0.05)",
                zIndex: i,
              }}
            >
              <Image src={`/agents/${l.src}.svg`} alt="" width={l.w} height={l.h} unoptimized style={{ width: `${(l.w / 64) * 100}%`, height: "auto", opacity: 0.56 }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Choose your agent ─────────────────────────────────────────────────────────────
          board: heading x185 y693 (40), cards 438×256 at x167 / 741 / 1315 (gap 136), 22 under
          the heading; "Setup guide ›" right-aligned 28 in from the card's right, +200 down. */}
      <section className={col} style={{ paddingTop: s(154) }}>
        <h2 data-fe-reveal className="lg:ml-[calc(var(--s)*18)]" style={H2()}>
          {a.choose.heading}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3" style={{ marginTop: s(22), columnGap: s(136) }}>
          {a.choose.cards.map((c) => (
            <CornerCard key={c.title} title={c.title} body={c.body} bodyWidth={368}>
              <div className="flex justify-end" style={{ marginTop: s(16) }}>
                <MoreLink href={MANAGER_URL} place="agents-setup">
                  {a.choose.setup}
                </MoreLink>
              </div>
            </CornerCard>
          ))}
        </div>
      </section>

      {/* ── Built-in infrastructure copilots ─────────────────────────────────────────────
          board: band y1236; heading +63 (y1299); titles y1428 at x195 / 783 / 1357, the fourth
          card under the second (y1651); body 47 under the title, 368 wide (Ops: 315). */}
      {/* band (Rectangle 227) y1236 → 1917 — drawn by GridBand ≥1024; FlowBand (phones) starts 63 above
          the heading (277 − 63 = 214); 129 past the cards (1917 − 1788) is the section's padding-bottom */}
      <section ref={copRef} className={`${col} relative`} style={{ paddingTop: s(277 + shift.cop), paddingBottom: s(129) }}>
        <FlowBand top={214} />
        <h2 data-fe-reveal className="relative lg:ml-[calc(var(--s)*18)]" style={H2()}>
          {a.copilots.heading}
        </h2>
        <div
          className="relative grid grid-cols-1 gap-y-10 md:grid-cols-3 lg:ml-[calc(var(--s)*28)] lg:grid-cols-[calc(var(--s)*588)_calc(var(--s)*574)_1fr]"
          style={{ marginTop: s(78), rowGap: s(83) }}
        >
          {a.copilots.cards.map((c, i) => (
            <div key={c.title} data-fe-reveal className={i === 3 ? "md:col-start-2" : ""}>
              <h3 style={CARD_TITLE()}>{c.title}</h3>
              <p style={{ ...CARD_BODY(), lineHeight: 1.29, maxWidth: `max(240px, ${s(i === 3 ? 315 : 368)})`, marginTop: s(11) }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Built for untrusted execution ─────────────────────────────────────────────────
          board: heading y2174; corner cards 22 under it: x167 → 605 (438) and 823 → 1589 (766). */}
      {/* 386 from the copilots' cards to this heading, 129 of it now inside the band above */}
      <section className={col} style={{ paddingTop: s(386 - 129) }}>
        <h2 data-fe-reveal className="lg:ml-[calc(var(--s)*18)]" style={H2()}>
          {a.untrusted.heading}
        </h2>
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,438fr)_minmax(0,766fr)] lg:grid-cols-[calc(var(--s)*438)_calc(var(--s)*766)]"
          style={{ marginTop: s(22), columnGap: s(218) }}
        >
          <CornerCard title={a.untrusted.cards[0].title} body={a.untrusted.cards[0].body} bodyWidth={368} />
          <CornerCard title={a.untrusted.cards[1].title} body={a.untrusted.cards[1].body} bodyWidth={680} />
        </div>
      </section>

      {/* ── Explore templates ─────────────────────────────────────────────────────────────
          board: band y2718; heading +63 (y2781); items y2910 at x195 / 760 / 1325 (pitch 565);
          "Deploy template ›" 47 under the title (24 Light + 24 chevron). */}
      {/* band (Rectangle 228) y2718 → 3165 — GridBand ≥1024; FlowBand: 63 above the heading
          (278 − 63 = 215), 177 past the items (3165 − 2988) */}
      <section ref={tplRef} className={`${col} relative`} style={{ paddingTop: s(278 + shift.tpl), paddingBottom: s(177) }}>
        <FlowBand top={215} />
        <h2 data-fe-reveal className="relative lg:ml-[calc(var(--s)*18)]" style={H2()}>
          {a.templates.heading}
        </h2>
        <div className="relative grid grid-cols-1 gap-y-8 md:grid-cols-3 lg:ml-[calc(var(--s)*28)] lg:grid-cols-[repeat(3,calc(var(--s)*565))]" style={{ marginTop: s(78) }}>
          {a.templates.items.map((name) => (
            <div key={name} data-fe-reveal>
              <h3 style={CARD_TITLE()}>{name}</h3>
              <div style={{ marginTop: s(11) }}>
                <MoreLink href={MANAGER_URL} size={24} place="agents-template">
                  {a.templates.deploy}
                </MoreLink>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── board: card y3377 (389 under the templates), footer 183 under it */}
      <section className="w-full px-(--grid-inset)" style={{ paddingTop: s(389 - 177), paddingBottom: s(183) }}>
        <CtaCard eyebrow={a.final.eyebrow} heading={a.final.heading} body={a.final.body} bodyWidth={580}>
          <Link href={SIGNUP_URL} {...ctaAttr("agents-final")} className={BTN_BRAND_HOVER} style={btnStyle(184)}>
            {a.final.deploy} <ButtonArrow size={fz(24, 20)} />
          </Link>
        </CtaCard>
      </section>
    </div>
  );
}
