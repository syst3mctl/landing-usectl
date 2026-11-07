"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { s } from "@/lib/grid";
import type { Dict, Lang } from "@/lib/i18n";
import { WEB3FORMS_KEY } from "@/lib/nav";

// The footer's subscribe box (desktop + phone share this one component — `variant` only picks the
// scale variable, `--s` for the 1920 canvas or `--m` for the phone one, so the markup can't drift).
//
// Behaviour asked for (2026-10-21): the send icon only APPEARS once what's typed looks like an
// address, Enter submits just like the icon, and the address lands in our inbox.
//
// WHERE IT GOES (changed 2026-11-07): the submission is posted DIRECTLY to Web3Forms from the
// browser. It used to go to our own /api/subscribe, which then called Web3Forms server-side — and
// that cannot work on their free plan ("Server side usage requires paid plan + server IP
// whitelisting"), so it would have failed in production. The access key is public by design (see
// WEB3FORMS_KEY in lib/nav.ts). /api/subscribe is kept in the repo for a future Resend switch.
//
// Not sending it a hundred times is handled here, client-side (Web3Forms does its own spam
// filtering on top, and the `botcheck` honeypot below is theirs):
//   · the button is dead while a request is in flight;
//   · after a success the field locks and the form is done;
//   · a localStorage ledger remembers which addresses this browser already sent (24h) and enforces
//     a short cooldown between sends, so a reload can't be used to spam the endpoint either.

const STORE_KEY = "usectl:subscribe:v1";
const REMEMBER_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;

// same loose check as the server's — catches typos, doesn't try to be RFC 5322
const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

type Ledger = { sent: Record<string, number>; last: number };

function readLedger(): Ledger {
  if (typeof window === "undefined") return { sent: {}, last: 0 };
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return { sent: {}, last: 0 };
    const parsed = JSON.parse(raw) as Partial<Ledger>;
    return { sent: parsed.sent ?? {}, last: parsed.last ?? 0 };
  } catch {
    return { sent: {}, last: 0 };
  }
}

function writeLedger(email: string) {
  try {
    const now = Date.now();
    const { sent } = readLedger();
    for (const [key, at] of Object.entries(sent)) {
      if (now - at > REMEMBER_MS) delete sent[key];
    }
    sent[email] = now;
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ sent, last: now } satisfies Ledger));
  } catch {
    // private mode / storage disabled — the server-side limits still apply
  }
}

type Status = "idle" | "sending" | "done" | "error";

