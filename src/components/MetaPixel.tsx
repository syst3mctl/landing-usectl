"use client";

// Meta Pixel — the React side. Rendered once from app/_site/shell.tsx; renders nothing, ever.
//
// Two things happen here and nowhere else:
//   1. the Pixel is made live (and a single PageView sent) once the cookie banner says yes;
//   2. SignupClick is sent when a visitor leaves for the manager's login — see below.
//
// Never emitted from this repo: CompleteRegistration / Lead. A signup only actually happens on
// manager.usectl.com, so that event belongs there (META-PIXEL-HANDOFF.md). A click here is a
// click, nothing more.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, startPixel, stopPixel, trackMeta, trackPageView } from "@/lib/metaPixel";
import { SIGNUP_URL } from "@/lib/nav";
import { useConsent } from "@/lib/useConsent";

// What counts as a signup click: the host AND path of SIGNUP_URL, read from it rather than written
// out again, so moving the manager's login can't leave this matching nothing.
const SIGNUP = new URL(SIGNUP_URL);

export function MetaPixel() {
  const consent = useConsent();
  const pathname = usePathname();
  const live = consent === "granted" && META_PIXEL_ID !== "";

  // init + exactly ONE PageView, re-running only on a real pathname change.
  //
  // The hash the scene writes on every page change (SECTION_HASHES, via replaceState) is NOT a
  // pathname change, so scrolling through the nine states sends nothing. The one in-app route
  // change that exists, EN ⇄ KA, is a full page load by design (LangSwitcher), so in practice this
  // fires once per document; the pathname dependency is what keeps that true if it ever becomes a
  // client navigation.
  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    const send = () => {
      if (cancelled) return;
      if (startPixel()) trackPageView();
    };
    // after the page is interactive, like SessionReplay — the hero's first paint comes first
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(send);
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(handle);
      };
    }
    const timer = window.setTimeout(send, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [live, pathname]);

  // SignupClick — ONE delegated listener for all eight links that point at the manager's login
  // (`data-cta` = where it was clicked; CtaPlacement in lib/nav.ts lists them). One listener, not
  // a handler per link, is what guarantees a single event per interaction.
  //
  // It never calls preventDefault, never rewrites the href and never delays the navigation, so it
  // cannot collide with the two handlers that DO touch clicks: SessionReplay's capture-phase
  // `?lsid=` rewrite and the scene's own hash navigation. Capture phase for the same reason
  // SessionReplay uses it — nothing in between can stop the event from reaching us.
  //
  // `auxclick` is there because a middle click opens the manager in a new tab and is just as much
  // a signup click; browsers do not fire `click` for it. Modified clicks (⌘/ctrl/shift) DO fire
  // `click`, open a tab, and count.
  useEffect(() => {
    if (!live) return;

    const onClick = (e: MouseEvent) => {
      try {
        if (e.button !== 0 && e.button !== 1) return; // left or middle; right-click is not a visit
        const anchor = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href]") : null;
        if (!anchor) return;
        const url = new URL(anchor.href, window.location.href);
        if (url.hostname !== SIGNUP.hostname || url.pathname !== SIGNUP.pathname) return;
        trackMeta("SignupClick", { placement: anchor.dataset.cta ?? "unknown" });
      } catch {
        /* a click must never fail because of analytics */
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, [live]);

  // withdrawal through the footer's "Cookie settings" link: fbq('consent','revoke')
  useEffect(() => {
    if (consent === "denied") stopPixel();
  }, [consent]);

  return null;
}
