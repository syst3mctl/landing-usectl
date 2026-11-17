"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CtaCard } from "@/components/page/CtaCard";
import { BTN_BRAND_HOVER, btnStyle, fz, s, txt } from "@/components/page/scale";
import { SceneLight } from "@/components/layout/SceneLight";
import { ButtonArrow } from "@/components/ui/icons";
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
const CARD_BODY = (): CSSProperties => txt(24, 15, 300); // ≈ (box 31 per line)

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
    <div data-grid-scroll className="relative w-full overflow-x-clip">
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
        <h1 data-fe-reveal style={{ ...txt(64, 30, 500), maxWidth: s(1029) }}>
          {a.heading}
        </h1>
        <p data-fe-reveal style={{ ...txt(24, 15, 300), maxWidth: `max(300px, ${s(913)})`, marginTop: s(16) }}>
          {a.body}
        </p>
        <div style={{ marginTop: s(35) }} className="flex max-w-full justify-center">
          <CopyPrompt text={a.prompt} copy={a.copy} copied={a.copied} />
        </div>
        {/* 7 overlapping 64×64 tiles, radius 16, 40px logos */}
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
                // it (the previous logo shows through blurred, the "glow" between the icons) and
                // catches light on its top-left edge
                // the gradient sits on a near-opaque page-colour base: backdrop-filter starts a frame or
                // two late after a load (and not at all under an ancestor with opacity < 1), and a
                // bare 1 % fill showed the covered logo through the tile in that moment
                background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.01) 60%), rgba(30,29,29,0.82)",
                backdropFilter: `blur(${s(7)})`,
                WebkitBackdropFilter: `blur(${s(7)})`,
                boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.22), inset -1px -1px 0 rgba(255,255,255,0.05)",
                zIndex: i,
              }}
            >
              <Image src={`/agents/${l.src}.svg`} alt="" width={l.w} height={l.h} unoptimized style={{ width: `${(l.w / 64) * 100}%`, height: "auto", opacity: 0.72 }} />
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
      <section className={`${col} relative`} style={{ paddingTop: s(277) }}>
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
      <section className={col} style={{ paddingTop: s(386) }}>
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
      <section className={`${col} relative`} style={{ paddingTop: s(278) }}>
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
      <section className="w-full px-(--grid-inset)" style={{ paddingTop: s(389), paddingBottom: s(183) }}>
        <CtaCard eyebrow={a.final.eyebrow} heading={a.final.heading} body={a.final.body} bodyWidth={580}>
          <Link href={SIGNUP_URL} {...ctaAttr("agents-final")} className={BTN_BRAND_HOVER} style={btnStyle(184)}>
            {a.final.deploy} <ButtonArrow size={fz(24, 20)} />
          </Link>
        </CtaCard>
      </section>
    </div>
  );
}
