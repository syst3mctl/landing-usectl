"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { BOOKING_EMBED_URL, BOOKING_URL } from "@/lib/nav";
import { OPEN_BOOK_DEMO_EVENT, setBookDemoOpen } from "@/lib/bookDemo";
import { ButtonArrow } from "@/components/ui/icons";
import type { Dict } from "@/lib/i18n";

// The hero's "Book a demo" popup: the team's Google Calendar appointment schedule in a framed
// window over a blurred page. Mounted ONCE, at page level (app/_site/landing.tsx), because the
// button exists in both builds (pinned desktop + stacked phone/reduce-motion) and only one modal
// may be in the DOM; the buttons ask for it through OPEN_BOOK_DEMO_EVENT (see lib/bookDemo.ts).
//
// Notes that matter here:
//   · the iframe is only created WHEN OPEN — closing unmounts the whole modal, so nothing of
//     Google's is loaded (or kept alive) on a visit that never clicks the button;
//   · the desktop scene's wheel/keyboard driver skips every event while this is open
//     (isBookDemoOpen()), and <html> is overflow-hidden on top of that, so the scene can't move
//     behind the popup;
//   · the CSP has to allow the frame: `frame-src https://calendar.google.com` in next.config.ts.

declare global {
  interface Window {
    // @next/third-parties' GoogleAnalytics defines this; with NEXT_PUBLIC_GA_ID unset it never
    // exists, hence the optional call below.
    gtag?: (...args: unknown[]) => void;
  }
}

// how long the closing fade runs before the modal unmounts (keep in step with the duration below)
const FADE_MS = 180;

const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

export function BookDemoModal({ t }: { t: Dict }) {
  const [open, setOpen] = useState(false);
  // The entrance is a CSS animation (.modal-in / .modal-panel-in in globals.css — see the note
  // there on why it is NOT a one-frame state flip), so `shown` exists only for the CLOSING fade:
  // it starts true and `close()` turns it off, which runs the transition before unmounting.
  const [shown, setShown] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const fadeTimer = useRef<number | null>(null);

  // true only on the client — the portal needs document.body (same pattern as MobileMenu)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const close = useCallback(() => {
    setShown(false);
    if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => setOpen(false), FADE_MS);
  }, []);

  // any "Book a demo" button, in either build
  useEffect(() => {
    const onOpen = () => {
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
      openerRef.current = document.activeElement as HTMLElement | null;
      setLoaded(false);
      setShown(true);
      setOpen(true);
      // GA4, only if gtag is really there (no NEXT_PUBLIC_GA_ID ⇒ no gtag at all)
      window.gtag?.("event", "book_demo_open");
    };
    window.addEventListener(OPEN_BOOK_DEMO_EVENT, onOpen);
    return () => {
      window.removeEventListener(OPEN_BOOK_DEMO_EVENT, onOpen);
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  // while open: the flag the scene's driver reads, the page scroll lock, Escape, and the focus trap
  useEffect(() => {
    if (!open) return;
    setBookDemoOpen(true);
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !panel.contains(active);
      if (
        e.shiftKey ? active === first || outside : active === last || outside
      ) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus({ preventScroll: true });
      }
    };
    // CAPTURE phase so it runs before the scene's own window keydown handler (which owns
    // End/Home/the arrows); that handler also bails out on isBookDemoOpen().
    window.addEventListener("keydown", onKey, true);

    return () => {
      window.removeEventListener("keydown", onKey, true);
      html.style.overflow = prevOverflow;
      setBookDemoOpen(false);
      // back to the button that opened it. preventScroll, like the focus on open below: a focus()
      // scrolls its element into view, and with the scene mid-journey that is a page the visitor
      // did not ask for (measured: an 85px drift behind the open popup).
      openerRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, close]);

  // the close button is the first thing focused, so Tab stays inside from the start
  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      // click-outside: only when the overlay ITSELF is the target (a drag ending outside the
      // panel, or a click inside it, must not close)
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-[6px] transition-opacity duration-200 lg:p-6 ${
        shown ? "modal-in opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.hero.bookDemo}
        // phone / portrait tablet: full screen. ≥1024: a framed window in the page's own style.
        className={`relative flex h-full w-full flex-col overflow-hidden border-white/10 bg-[#1b1a1a] shadow-[0_30px_80px_rgba(0,0,0,0.55)] transition-all duration-200 lg:h-[min(780px,88vh)] lg:w-[min(900px,92vw)] lg:rounded-2xl lg:border ${
          shown
            ? "modal-panel-in translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="font-heading text-[15px] font-medium text-foreground">
            {t.hero.bookDemo}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={t.bookDemo.close}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="relative flex-1">
          {/* the booking page itself — created only now, i.e. on the first open */}
          <iframe
            src={BOOKING_EMBED_URL}
            title={t.hero.bookDemo}
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 h-full w-full border-0"
          />
          {!loaded && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1b1a1a] font-heading text-[14px] font-light text-white/55">
              {t.bookDemo.loading}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center border-t border-white/10 px-5 py-3">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-heading text-[13px] font-light text-white/60 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            {t.bookDemo.newTab} <ButtonArrow size={16} />
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