export function SubscribeForm({
  variant,
  t,
  sendLabel,
  lang,
}: {
  variant: "desktop" | "mobile";
  t: Dict["subscribe"];
  sendLabel: string;
  lang: Lang;
}) {
  const desktop = variant === "desktop";
  // the phone footer scales with --m, the desktop canvas with --s (= `s()` from lib/grid)
  const u = useMemo(() => (desktop ? s : (px: number) => `calc(var(--m) * ${px})`), [desktop]);

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const botcheck = useRef<HTMLInputElement>(null); // honeypot (Web3Forms' own field name)

  // The send icon reports how far along the address is (2026-11-05): nothing while the field is
  // empty, the brand arrow at 40% as soon as the visitor starts typing, full strength once the
  // value is a complete address — the same `ready` test submit() uses, so the icon can't promise
  // something the form then refuses.
  // CONSENT is a separate gate: it never changes the icon, it only decides whether a click sends
  // or explains itself (clicking a disabled button fires no event at all, so the button stays
  // enabled and submit() does the refusing).
  const typed = email.trim().length > 0;
  const ready = EMAIL_RE.test(email.trim());
  const live = typed && status !== "done";
  const canSend = ready && consent && status !== "sending" && status !== "done";
  const iconOpacity = !live ? 0 : ready ? 1 : 0.4;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); // Enter must not reload the page
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value) || status === "sending" || status === "done") return;

    if (!consent) {
      setStatus("error");
      setMessage(t.needConsent);
      return;
    }

    // local guard first — a repeat of the same address never leaves the browser
    const ledger = readLedger();
    const now = Date.now();
    if (ledger.sent[value] !== undefined && now - ledger.sent[value]! < REMEMBER_MS) {
      setStatus("done");
      setMessage(t.already);
      return;
    }
    if (now - ledger.last < COOLDOWN_MS) {
      setStatus("error");
      setMessage(t.cooldown);
      return;
    }

    // Honeypot: a real visitor never sees this field, so anything in it is a bot. Answered like a
    // success and dropped — nothing is sent. (Web3Forms rejects a filled `botcheck` as well; this
    // just saves the round trip.)
    if ((botcheck.current?.value ?? "").trim() !== "") {
      setStatus("done");
      setMessage(t.thanks);
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          email: value, // Web3Forms uses this as the reply-to address
          subject: `usectl landing — new subscriber: ${value}`,
          from_name: "usectl landing",
          message: [
            `Email: ${value}`,
            `Terms accepted: ${consent ? "yes" : "no"}`,
            `Source: usectl.com footer subscribe form (${lang})`,
          ].join("\n"),
          botcheck: "",
        }),
      });
      // A success is ONLY a 2xx carrying `success: true`. Everything else — a network failure, a
      // 4xx/5xx, or a 200 with `success: false` (a wrong key, the plan's monthly cap, their spam
      // filter) — is an error here; the visitor must never be told it was sent when it wasn't.
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!res.ok || data.success !== true) {
        console.error("[subscribe] web3forms rejected the submission", res.status, data.message);
        setStatus("error");
        setMessage(t.failed);
        return;
      }
      writeLedger(value);
      setStatus("done");
      setMessage(t.thanks);
    } catch (err) {
      console.error("[subscribe] web3forms request failed", err);
      setStatus("error");
      setMessage(t.failed);
    }
  }

  const inputH = desktop ? 42 : 44;
  const iconBox = desktop ? 30 : 32;

  return (
    // the FIELD is the 232-wide one on desktop; the form itself must stay unconstrained or the
    // consent label (one line in the design) wraps
    <form onSubmit={submit} noValidate style={{ width: desktop ? "auto" : "100%" }}>
      <div className="relative" style={{ marginTop: u(desktop ? 24 : 14), width: desktop ? u(232) : "100%" }}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder={t.placeholder}
          value={email}
          disabled={status === "done"}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
          className="block w-full rounded-lg border border-white/15 bg-transparent font-heading font-light text-white/80 outline-none transition-colors placeholder:text-white/30 focus:border-white/35 disabled:opacity-60"
          style={{
            height: u(inputH),
            paddingLeft: u(14),
            // room for the icon once it's there, so the text never slides under it
            paddingRight: live ? u(iconBox + 12) : u(14),
            fontSize: desktop ? u(14) : 16, // 16px on phones: anything smaller zooms iOS Safari in
          }}
        />

        {/* The send icon — the team's public/footer/arrow-input.svg, already brand green, so the
            only thing that changes is its OPACITY: 0 → 0.4 while typing → 1 on a complete
            address. No box, no border (design board S10-Footer). */}
        <button
          type="submit"
          aria-label={sendLabel}
          // deliberately NOT disabled / aria-disabled when the box is unticked: the click is what
          // produces the "accept the terms first" hint, and a disabled control fires no events
          // (and would read as dead to a screen reader with nothing to explain why)
          tabIndex={live ? 0 : -1}
          className={`absolute flex items-center justify-center transition-opacity duration-200 ${
            live ? "pointer-events-auto" : "pointer-events-none"
          } ${canSend || status === "sending" ? "" : "cursor-not-allowed"}`}
          style={{
            top: "50%",
            right: u(4),
            width: u(iconBox),
            height: u(iconBox),
            transform: "translateY(-50%)",
            opacity: iconOpacity,
          }}
        >
          {status === "sending" ? (
            <span
              className="block animate-spin rounded-full border-2 border-white/25 border-t-brand"
              style={{ width: u(14), height: u(14) }}
            />
          ) : (
            <Image
              src="/footer/arrow-input.svg"
              alt=""
              width={20}
              height={20}
              unoptimized
              style={{ width: u(desktop ? 18 : 20), height: u(desktop ? 18 : 20) }}
            />
          )}
        </button>

        {/* honeypot — hidden from people, irresistible to bots. The name is Web3Forms' own
            convention (`botcheck`), so their side drops it too, not just submit() above. */}
        <input
          ref={botcheck}
          type="text"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      </div>

      <label
        className="flex cursor-pointer items-center font-heading font-light text-white/60"
        style={{
          marginTop: u(desktop ? 18 : 14),
          gap: u(9),
          fontSize: u(desktop ? 14.5 : 13.5),
          whiteSpace: desktop ? "nowrap" : "normal",
        }}
      >
        {/* the native box rendered as a heavy solid square in dark mode — this is the design's
            own shape instead: a thin-bordered rounded square that fills green when checked */}
        <span className="relative inline-block shrink-0" style={{ width: u(desktop ? 15 : 16), height: u(desktop ? 15 : 16) }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              // ticking it answers the "please accept the terms" hint — drop it right away
              if (e.target.checked && status === "error") {
                setStatus("idle");
                setMessage("");
              }
            }}
            className="peer absolute inset-0 m-0 cursor-pointer appearance-none border border-white/25 bg-transparent transition-colors checked:border-brand checked:bg-brand"
            style={{ borderRadius: u(4) }}
          />
          <svg
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full peer-checked:block"
          >
            <path d="M3 6.2 5.1 8.3 9 4.2" stroke="#1e1d1d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {t.consent}
      </label>

      {message ? (
        <p
          role="status"
          className={`font-heading font-light ${status === "error" ? "text-[#ff8e8e]" : "text-brand"}`}
          style={{ marginTop: u(10), fontSize: u(desktop ? 13.5 : 13), maxWidth: desktop ? u(300) : "100%" }}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
