"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type CSSProperties, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SceneLight } from "@/components/layout/SceneLight";
import { ButtonArrow } from "@/components/ui/icons";
import { pressRipple } from "@/lib/pressRipple";
import { openBookDemo } from "@/lib/bookDemo";
import { CONTACT_EMAIL, CONTACT_HREF, ctaAttr, SIGNUP_URL, type CtaPlacement } from "@/lib/nav";
import { fill, type Dict } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The /pricing page (and /ka/pricing) — the team's design of 2026-11-10 (Desktop screenshots:
// hero, the Machine / Enterprise plans box, the "Pricing Calculation" side tab, "The price on this
// page is the price on your invoice.", the FAQ, the closing "Start free" card).
//
// ONE flow layout for every width (unlike the pinned scene, nothing here is absolutely placed), so
// lengths are written as r(desktop px at 1920, phone px at 390) — see `.pr-page` in globals.css —
// and only the column changes (grid-cols) are Tailwind breakpoint classes.
//
// Copy: t.pricingPage (FAQ answers 2-10 are drafts, see en.ts). The calculator itself (rows, maths,
// t.s8 strings) is the one that used to be state 8 of the scene; it now lives in the drawer behind
// the "Pricing Calculation" tab.

const r = (d: number, p: number = d) =>
  d === p ? `calc(var(--k) * ${d})` : `calc(var(--k) * (${d} * var(--pd) + ${p} * var(--pp)))`;

