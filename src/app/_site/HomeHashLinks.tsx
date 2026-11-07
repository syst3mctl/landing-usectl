"use client";

import { useEffect } from "react";

// On the legal pages only. The header and the burger menu link to the scene's sections with bare
// hashes ("#pricing") — on the home page the scene catches those itself, but on /privacy a bare
// hash would just scroll nowhere. So here a click on one is turned into a full load of the home
// page WITH that hash, which the scene's pre-paint restore already knows how to open.
//
// The logo (next/link to "/") is forced to a full load for the same reason the language switcher
// is: the scene expects to start from a fresh document, not from a client-side navigation.
// Capture phase + preventDefault, so next/link sees a handled click and stays out of it.

export function HomeHashLinks({ home }: { home: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        e.preventDefault();
        window.location.assign(home + href);
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === home) {
        e.preventDefault();
        window.location.assign(url.pathname + url.hash);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [home]);

  return null;
}
