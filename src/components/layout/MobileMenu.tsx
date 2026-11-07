"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CONTACT_EMAIL, CONTACT_HREF, ctaAttr, SIGNUP_URL, SYSTEMCTL_URL } from "@/lib/nav";
import type { Dict, Lang } from "@/lib/i18n";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import { ButtonArrow } from "@/components/ui/icons";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Burger menu for < 1024px (the desktop nav doesn't fit there). The button lives in the header;
// the panel is PORTALED to <body> because the header's backdrop-filter makes it the containing
// block for fixed children (and its overflow clip would cut the panel off). The panel slides in
// under the 64px header, so the header — and the close button — stay on top of it.
//
// Rebuilt 2026-11-05 to the design the user approved (design/mobile/M2-Menu-open.html, Vercel's
// menu with our colours): no "NAVIGATION" eyebrow, no 0N/ numbering, no per-row arrows, no
// gradient divider lines — just a left-aligned 24px list and ONE button, Start Now. What stays:
// the dark glass panel, the green glow low right ("ლამაზია"), the small footer row, the links'
// blur-rise stagger and the body-scroll lock.

// Anything can ask the menu to close — the stacked build's "logo goes back to the top" handler
// fires this before scrolling, so tapping the logo with the menu open does both.
export const CLOSE_MENU_EVENT = "usectl:close-menu";

type NavLink = { label: string; href: string; external?: boolean };

export function MobileMenu({
  links,
  t,
  lang,
}: {
  links: readonly NavLink[];
  t: Dict;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  // true only on the client (the portal needs document.body) — no setState-in-effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // build the open/close timeline once the portal exists
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0.01 : 0.3, ease: "power2.out" });
      if (!reduced) {
        tl.fromTo(
          panel.querySelectorAll("[data-menu-row]"),
          { autoAlpha: 0, y: 22, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.06 },
          0.08,
        );
        tl.fromTo(panel.querySelectorAll("[data-menu-foot]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08 }, 0.35);
        tl.fromTo(panel.querySelector("[data-menu-light]"), { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 1 }, 0);
      }
      tlRef.current = tl;
    },
    { dependencies: [mounted] },
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) {
      tl.timeScale(1).play();
      document.documentElement.style.overflow = "hidden";
    } else {
      tl.timeScale(1.6).reverse();
      document.documentElement.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener(CLOSE_MENU_EVENT, close);
    return () => window.removeEventListener(CLOSE_MENU_EVENT, close);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <>
      {/* public/mobile/burger.svg (brand green at 80%), drawn inline so the open state can be the
          same stroke as a plain ✕ — no bordered box, no tinted background, no glow (the user's
          reference is Vercel's bare icon). The 44px box keeps the tap target; -10px of margin
          puts the ICON's right edge on the 20px grid inset. */}
      <button
        type="button"
        aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="-mr-2.5 ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 lg:hidden"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          stroke="#11A32A"
          strokeOpacity={0.8}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 ease-out"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          <path
            d="M11 7H19M5 12H19M11 17H19"
            className="transition-opacity duration-200"
            style={{ opacity: open ? 0 : 1 }}
          />
          <path
            d="M6 6L18 18M18 6L6 18"
            className="transition-opacity duration-200"
            style={{ opacity: open ? 1 : 0 }}
          />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.a11y.menu}
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto overflow-x-hidden overscroll-contain lg:hidden"
            style={{ visibility: "hidden", opacity: 0, background: "rgba(27,26,26,0.94)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          >
            {/* the light hangs off the right edge on purpose — clipped by its own layer so it
                can never widen the panel (it did: a sideways-scrollable menu on phones/iPads) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                data-menu-light
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={{
                  right: "-30%",
                  bottom: "-10%",
                  width: "90%",
                  height: "55%",
                  background: "radial-gradient(ellipse at center, rgba(90,255,200,0.13) 0%, rgba(17,163,42,0.06) 45%, rgba(17,163,42,0) 72%)",
                  filter: "blur(30px)",
                }}
              />
            </div>

            <nav aria-label={t.a11y.mobileNav} className="relative mx-auto flex w-full max-w-[640px] flex-col px-5 pt-7 sm:px-8">
              {links.map((l) => (
                <Link
                  key={l.href}
                  data-menu-row
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => setOpen(false)}
                  className="py-3 font-heading text-[24px] leading-none text-white/[0.72] transition-colors hover:text-white active:text-white sm:text-[28px]"
                >
                  {l.label}
                </Link>
              ))}

              {/* the only button in the menu: our pill, not Vercel's white fill (the user's call) */}
              <Link
                data-menu-row
                href={SIGNUP_URL}
                {...ctaAttr("mobile-menu")}
                onClick={() => setOpen(false)}
                className="mt-8 flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/40 font-heading text-[14px] font-medium text-[#e6e6e6] transition-colors hover:border-brand hover:text-brand active:border-brand active:text-brand"
              >
                {t.header.startNow} <ButtonArrow size={16} opacity={0.8} />
              </Link>

              {/* EN / KA — the phone header is logo + burger only, so the switcher lives here */}
              <div data-menu-row className="mt-7">
                <LangSwitcher
                  lang={lang}
                  label={t.a11y.language}
                  size="menu"
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </nav>

            <div className="relative mx-auto mt-auto w-full max-w-[640px] px-5 pb-8 pt-10 sm:px-8">
              <div data-menu-foot className="flex items-center justify-between font-heading text-[13px] text-white/45">
                <a href={CONTACT_HREF} className="transition-colors hover:text-white">
                  {CONTACT_EMAIL}
                </a>
                <span>
                  &copy; 2026{" "}
                  <a
                    href={SYSTEMCTL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand transition-opacity hover:opacity-70"
                  >
                    SYSTEMCTL
                  </a>
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