const PRICING_ROWS = [
  { key: "vcpu", price: 10, max: 16 },
  { key: "memory", price: 5, max: 64 },
  { key: "storage", price: 0.1, max: 1000 },
] as const;
type RowKey = (typeof PRICING_ROWS)[number]["key"];
// $15 · $15.10 · $5,761.20 — whole numbers without cents, a thousands separator on big totals
const fmtPrice = (n: number) =>
  `$${n.toLocaleString("en-US", Number.isInteger(n) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const MACHINE_BASE = 15; // 1 vCPU ($10) + 1 GB RAM ($5)


// the opened calculator's − / + inside one pill: borderless round buttons, same green hover
const STEP_IN_CLASS =
  "relative flex items-center justify-center overflow-hidden rounded-full text-white/75 " +
  "transition-[color,background-color,transform] duration-200 " +
  "enabled:hover:bg-[rgba(17,163,42,0.16)] enabled:hover:text-[#7cf09a] enabled:active:scale-[0.9] disabled:opacity-30";

// the site's outline pill (header "Start Now", the scene's buttons)
const PILL =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/25 font-heading " +
  "text-white/90 transition-colors duration-300 ease-out hover:border-brand hover:text-brand active:border-brand active:text-brand";

// the design: rgba(17,163,42,.55) → rgba(143,198,255,.55) across the line
const HEADING_GRADIENT = "linear-gradient(90deg, rgba(17, 163, 42, 0.55) 0%, rgba(143, 198, 255, 0.55) 100%)";
const LS = "-0.02em"; // every text on the design board: letter-spacing -2%
// the closing card's two buttons: 156×44, r40, padding 15/22, label 14/500 with no tracking
const FINAL_BTN: CSSProperties = {
  minWidth: r(156, 130),
  height: r(44, 42),
  borderRadius: r(40),
  padding: `${r(15)} ${r(22)}`,
  fontSize: r(14, 13.5),
  lineHeight: 1,
  letterSpacing: 0,
};

function Check({ size }: { size: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// `big`: the opened calculator's larger switch (user: "უფრო დიდი რო იყოს")
function Toggle({ annual, setAnnual, t, big = false }: { annual: boolean; setAnnual: (v: boolean) => void; t: Dict; big?: boolean }) {
  const k = big ? 1.3 : 1;
  return (
    <div className="flex items-center justify-center font-heading" style={{ gap: r(12 * k, 10 * (big ? 1.15 : 1)), fontSize: r(15 * k, 13.5 * (big ? 1.15 : 1)) }}>
      <span className={annual ? "text-white/50" : "text-white/90"}>{t.s8.monthly}</span>
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label={t.a11y.billAnnually}
        onClick={() => setAnnual(!annual)}
        className="relative cursor-pointer"
        style={{ width: r(49 * k, 44 * (big ? 1.15 : 1)), height: r(27 * k, 24 * (big ? 1.15 : 1)), borderRadius: r(4 * k), background: "rgba(255,255,255,0.15)" }}
      >
        <span
          className="absolute transition-transform duration-200"
          style={{
            top: r(2 * k),
            left: r(2 * k),
            width: r(22 * k, 20 * (big ? 1.15 : 1)),
            height: r(23 * k, 20 * (big ? 1.15 : 1)),
            borderRadius: r(4 * k),
            background: "#11A32A",
            transform: annual ? `translateX(${r(23 * k, 20 * (big ? 1.15 : 1))})` : "translateX(0)",
          }}
        />
      </button>
      <span className={annual ? "text-white/90" : "text-white/50"}>{t.s8.annual}</span>
    </div>
  );
}

function SignupLink({ placement, className, style, children }: { placement: CtaPlacement; className: string; style: CSSProperties; children: ReactNode }) {
  return (
    <a href={SIGNUP_URL} {...ctaAttr(placement)} className={className} style={style}>
      {children}
    </a>
  );
}

// Arriving on /pricing always starts at its top (user, 2026-11-10) — coming from the scene with a
// next/link click used to keep the scene's scroll offset (it also switches the history to manual
// scroll restoration). The one exception is a reload of /pricing itself: then the browser's own
// restore keeps you where you were. Module-level, so only the first mount after a load counts.
let pricingMountedSinceLoad = false;

export function PricingPageClient({ t }: { t: Dict }) {
  const p = t.pricingPage;
  const rootRef = useRef<HTMLDivElement>(null);
  const [annual, setAnnual] = useState(false);
  const calcControl = useRef<{ open: () => void } | null>(null);
  const phoneCalcRef = useRef<HTMLButtonElement>(null); // the phones' trigger — the morph grows out of it
  const [openFaq, setOpenFaq] = useState(0);
  // which plan card is lit (user, 2026-11-10: clicking a card moves the highlight to it). The
  // "Most Popular" badge stays on Machine — it says what's popular, not what's picked.
  const [plan, setPlan] = useState<"machine" | "enterprise">("machine");
  const cardClass = (key: "machine" | "enterprise") =>
    `relative flex cursor-pointer flex-col border-2 transition-[background-color,border-color] duration-300 ease-out ${
      plan === key ? "border-white/[0.06] bg-white/[0.045]" : "border-transparent bg-transparent hover:bg-white/[0.015]"
    }`;

  // decided ONCE per mount: in dev, React StrictMode runs this effect twice, and a second
  // evaluation saw the module flag already set and scrolled a reloaded page back to the top —
  // the reported "refresh at the bottom starts me at the top again"
  const keepScroll = useRef<boolean | null>(null);
  useEffect(() => {
    if (keepScroll.current === null) {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      keepScroll.current = !pricingMountedSinceLoad && nav?.type === "reload";
      pricingMountedSinceLoad = true;
    }
    if (keepScroll.current) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    window.scrollTo(0, 0);
    // once more after the first frame: the scene's own teardown can still nudge the scroll
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- entrance + scroll reveals -------------------------------------------------------------
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const all = Array.from(root.querySelectorAll<HTMLElement>("[data-pr-reveal]"));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(all, { autoAlpha: 1 });
        return;
      }
      // hero: the scene's blur-in (blur 12, rise 8, power3.out), one field after another
      const hero = root.querySelector<HTMLElement>("[data-pr-hero]");
      if (hero) {
        gsap.fromTo(
          hero.querySelectorAll("[data-pr-reveal]"),
          { autoAlpha: 0, filter: "blur(12px)", y: 8 },
          { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1, delay: 0.1 },
        );
      }
      // every later block rises in as it scrolls into view (once)
      root.querySelectorAll<HTMLElement>("[data-pr-scroll]").forEach((group) => {
        gsap.fromTo(
          group.querySelectorAll("[data-pr-reveal]"),
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="pr-page relative flex flex-1 flex-col overflow-x-clip" style={{ paddingInline: r(40, 20) }}>
      {/* ---------------- hero ---------------- */}
      <section data-pr-hero className="flex flex-col items-center text-center" style={{ paddingTop: r(84, 40) }}>
        <p data-pr-reveal className="flex items-center font-heading font-light text-white/60" style={{ gap: r(10, 9), fontSize: r(17, 12) }}>
          <Image src="/section-hero/hatch.svg" alt="" width={36} height={12} aria-hidden="true" unoptimized style={{ width: r(32, 22), height: "auto" }} />
          {p.eyebrow}
        </p>
        <h1
          data-pr-reveal
          className="inline-block bg-clip-text font-heading font-medium text-transparent"
          style={{
            backgroundImage: HEADING_GRADIENT,
            fontSize: r(74, 36),
            lineHeight: 1.1, // the board says 100%; 1.1 keeps descenders inside the gradient clip
            letterSpacing: LS,
            marginTop: r(4, 12),
          }}
        >
          {p.heading[0]} {p.heading[1]}
        </h1>
        <p data-pr-reveal className="font-heading font-light text-white/75" style={{ fontSize: r(24, 15), lineHeight: 1.25, letterSpacing: LS, maxWidth: r(900, 360), marginTop: r(10, 14) }}>
          {p.body}
        </p>
        <div data-pr-reveal style={{ marginTop: r(22, 22) }}>
          <SignupLink placement="pricing-hero" className={PILL} style={{ minWidth: r(132, 120), height: r(44, 42), paddingInline: r(22), borderRadius: r(40), fontSize: r(15, 14), letterSpacing: LS }}>
            {p.startFree}
          </SignupLink>
        </div>
        <div data-pr-reveal style={{ marginTop: r(54, 40) }}>
          <Toggle annual={annual} setAnnual={setAnnual} t={t} />
        </div>
      </section>

      {/* ---------------- plans ---------------- */}
      <section data-pr-scroll className="mx-auto w-full" style={{ maxWidth: r(1230, 560), marginTop: r(42, 24) }}>
        <div
          data-pr-reveal
          className="relative border-2 border-white/[0.07] bg-white/[0.012]"
          style={{ minHeight: r(762, 0), borderRadius: r(16), padding: `${r(22, 10)} ${r(26, 10)} 0` }}
        >
          <div className="grid lg:grid-cols-2" style={{ gap: r(18, 10) }}>
            {/* Machine — lit by default; a click on either card moves the light */}
            <article
              onClick={() => setPlan("machine")}
              data-selected={plan === "machine" || undefined}
              className={cardClass("machine")}
              style={{ minHeight: r(689, 0), borderRadius: r(16), padding: `${r(92, 70)} ${r(58, 20)} ${r(47, 22)} ${r(52, 20)}` }}
            >
              <span
                className="absolute flex items-center justify-center border border-brand/40 font-heading font-light text-brand"
                style={{ top: r(30, 18), right: r(39, 18), minWidth: r(165, 0), height: r(42, 34), borderRadius: r(16, 12), padding: `${r(9)} ${r(14, 12)}`, gap: r(8, 6), fontSize: r(18, 13), letterSpacing: LS }}
              >
                <Image src="/pricing/most-popular.svg" alt="" width={24} height={24} aria-hidden="true" unoptimized style={{ width: r(24, 16), height: r(24, 16) }} />
                {p.popular}
              </span>
              <PlanHead name={p.machine.name} tagline={p.machine.tagline} />
              <p className="flex items-baseline font-heading" style={{ marginTop: r(18, 22) }}>
                <span className="font-medium text-white/90" style={{ fontSize: r(40, 34), lineHeight: 1, letterSpacing: LS }}>
                  ${annual ? MACHINE_BASE * 12 : MACHINE_BASE}.
                </span>
                <span className="font-medium text-white/30" style={{ fontSize: r(40, 34), lineHeight: 1, letterSpacing: LS }}>
                  00
                </span>
                <span className="font-light text-white/55" style={{ fontSize: r(14, 12), letterSpacing: LS, marginLeft: r(2) }}>
                  {annual ? p.perYear : p.perMonth}
                </span>
              </p>
              <p className="font-heading font-light text-white/85" style={{ fontSize: r(16, 13.5), lineHeight: 1.25, letterSpacing: LS, marginTop: r(18, 16), maxWidth: r(440, 330) }}>
                {p.machine.detail}
              </p>
              <Features items={p.machine.features} marginTop={r(47, 24)} />
              <div className="mt-auto" style={{ paddingTop: r(32, 28) }}>
                <SignupLink
                  placement="pricing-machine"
                  className={`${PILL} w-full border-white/40`}
                  style={{ height: r(60, 50), borderRadius: r(38), fontSize: r(17, 14.5), letterSpacing: LS }}
                >
                  {p.machine.cta}
                </SignupLink>
              </div>
            </article>

            {/* Enterprise */}
            <article
              onClick={() => setPlan("enterprise")}
              data-selected={plan === "enterprise" || undefined}
              className={cardClass("enterprise")}
              style={{ minHeight: r(689, 0), borderRadius: r(16), padding: `${r(92, 28)} ${r(58, 20)} ${r(47, 22)} ${r(52, 20)}` }}
            >
              <PlanHead name={p.enterprise.name} tagline={p.enterprise.tagline} />
              {/* wraps: "ინდივიდუალური" (ka) is far longer than "Custom" */}
              <p className="flex flex-wrap items-baseline font-heading" style={{ marginTop: r(18, 22), rowGap: r(4) }}>
                <span className="font-medium text-white/90" style={{ fontSize: r(40, 28), lineHeight: 1, letterSpacing: LS }}>
                  {p.enterprise.price}
                </span>
                <span className="font-light text-white/55" style={{ fontSize: r(14, 12), letterSpacing: LS, marginLeft: r(6) }}>
                  {annual ? p.perYear : p.perMonth}
                </span>
              </p>
              <p className="font-heading font-light text-white/85" style={{ fontSize: r(17, 14), marginTop: r(30, 20) }}>
                {p.enterprise.lead}
              </p>
              <Features items={p.enterprise.features} marginTop={r(22, 14)} />
              <div className="mt-auto" style={{ paddingTop: r(32, 28) }}>
                <button
                  type="button"
                  onClick={openBookDemo}
                  className={`${PILL} w-full cursor-pointer border-white/40`}
                  style={{ height: r(60, 50), borderRadius: r(38), fontSize: r(17, 14.5), letterSpacing: LS }}
                >
                  {p.enterprise.cta}
                </button>
              </div>
            </article>
          </div>
          <p className="text-right font-heading font-light text-white/55" style={{ fontSize: r(14, 13), lineHeight: 1, letterSpacing: LS, padding: `${r(17, 14)} ${r(40, 14)} ${r(16, 12)}` }}>
            <a href={CONTACT_HREF} className="transition-colors hover:text-brand">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <p data-pr-reveal className="text-center font-heading font-light" style={{ color: "#11A32ACC", fontSize: r(22, 15), lineHeight: 1.25, letterSpacing: LS, marginTop: r(32, 22) }}>
          {p.trialNote}
        </p>
        {/* phones: the right-edge tab would sit on the content, so the calculator opens from here */}
        <div data-pr-reveal className="flex justify-center lg:hidden" style={{ marginTop: r(18) }}>
          <button
            ref={phoneCalcRef}
            type="button"
            onClick={() => calcControl.current?.open()}
            className="cursor-pointer rounded-full bg-white/[0.1] font-heading text-brand transition-colors active:bg-white/[0.16]"
            style={{ height: r(42), paddingInline: r(22), fontSize: r(13.5) }}
          >
            {p.calcTab}
          </button>
        </div>
      </section>

      {/* ---------------- the price on this page is the price on your invoice ---------------- */}
      <section data-pr-scroll className="mx-auto w-full" style={{ maxWidth: r(1370, 560), marginTop: r(253, 80) }}>
        <h2 data-pr-reveal className="text-center font-heading font-medium text-white/85" style={{ fontSize: r(42, 24), lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          {p.invoice.heading}
        </h2>
        <div className="grid lg:grid-cols-3" style={{ gap: r(80, 30), marginTop: r(56, 32) }}>
          {p.invoice.items.map((item, i) => (
            <div data-pr-reveal key={i} className="lg:justify-self-center">
              <span
                className="inline-flex items-center justify-center border border-white/[0.06] bg-white/[0.03] font-heading text-white/70"
                style={{ width: r(64, 46), height: r(64, 46), borderRadius: r(16, 12), padding: r(5), fontSize: r(21, 15), letterSpacing: LS }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-heading font-light text-white/70" style={{ fontSize: r(22, 15), lineHeight: 1.25, letterSpacing: LS, marginTop: r(26, 14), maxWidth: r(360, 520) }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section data-pr-scroll className="mx-auto w-full" style={{ maxWidth: r(794, 560), marginTop: r(253, 80) }}>
        <h2 data-pr-reveal className="text-center font-heading font-medium text-white/85" style={{ fontSize: r(40, 24), lineHeight: 1, letterSpacing: LS }}>
          {p.faq.heading}
        </h2>
        <ul className="flex flex-col" style={{ gap: r(18, 10), marginTop: r(48, 28) }}>
          {p.faq.items.map((item, i) => {
            const open = openFaq === i;
            const id = `pr-faq-${i}`;
            return (
              <li
                data-pr-reveal
                key={i}
                className={`transition-colors duration-500 ${open ? "bg-white/[0.065]" : "bg-white/[0.045] hover:bg-white/[0.055]"}`}
                style={{ borderRadius: r(34, 22) }}
              >
                <h3>
                  {/* the button's padding never changes (it used to shrink on open, which made the
                      row jump) — the answer's own top spacing lives inside the collapsible */}
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={id}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="flex w-full cursor-pointer items-center text-left font-heading"
                    style={{ gap: r(20, 12), padding: `${r(26, 16)} ${r(34, 16)} ${r(26, 16)} ${r(48, 16)}` }}
                  >
                    <span
                      className={`inline-flex shrink-0 items-center justify-center border bg-white/[0.03] transition-colors duration-500 ${open ? "border-brand/30 text-brand" : "border-white/[0.08] text-white/45"}`}
                      style={{ width: r(42, 32), height: r(42, 32), borderRadius: r(12, 9), padding: r(5), fontSize: r(13, 11), letterSpacing: LS }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-bold text-white/90" style={{ fontSize: r(18, 14.5), lineHeight: 1.2, letterSpacing: LS }}>
                      {item.q}
                    </span>
                    {/* + → ×: the white disc cross-fades to the green one while only the glyph
                        turns (with a little overshoot); the disc itself never spins */}
                    <span aria-hidden="true" className="relative inline-flex shrink-0 items-center justify-center" style={{ width: r(28, 22), height: r(28, 22) }}>
                      <span className={`absolute inset-0 rounded-full bg-white/80 transition-[opacity,transform] duration-300 ${open ? "scale-75 opacity-0" : "scale-100 opacity-100"}`} />
                      <span className={`absolute inset-0 rounded-full bg-brand transition-[opacity,transform] duration-300 ${open ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} />
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className="relative transition-transform duration-[450ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        style={{ width: "58%", height: "58%", transform: open ? "rotate(135deg)" : "rotate(0deg)" }}
                      >
                        <path d="M6 2v8M2 6h8" stroke="#1e1d1d" strokeWidth={1.6} strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div id={id} role="region" className="pr-faq-body" style={{ ["--pr-faq-pull" as string]: r(-12, -6) }} {...(open ? { "data-open": "" } : {})}>
                  <div>
                    <p
                      className="pr-faq-text font-heading font-light text-white/65"
                      style={{ fontSize: r(18, 13.5), lineHeight: 1.3, letterSpacing: LS, padding: `0 ${r(82, 16)} ${r(28, 18)} ${r(110, 60)}` }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------- closing card ---------------- */}
      <section data-pr-scroll className="relative mx-auto w-full" style={{ maxWidth: r(1394, 560), marginTop: r(192, 80), marginBottom: r(170, 80) }}>
        {/* The scene light is the PAGE's, not the card's (user, with the board: "div-ზე გვაქვს
            background, რეალურად გარეთ უნდა იყოს") — it sits behind the card, centred near its
            lower right corner, and spills past the border; the card itself is clear glass. Drawn at 0.6 of the footer
            light (user: "ძაან დიდზეა"), same centre. */}
        <div
          data-pr-reveal
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: r(769, 75), top: r(-90, 0), width: r(521, 312), height: r(443, 264) }}
        >
          <SceneLight variant="footer" style={{ inset: 0, width: "100%", height: "100%" }} />
        </div>
        <div
          data-pr-reveal
          className="relative flex flex-col items-center justify-center border border-white/[0.12] text-center"
          style={{ minHeight: r(342, 0), borderRadius: r(53, 28), padding: `${r(40)} ${r(40, 20)}` }}
        >
          <h2 className="font-heading font-medium text-brand" style={{ fontSize: r(32, 21), lineHeight: 1.1, letterSpacing: LS }}>
            {p.final.heading}
          </h2>
          <p className="font-heading font-normal text-white/80" style={{ fontSize: r(24, 14.5), lineHeight: 1.25, letterSpacing: LS, marginTop: r(12, 10) }}>
            {p.final.body}
          </p>
          <div className="flex flex-wrap justify-center" style={{ gap: r(14, 10), marginTop: r(30, 22) }}>
            <SignupLink placement="pricing-final" className={`${PILL} gap-1 font-medium`} style={FINAL_BTN}>
              {p.final.start} <ButtonArrow size="1.15em" />
            </SignupLink>
            <button type="button" onClick={openBookDemo} className={`${PILL} cursor-pointer font-medium`} style={FINAL_BTN}>
              {p.final.sales}
            </button>
          </div>
        </div>
      </section>

      <CalculatorMorph t={t} controlRef={calcControl} annual={annual} setAnnual={setAnnual} phoneTrigger={phoneCalcRef} />
    </div>
  );
}

