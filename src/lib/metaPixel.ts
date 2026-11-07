"use client";

// Meta (Facebook) Pixel — the plumbing. The React side is components/MetaPixel.tsx.
//
// Meta's copy-paste base snippet is deliberately NOT used: it fires `init` + `PageView` the moment
// it is parsed (i.e. before the visitor has answered the cookie banner), it ships a <noscript>
// tracking image that fires with no consent and cannot be gated at all, and it hardcodes the
// dataset id in the markup. What is kept from it is the one part that matters — the `fbq` stub,
// rewritten below with the same contract, so calls made before fbevents.js has finished loading
// are queued instead of lost.
//
// The id comes from NEXT_PUBLIC_META_PIXEL_ID (inlined at build time; unset ⇒ everything here is a
// no-op). It must be the SAME dataset as manager.usectl.com, which is the only place allowed to
// emit CompleteRegistration — see META-PIXEL-HANDOFF.md.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

const SRC = "https://connect.facebook.net/en_US/fbevents.js";

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
  /** fbevents.js reads this when it loads — see installStub() */
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

// Module-level, so React StrictMode's double effects, a re-render and a later consent change can
// never init the same dataset twice (a second `init` means every event is counted twice).
let started = false;
let revoked = false;

/** Meta's stub, rewritten: queues calls until fbevents.js replaces `callMethod`. */
function installStub(): Fbq {
  const existing = window.fbq;
  if (existing) return existing;

  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  };
  fbq.push = fbq; // part of the stub's contract — some of Meta's own code calls fbq.push(...)
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  // THE important flag on this page. fbevents.js patches history.pushState/replaceState and adds
  // a popstate listener (`setupSPANavigation`), and every one of those re-fires PageView — unless
  // `fbq.disablePushState === true`, which it reads off this object when it loads. The scene
  // rewrites the hash on EVERY one of its nine sections (SECTION_HASHES, via replaceState), so
  // without this a visitor who just scrolled down sent nine PageViews instead of one (measured:
  // dl=…/#build, dl=…/#features, …). `fbq('set','autoConfig',false)` does NOT cover it.
  fbq.disablePushState = true;

  window.fbq = fbq;
  window._fbq ??= fbq;
  return fbq;
}

function loadScript(): void {
  if (document.querySelector(`script[src="${SRC}"]`)) return;
  const el = document.createElement("script");
  el.src = SRC;
  el.async = true;
  document.head.appendChild(el);
}

/**
 * Makes the Pixel live: installs the stub, loads fbevents.js and inits — once per page life. If
 * consent was withdrawn and then given again, this re-grants instead of re-initing.
 * Returns false when there is no id to use (or anything threw), so callers can skip their event.
 */
export function startPixel(): boolean {
  if (!META_PIXEL_ID) return false;
  try {
    if (started) {
      if (revoked) {
        window.fbq?.("consent", "grant");
        revoked = false;
      }
      return true;
    }
    installStub();
    loadScript();
    // autoConfig OFF, and it must be set BEFORE init.
    //
    // Meta's "automatic configuration" makes fbevents watch the History API and re-fire PageView
    // on every state change — and this page rewrites the hash on EVERY one of its nine sections
    // (SECTION_HASHES), so a visitor who simply scrolled down produced nine PageViews
    // (measured: dl=…/#build, dl=…/#features, …). It also auto-collects button clicks and page
    // metadata, which we neither asked for nor want: the only events this site sends are the one
    // PageView below and SignupClick.
    window.fbq?.("set", "autoConfig", false, META_PIXEL_ID);
    window.fbq?.("init", META_PIXEL_ID);
    started = true;
    return true;
  } catch {
    return false; // a blocker removed fbq, CSP refused the script, … — the page works without it
  }
}

/** Withdrawal: Meta's own switch. Nothing further is sent; the script stays loaded but silent. */
export function stopPixel(): void {
  if (!started || revoked) return;
  try {
    window.fbq?.("consent", "revoke");
  } catch {
    /* nothing to revoke */
  }
  revoked = true;
}

/** The one standard event this site sends. Everything else about the visit happens on the manager. */
export function trackPageView(): void {
  if (!started || revoked) return;
  try {
    window.fbq?.("track", "PageView");
  } catch {
    /* ignore */
  }
}

/**
 * A custom event (`trackCustom`), no-op unless the Pixel is live. Used for SignupClick; `params`
 * must never carry anything personal — a placement string is all we send.
 */
export function trackMeta(event: string, params?: Record<string, string | number>): void {
  if (!started || revoked) return;
  try {
    window.fbq?.("trackCustom", event, params);
  } catch {
    /* ignore */
  }
}
