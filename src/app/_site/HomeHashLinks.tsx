"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { STATE_BY_HASH, STATE_STORAGE_KEY } from "@/lib/nav";

// On the legal pages and /pricing. The header and the burger menu link to the scene's sections
// with bare hashes ("#the-machine") — on the home page the scene catches those itself, but here a
// bare hash would just scroll nowhere. So a click on one goes to the home page WITH that section.
//
// It is a CLIENT-SIDE navigation (router.push, the home page prefetched on mount) — it used to be a
// full page load, which made going back to the landing feel slow (user, 2026-11-10: "pricing-დან
// მთავარ გვერდზე ცოტა დიდხანს უნდება"). The scene does not need a fresh document for this: the
// page to open is handed over through the same sessionStorage key a reload uses (the URL may
// not carry the hash yet when the scene mounts), and html[data-restoring] — what the pre-paint
// script sets on a reload — hides the stage until the scene has landed there.
// The logo means "the start of the landing": the saved page is cleared, so it opens on the hero.
// Capture phase + preventDefault, so next/link sees a handled click and stays out of it.

const restoringScene = () =>
  !window.matchMedia("(max-width: 1023px)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function HomeHashLinks({ home }: { home: string }) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(home);
  }, [router, home]);

  useEffect(() => {
    const go = (hash: string) => {
      const state = hash ? STATE_BY_HASH[hash] : undefined;
      try {
        if (state === undefined) sessionStorage.removeItem(STATE_STORAGE_KEY);
        else sessionStorage.setItem(STATE_STORAGE_KEY, String(state));
      } catch {
        /* storage blocked: the scene reads the hash instead */
      }
      if (state && restoringScene()) {
        const root = document.documentElement;
        root.setAttribute("data-restoring", "");
        window.setTimeout(() => root.removeAttribute("data-restoring"), 4000); // safety net only
      }
      router.push(home + hash);
    };
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        e.preventDefault();
        go(href);
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === home) {
        e.preventDefault();
        go(url.hash);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [home, router]);

  return null;
}