function PlanHead({ name, tagline }: { name: string; tagline: string }) {
  return (
    <>
      {/* the team's icon (public/pricing/fire.svg, 30×30 with its own tinted r8 box) */}
      <Image src="/pricing/fire.svg" alt="" width={30} height={30} aria-hidden="true" unoptimized className="self-start" style={{ width: r(30, 28), height: r(30, 28) }} />
      <h2 className="font-heading font-normal text-white/90" style={{ fontSize: r(20, 18), lineHeight: 1, letterSpacing: LS, marginTop: r(14, 10) }}>
        {name}
      </h2>
      <p className="font-heading font-light text-white/65" style={{ fontSize: r(16, 13.5), lineHeight: 1.25, letterSpacing: LS, marginTop: r(12, 6) }}>
        {tagline}
      </p>
    </>
  );
}

function Features({ items, marginTop }: { items: readonly string[]; marginTop: string }) {
  return (
    <ul className="flex flex-col font-heading font-light text-white/80" style={{ gap: r(20, 11), marginTop, fontSize: r(14, 13.5), lineHeight: 1, letterSpacing: LS }}>
      {items.map((item) => (
        <li key={item} className="flex items-start" style={{ gap: r(10, 8) }}>
          <span className="text-white/75" style={{ marginTop: "-0.05em" }}>
            <Check size={r(15, 14)} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// The "Pricing Calculation" pill and the calculator are ONE element (user, 2026-11-10, approved
// from a demo: "გვერდიდან კი არ უნდა იხსნებოდეს, თვითონ ეგ pricing calculation უნდა იხსნებოდეს,
// დიდდებოდეს და გამოდიოდეს კალკულატორი შუაში"). Closed, it is the vertical pill on the right
// edge; opening tweens its own box (left / top / width / height / radius, plain CSS transitions)
// from the pill's rect to a centred panel while the label fades out and the calculator fades in;
// closing plays the same thing backwards. On phones the right-edge pill would sit on the content,
// so the element is hidden while closed and grows out of the inline button instead.
// The calculator itself is the one that was state 8 of the scene (same rows, maths and t.s8 copy).
type Geo = { left: number; top: number; width: number; height: number; radius: number };
// the closed pill on the design board: 58×226, r36, at x1763 / y782 of the page — i.e. 99 from
// the right edge and 686 below the 96px header (the root this sits in starts under the header).
// PILL_COLUMN runs from there to the end of the page body; the pill is sticky inside it.
// It ends so that the pill parks on the vertical CENTRE of the closing "Start free" card (user:
// "მაგ card-ის შუაში უნდა გაჩერდეს"): the card section's bottom margin (170) plus half the
// difference between the card (342) and the pill (226) heights, 58.
const PILL_COLUMN: CSSProperties = { top: r(686), right: r(99), width: r(58), bottom: r(170 + (342 - 226) / 2) };
const MORPH_EASE = "cubic-bezier(0.32, 0.72, 0, 1)"; // a soft, settling ease (iOS sheet curve)
const MORPH_MS = 680;

function CalculatorMorph({
  t,
  controlRef,
  annual,
  setAnnual,
  phoneTrigger,
}: {
  t: Dict;
  controlRef: RefObject<{ open: () => void } | null>;
  annual: boolean;
  setAnnual: (v: boolean) => void;
  phoneTrigger: RefObject<HTMLButtonElement | null>;
}) {
  const [counts, setCounts] = useState<Record<RowKey, number>>({ vcpu: 1, memory: 1, storage: 1 });
  const step = (key: RowKey, d: number, max: number) =>
    setCounts((c) => ({ ...c, [key]: Math.min(max, Math.max(1, c[key] + d)) }));
  const setCount = (key: RowKey, v: number, max: number) =>
    setCounts((c) => ({ ...c, [key]: Math.min(max, Math.max(1, Math.round(v))) }));
  const factor = annual ? 12 : 1;
  const suffix = annual ? t.s8.perYear : t.s8.perMonth;
  const total = (10 * counts.vcpu + 5 * counts.memory + 0.1 * counts.storage) * factor;

  const anchorRef = useRef<HTMLDivElement>(null); // invisible: where the closed pill sits (≥1024)
  const shellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [showLabel, setShowLabel] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [visible, setVisible] = useState(true); // phones: only while open / animating
  // Closed, the pill sits IN the page (absolute, where the design puts it, scrolling with it);
  // only while it opens / is open / closes is it position:fixed, tweened in viewport px.
  const [fixedMode, setFixedMode] = useState(false);
  // Transitions are switched on only AFTER the pill has been pinned (fixed) on its own rect. With
  // them on during that switch, left/top tweened from the absolute layout's 0/0 — read as the
  // viewport's corner — so the panel grew out of the top-left instead of out of the pill (user).
  const [morphOn, setMorphOn] = useState(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

  const closedGeo = useCallback((): Geo | null => {
    const el = isDesktop() ? anchorRef.current : phoneTrigger.current;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { left: b.left, top: b.top, width: b.width, height: b.height, radius: Math.min(b.width, b.height) / 2 };
  }, [phoneTrigger]);
  const openGeo = useCallback((): Geo | null => {
    const c = contentRef.current;
    if (!c) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = c.offsetWidth;
    const height = Math.min(c.offsetHeight, vh - 32);
    return { left: (vw - width) / 2, top: Math.max(16, (vh - height) / 2), width, height, radius: 24 };
  }, []);

  const [open, setOpenState] = useState(false);
  const openRef = useRef(false);

  // the closed pill's place (first frame, then on every resize); an open panel re-centres
  useEffect(() => {
    const sync = () => {
      if (openRef.current) setGeo(openGeo());
      else setVisible(isDesktop());
    };
    const raf = requestAnimationFrame(sync);
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sync);
    };
  }, [closedGeo, openGeo]);

  // open / close choreography — the demo's timings, driven from the click handlers
  const doOpen = useCallback(() => {
    if (openRef.current) return;
    openRef.current = true;
    clearTimers();
    const fast = reduce();
    setOpenState(true);
    setVisible(true);
    setShowLabel(false);
    setGeo(closedGeo()); // start exactly where the pill / the phone button is right now
    setMorphOn(false);
    setFixedMode(true);
    // frame 1: pinned on the pill, no transition; frame 2: transitions on; frame 3: grow
    requestAnimationFrame(() => {
      setMorphOn(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setGeo(openGeo())));
    });
    later(() => setShowContent(true), fast ? 0 : 340);
    later(() => shellRef.current?.focus(), fast ? 0 : 400);
  }, [closedGeo, openGeo]);
  const doClose = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    clearTimers();
    const fast = reduce();
    setOpenState(false);
    setShowContent(false);
    later(() => setGeo(closedGeo()), fast ? 0 : 180);
    later(() => {
      setFixedMode(false);
      setMorphOn(false);
      if (isDesktop()) setShowLabel(true);
      else {
        setVisible(false);
        phoneTrigger.current?.focus();
      }
    }, fast ? 0 : 180 + MORPH_MS);
  }, [closedGeo, phoneTrigger]);
  useEffect(() => {
    controlRef.current = { open: doOpen };
    return () => {
      controlRef.current = null;
      clearTimers();
    };
  }, [controlRef, doOpen]);
  const setOpen = (v: boolean) => (v ? doOpen() : doClose());

  // Esc closes; the page behind doesn't scroll while the panel is up
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const morphing = `left ${MORPH_MS}ms ${MORPH_EASE}, top ${MORPH_MS}ms ${MORPH_EASE}, width ${MORPH_MS}ms ${MORPH_EASE}, height ${MORPH_MS}ms ${MORPH_EASE}, border-radius ${MORPH_MS}ms ${MORPH_EASE}, background-color ${MORPH_MS}ms ${MORPH_EASE}`;

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/55 backdrop-blur-[3px] transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* The closed pill starts where the design puts it (x1763 / y782 of the page) and FOLLOWS the
          scroll (user: "ჩასქროლვას თუ დავიწყებ, უნდა გამომყვეს"): it rides up with the page until
          it reaches the middle of the screen, then stays there (position: sticky), and leaves
          with the content before the footer. The column runs from the pill's place to the end
          of the page body; the sticky slot in it is also what the morph measures. On phones the
          column is invisible and the morph grows out of the inline button instead. */}
      {/* z: the column is a stacking context, so while the pill is open (fixed) it has to sit
          above the backdrop (z 60) or the dimmed backdrop would cover the panel too */}
      <div className="pointer-events-none absolute max-lg:invisible" style={{ ...PILL_COLUMN, zIndex: fixedMode ? 61 : 30 }}>
        <div
          ref={anchorRef}
          className="pointer-events-auto sticky"
          style={{ top: `calc(50svh + 48px - ${r(113)})`, height: r(226) }}
        >
      <div
        ref={shellRef}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label={t.pricingPage.calcTab}
        tabIndex={-1}
        onClick={() => {
          if (!open) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        {...(!open ? { "aria-expanded": false, "aria-roledescription": "button" } : {})}
        className={`${fixedMode ? "fixed z-[61]" : "absolute inset-0"} overflow-hidden border border-white/[0.09] outline-none ${open ? "" : "cursor-pointer hover:!bg-[#343333]"}`}
        style={{
          ...(fixedMode && geo
            ? { left: geo.left, top: geo.top, width: geo.width, height: geo.height, borderRadius: geo.radius }
            : { borderRadius: r(36) }),
          backgroundColor: open ? "#211f1f" : "#2b2a2a",
          borderColor: open ? "rgba(17,163,42,0.28)" : undefined,
          boxShadow: open ? "0 30px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03), 0 0 80px rgba(17,163,42,0.10)" : "none",
          transition: fixedMode && morphOn ? `${morphing}, border-color ${MORPH_MS}ms ${MORPH_EASE}, box-shadow ${MORPH_MS}ms ${MORPH_EASE}` : undefined,
          // the column is invisible on phones; the open panel must show anyway
          visibility: fixedMode ? "visible" : visible ? undefined : "hidden",
        }}
      >
        {/* the pill's label */}
        <span
          aria-hidden={open}
          className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap font-heading text-brand transition-[opacity,filter] duration-200"
          style={{ opacity: showLabel ? 1 : 0, filter: showLabel ? "none" : "blur(4px)", color: "#11A32A", fontSize: r(18), fontWeight: 500, lineHeight: 1, letterSpacing: LS, writingMode: "vertical-rl" }}
        >
          {t.pricingPage.calcTab}
        </span>

        {/* the calculator — laid out at its open width all the time (so it can be measured), and
            faded in once the box has grown */}
        <div
          className="absolute left-0 top-0 h-full overflow-y-auto"
          {...(showContent ? { "data-show": "" } : {})}
          style={{ pointerEvents: showContent ? "auto" : "none" }}
          {...(!showContent ? { inert: true } : {})}
        >
          <div
            ref={contentRef}
            className="relative"
            style={{ width: `min(${r(1240, 400)}, calc(100vw - 24px))`, padding: `${r(46, 20)} ${r(54, 16)} ${r(52, 20)}` }}
          >
            {/* the pricing scene light, coming up behind the summary once the panel has opened */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700"
              style={{ opacity: showContent ? 1 : 0 }}
            >
              <div className="absolute" style={{ right: r(-260, -300), top: r(-140, 120), width: r(950, 700), height: r(901, 660) }}>
                <SceneLight variant="pricing" style={{ inset: 0, width: "100%", height: "100%" }} />
              </div>
            </div>

            {/* header on the SAME two columns as the body below, so the line under the title ends
                exactly where the resource cards end; on the right, the close button at the top and
                the Monthly / Annual switch under it, sitting on the line's last row */}
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]" style={{ gap: r(28, 12) }}>
              <div>
                <p className="pr-st flex items-center font-heading font-light text-white/55" style={{ ["--d" as string]: 0, gap: r(10, 8), fontSize: r(14, 12) }}>
                  <Image src="/section-hero/hatch.svg" alt="" width={36} height={12} aria-hidden="true" unoptimized style={{ width: r(26, 20), height: "auto" }} />
                  {t.pricingPage.eyebrow}
                </p>
                <p className="pr-st font-heading font-medium text-white/95" style={{ ["--d" as string]: 1, fontSize: r(34, 21), marginTop: r(10, 6), letterSpacing: "-0.015em", lineHeight: 1.1 }}>
                  {t.pricingPage.calcTab}
                </p>
                <p className="pr-st font-heading font-light text-white/55 max-lg:hidden" style={{ ["--d" as string]: 2, fontSize: r(16, 13.5), lineHeight: 1.55, marginTop: r(14), textWrap: "pretty" }}>
                  {t.s8.body}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between" style={{ gap: r(20, 12) }}>
                <button
                  type="button"
                  aria-label={t.pricingPage.calcClose}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="pr-st flex cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/70 transition-[color,border-color,transform] duration-300 hover:rotate-90 hover:border-brand hover:text-brand"
                  style={{ ["--d" as string]: 1, width: r(44, 34), height: r(44, 34) }}
                >
                  <svg aria-hidden="true" viewBox="0 0 12 12" fill="none" style={{ width: "38%", height: "38%" }}>
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </button>
                <div className="pr-st max-lg:hidden" style={{ ["--d" as string]: 2, paddingBottom: r(2) }}>
                  <Toggle annual={annual} setAnnual={setAnnual} t={t} />
                </div>
              </div>
            </div>
            <div className="pr-st relative lg:hidden" style={{ ["--d" as string]: 2, marginTop: r(18) }}>
              <Toggle annual={annual} setAnnual={setAnnual} t={t} />
            </div>

            <div className="relative grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]" style={{ gap: r(28, 14), marginTop: r(34, 18) }}>
              {/* resource cards */}
              {/* the three cards share the receipt's full height (flex-1 each), so the left and the
                  right column start and end on the same lines */}
              <div className="flex flex-col" style={{ gap: r(14, 10) }}>
                {PRICING_ROWS.map((row, i) => {
                  // how much of the row's range is picked (sqrt, so the first GB of a 1 TB range
                  // still visibly move the bar)
                  const share = Math.max(0.03, Math.sqrt((counts[row.key] - 1) / (row.max - 1)));
                  return (
                    <div
                      key={row.key}
                      className="pr-st flex flex-1 flex-col justify-center border border-white/[0.07] bg-white/[0.025] font-heading transition-colors duration-300 hover:border-white/[0.12]"
                      style={{ ["--d" as string]: 3 + i, borderRadius: r(18, 14), padding: `${r(22, 14)} ${r(26, 14)} ${r(20, 14)}` }}
                    >
                      <div className="flex items-center justify-between" style={{ gap: r(16, 10) }}>
                        <div className="min-w-0">
                          <p className="text-white/90" style={{ fontSize: r(19, 15) }}>
                            {t.s8.rows[i]!.label}
                          </p>
                          <p className="font-light text-white/45" style={{ fontSize: r(13.5, 11), marginTop: r(5, 3) }}>
                            {t.s8.rows[i]!.unit} · {t.s8.rows[i]!.max}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center" style={{ gap: r(22, 10) }}>
                          {/* one pill: − value + */}
                          <div className="flex items-center rounded-full border border-white/[0.12] bg-white/[0.03]" style={{ padding: r(4, 3) }}>
                            {([-1, 1] as const).map((d) => (
                              <button
                                key={d}
                                type="button"
                                aria-label={fill(d < 0 ? t.a11y.decrease : t.a11y.increase, { name: t.s8.rows[i]!.label })}
                                onClick={() => step(row.key, d, row.max)}
                                onPointerDown={pressRipple}
                                disabled={d < 0 ? counts[row.key] <= 1 : counts[row.key] >= row.max}
                                className={STEP_IN_CLASS}
                                style={{ width: r(36, 30), height: r(36, 30), fontSize: r(18, 16), order: d < 0 ? 0 : 2 }}
                              >
                                {d < 0 ? "−" : "+"}
                              </button>
                            ))}
                            <CountInput
                              value={counts[row.key]}
                              max={row.max}
                              label={t.s8.rows[i]!.label}
                              onChange={(v) => setCount(row.key, v, row.max)}
                            />
                          </div>
                          <span className="text-right font-light tabular-nums text-white/75 max-lg:hidden" style={{ minWidth: r(104), fontSize: r(17) }}>
                            {fmtPrice(row.price * counts[row.key] * factor)}
                            <span className="text-white/40" style={{ fontSize: r(13) }}>
                              {suffix}
                            </span>
                          </span>
                        </div>
                      </div>
                      <RangeBar
                        value={counts[row.key]}
                        max={row.max}
                        share={share}
                        label={t.s8.rows[i]!.label}
                        onChange={(v) => setCount(row.key, v, row.max)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* the receipt: total, breakdown, the free month, the CTA */}
              <div
                className="pr-st flex flex-col border border-brand/25 font-heading"
                style={{
                  ["--d" as string]: 4,
                  borderRadius: r(20, 16),
                  padding: `${r(28, 18)} ${r(30, 18)} ${r(28, 18)}`,
                  background: "linear-gradient(160deg, rgba(17,163,42,0.10) 0%, rgba(17,163,42,0.03) 45%, rgba(255,255,255,0.015) 100%)",
                }}
              >
                <p className="text-white/65" style={{ fontSize: r(15, 13.5) }}>
                  {annual ? t.s8.totalAnnual : t.s8.totalMonthly}
                </p>
                <p className="flex items-baseline" style={{ marginTop: r(8, 4) }} aria-live="polite">
                  {/* key: a changed total re-mounts and plays .pr-pop */}
                  <span key={`${total}-${annual}`} className="pr-pop font-medium tabular-nums text-brand" style={{ fontSize: r(62, 36), lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {fmtPrice(total)}
                  </span>
                  <span className="font-light text-white/50" style={{ fontSize: r(18, 13), marginLeft: r(6, 4) }}>
                    {suffix}
                  </span>
                </p>
                <ul className="flex flex-col border-t border-white/[0.08] font-light" style={{ marginTop: r(24, 16), paddingTop: r(18, 12), gap: r(10, 7), fontSize: r(14.5, 12.5) }}>
                  {PRICING_ROWS.map((row, i) => (
                    <li key={row.key} className="flex items-center justify-between text-white/60">
                      <span>
                        {t.s8.rows[i]!.label} <span className="text-white/35">× {counts[row.key]}</span>
                      </span>
                      <span className="tabular-nums text-white/80">{fmtPrice(row.price * counts[row.key] * factor)}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex items-start font-light text-white/50" style={{ gap: r(8), marginTop: r(20, 14), fontSize: r(13.5, 11.5), lineHeight: 1.45 }}>
                  <span className="text-brand" style={{ marginTop: "0.05em" }}>
                    <Check size={r(15, 13)} />
                  </span>
                  {t.s8.freeNote}
                </p>
                <div className="mt-auto" style={{ paddingTop: r(24, 16) }}>
                  <SignupLink
                    placement="pricing-calculator"
                    className="relative inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-full bg-brand font-heading font-medium text-[#0f1a10] transition-[background-color,transform] duration-300 hover:bg-[#19b935] active:scale-[0.98]"
                    style={{ height: r(56, 48), fontSize: r(17, 14.5) }}
                  >
                    {t.s8.cta} <ButtonArrow size="1.15em" opacity={0.9} />
                  </SignupLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  );
}

// The number between − and +: typeable too (user, 2026-11-10). Digits only; a value above the
// row's limit is capped the moment it is typed, so the price can never show more than the max.
// An empty field is allowed while typing and goes back to the current value (min 1) on blur.
function CountInput({ value, max, label, onChange }: { value: number; max: number; label: string; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={draft ?? String(value)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, String(max).length);
        if (!digits) {
          setDraft("");
          return;
        }
        const n = Math.min(max, Math.max(1, Number(digits)));
        setDraft(Number(digits) > max ? String(max) : digits);
        onChange(n);
      }}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => setDraft(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          setDraft(null);
          onChange(value + (e.key === "ArrowUp" ? 1 : -1));
        }
      }}
      className="rounded-md bg-transparent text-center tabular-nums text-white/95 outline-none transition-colors focus:bg-white/[0.06]"
      style={{ width: r(48, 34), fontSize: r(18, 15), order: 1 }}
    />
  );
}

// The bar under each row is a slider (user: "ბარის მაუსით გაზრდა-დაპატარავებაც"), with no knob —
// it keeps the plain 3px line (user: "მრგვალი სახელური არ უნდა ჰქონდეს"); the hit area around it
// is just taller than the line. Drag or click anywhere on it, or use the arrow keys / Page Up-Down
// / Home-End once it has focus. While dragging, the fill follows the pointer CONTINUOUSLY (the
// value itself steps — vCPU only has 16 — and tying the fill to it made the bar jump); on release
// it settles onto the value's own position with the usual ease. The fill keeps the sqrt scale
// (share = √((v−1)/(max−1))), so the pointer maps back through v = 1 + f² × (max − 1).
function RangeBar({
  value,
  max,
  share,
  label,
  onChange,
}: {
  value: number;
  max: number;
  share: number;
  label: string;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null); // the pointer's fraction while dragging
  const pressed = useRef(false);
  // a click animates to its spot (the fill eases there); only a real drag follows the pointer
  const fromPointer = (clientX: number, follow: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - b.left) / b.width));
    if (follow) setDrag(f);
    onChange(1 + f * f * (max - 1));
  };
  const release = () => {
    pressed.current = false;
    setDrag(null);
  };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(1, Math.round(max / 10));
    const next =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? value + 1
      : e.key === "ArrowLeft" || e.key === "ArrowDown" ? value - 1
      : e.key === "PageUp" ? value + big
      : e.key === "PageDown" ? value - big
      : e.key === "Home" ? 1
      : e.key === "End" ? max
      : null;
    if (next === null) return;
    e.preventDefault();
    onChange(next);
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pressed.current = true;
    fromPointer(e.clientX, false);
  };
  const width = drag ?? share;
  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={down}
      onPointerMove={(e) => pressed.current && fromPointer(e.clientX, true)}
      onPointerUp={release}
      onPointerCancel={release}
      onKeyDown={onKey}
      className="relative cursor-pointer touch-none select-none rounded-full outline-none focus-visible:ring-1 focus-visible:ring-white/20"
      style={{ height: r(16, 20), marginTop: r(9, 4), marginBottom: r(-6, -6) }}
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white/[0.07]" style={{ height: r(3) }}>
        <div
          className={`h-full rounded-full ${drag === null ? "transition-[width] duration-500 ease-out" : ""}`}
          style={{ width: `${Math.max(0.03, width) * 100}%`, background: "linear-gradient(90deg, #11A32A, #8FC6FF)" }}
        />
      </div>
    </div>
  );
}
