"use client";

import { useEffect, useState } from "react";
import { setConsent, CONSENT_SETTINGS_EVENT } from "@/lib/consent";
import { useConsent } from "@/lib/useConsent";
import type { Dict } from "@/lib/i18n";

// The cookie banner. Rendered once from app/_site/shell.tsx, for both languages.
//
// It is the ONLY thing that decides whether the Meta Pixel, GA4 and the OpenReplay session replay
// may load (src/lib/consent.ts) — before a choice is made, none of them does anything.
//
// It renders NOTHING on the server and nothing on the first client render: the pages are
// prerendered, so a server render that read the cookie could never match the browser. The decision
// is taken in an effect after mount, which also means the banner can't be an LCP candidate or push
// the hero scene around — it is a fixed overlay that appears a moment after the page is interactive.
//
// Accept and Reject are deliberately the same pill, the same size and the same weight: a "reject"
// that is harder to find than "accept" is not a choice.

// TODO: no privacy policy page exists on usectl.com yet. When one does, put its URL here and the
// banner renders the link by itself (t.privacy is already translated in both dictionaries).
const PRIVACY_URL: string | null = null;

const PILL =
  "flex items-center justify-center whitespace-nowrap rounded-full border border-white/25 " +
  "font-heading text-[13.5px] font-medium text-foreground transition-colors duration-300 " +
  "ease-out hover:border-brand hover:text-brand";

export function CookieBanner({ t }: { t: Dict["cookies"] }) {
  // `null` = unanswered (or answered under an older CONSENT_VERSION) ⇒ ask. Answering flips this
  // by itself, so the banner needs no "did I close it" state of its own; `reopened` only covers
  // the footers' link, which asks again after a choice has already been made.
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(CONSENT_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, reopen);
  }, []);

  if (!reopened && consent !== null) return null;

  const answer = (granted: boolean) => {
    setConsent(granted); // writes the cookie and notifies the three gated components
    setReopened(false);
  };

  return (
    // z-60: above the header (50) and the burger menu's panel (40), below the "Book a demo"
    // popup (70) — that one is a real modal and must stay on top.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6">
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t.settings}
        className="modal-panel-in pointer-events-auto mx-auto flex max-w-[780px] flex-col gap-4 rounded-2xl border border-white/10 bg-[#1b1a1a]/95 px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:gap-6"
      >
        <p className="font-heading text-[13.5px] font-light leading-[1.55] text-white/65">
          <span className="font-medium text-white/90">{t.title}. </span>
          {t.body}
          {PRIVACY_URL ? (
            <>
              {" "}
              <a
                href={PRIVACY_URL}
                className="text-white/80 underline decoration-white/25 underline-offset-2 transition-colors hover:text-brand"
              >
                {t.privacy}
              </a>
            </>
          ) : null}
        </p>
        <div className="flex shrink-0 items-center gap-3 max-sm:w-full">
          <button type="button" onClick={() => answer(false)} className={`${PILL} h-10 flex-1 px-5 sm:flex-none`}>
            {t.reject}
          </button>
          <button type="button" onClick={() => answer(true)} className={`${PILL} h-10 flex-1 px-5 sm:flex-none`}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
