"use client";

// Session replay (OpenReplay, self-hosted at analytics.usectl.com, admin-only).
//
// Records clicks, scrolls and page structure so we can see where visitors get stuck. Typed input
// is never recorded (defaultInputMode 2), emails in text are masked, URLs lose their query string
// and hash. Only runs on the production hosts — previews and `next dev` stay silent.
//
// Links into the dashboard get ?lsid=<this session id>; the dashboard's tracker stores it as
// `landingSession` metadata, which joins a landing visit to the signup that follows it.
//
// The tracker is imported after the page is idle, as its own chunk, so it never competes with the
// hero scene for the first paint.

import { useEffect } from "react";

const HOSTS = new Set(["usectl.com", "www.usectl.com"]);
const PROJECT_KEY = "DfkHZqqNNpgulYasVwNQ";
const INGEST_POINT = "https://analytics.usectl.com/ingest";
const DASHBOARD_HOST = "manager.usectl.com";

export function SessionReplay() {
  useEffect(() => {
    if (!HOSTS.has(window.location.hostname)) return;
    let sessionId: string | null = null;
    let cancelled = false;

    const start = async () => {
      const { tracker } = await import("@openreplay/tracker");
      if (cancelled) return;
      tracker.configure({
        projectKey: PROJECT_KEY,
        ingestPoint: INGEST_POINT,
        respectDoNotTrack: true,
        captureIFrames: false,
        consoleMethods: ["error"],
        defaultInputMode: 2,
        obscureInputEmails: true,
        obscureInputNumbers: true,
        obscureTextEmails: true,
        network: { capturePayload: false, ignoreHeaders: true, sessionTokenHeader: false, failuresOnly: false, captureInIframes: false },
        canvas: { disableCanvas: true },
        urls: { urlSanitizer: (url: string) => url.split(/[?#]/)[0] },
      });
      await tracker.start();
      if (tracker.isActive()) sessionId = tracker.getSessionID() ?? null;
    };

    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1500));
    const go = () => idle(() => { start().catch(() => { /* blocked or opted out — the page works without it */ }); });
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });

    // Capture phase: rewrite the href before the browser follows the link.
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!a || !sessionId) return;
      try {
        const url = new URL(a.href);
        if (url.hostname !== DASHBOARD_HOST) return;
        url.searchParams.set("lsid", sessionId);
        a.href = url.toString();
      } catch { /* not a parseable URL */ }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      cancelled = true;
      window.removeEventListener("load", go);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
