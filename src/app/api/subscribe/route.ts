import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/nav";

// The footer's "Subscribe" box posts here. The job is only to get the visitor's address into our
// inbox so we can reach out later — nothing is stored on our side.
//
// Delivery is provider-agnostic and picked up from the environment, so no key ever lives in the
// repo (see .env.example):
//   WEB3FORMS_ACCESS_KEY — simplest route: web3forms.com forwards the submission to whatever
//                          address the key was created for. No domain verification, no account.
//   RESEND_API_KEY       — alternative: a real transactional send, needs SUBSCRIBE_TO and
//                          (for a custom From) a verified domain on resend.com.
// With neither set the route still answers 200 and logs the address to the server console, so the
// UI can be developed and tested before the key exists.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TO = process.env.SUBSCRIBE_TO ?? CONTACT_EMAIL;
const FROM = process.env.SUBSCRIBE_FROM ?? "onboarding@resend.dev";

// --- the "don't send it 100 times" plan -------------------------------------------------------
// Four independent layers; the client has two more (a disabled button while in flight and a
// localStorage guard), but those protect an honest visitor, not an attacker, so the real limits
// live here:
//   1. per-IP burst limit  — at most MAX_PER_IP accepted submissions per hour from one address;
//   2. a GLOBAL ceiling    — at most MAX_GLOBAL accepted submissions per hour in total, whoever
//                            they claim to be. Layer 1 can only ever be as good as our idea of
//                            who the caller is (see clientIp below), and a caller who can invent
//                            addresses gets a fresh per-IP allowance every time; this layer does
//                            not depend on identity at all, so it is the one that actually caps
//                            the mail volume. It is set well above any plausible real demand for
//                            a landing-page form, so honest visitors never meet it.
//   3. per-email dedupe    — the same address is forwarded once per DEDUPE_MS, further tries get
//                            a friendly 200 WITHOUT a second email;
//   4. a honeypot field    — bots fill every input they see; a filled "company" field is answered
//                            like a success and dropped silently.
// The maps are per server instance and reset on redeploy (and are per-lambda on serverless) —
// fine for a landing-page form; move to a shared store (KV/Redis) if this ever needs to be exact.
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_IP = 3;
const MAX_GLOBAL = 60;
const DEDUPE_MS = 24 * 60 * 60 * 1000; // 1 day
const MAX_ENTRIES = 5000; // hard ceiling so the maps can't grow without bound

const ipHits = new Map<string, number[]>();
const emailSeen = new Map<string, number>();
let globalHits: number[] = [];

function prune(now: number) {
  for (const [ip, hits] of ipHits) {
    const fresh = hits.filter((t) => now - t < WINDOW_MS);
    if (fresh.length) ipHits.set(ip, fresh);
    else ipHits.delete(ip);
  }
  for (const [email, t] of emailSeen) {
    if (now - t > DEDUPE_MS) emailSeen.delete(email);
  }
  globalHits = globalHits.filter((t) => now - t < WINDOW_MS);
  // Paranoia: if something still blew the maps up, drop the OLDEST entries down to the ceiling.
  // This used to be a .clear() — which handed everyone a fresh allowance at once, so filling the
  // map was itself a way to reset a limit. Evicting by age keeps the recent (i.e. the only
  // interesting) entries, and the worst an attacker gets is the eviction of stale rows.
  trim(ipHits, (hits) => Math.max(...hits));
  trim(emailSeen, (t) => t);
}

function trim<V>(map: Map<string, V>, lastSeen: (v: V) => number) {
  if (map.size <= MAX_ENTRIES) return;
  const byAge = [...map.entries()].sort((a, b) => lastSeen(a[1]) - lastSeen(b[1]));
  for (let i = 0; i < byAge.length - MAX_ENTRIES; i++) map.delete(byAge[i]![0]);
}

// The visitor's address, as trustworthily as this can be known.
//
// The first entry of X-Forwarded-For is NOT trustworthy: a proxy APPENDS to that header, so
// anything the client sent arrives in front of the real address. Reading [0] meant a caller who
// had just been 429'd could add `X-Forwarded-For: 9.9.9.9` and be a brand-new visitor — which is
// exactly what happened when this was tested (429, then 200 with the header set).
//
// Order below, most trustworthy first:
//   1. cf-connecting-ip — Cloudflare fronts usectl.com and OVERWRITES this on every request, so a
//      client-sent value cannot survive. (x-vercel-forwarded-for behaves the same on Vercel.)
//   2. x-real-ip — set by the proxy itself, single value, no list to pick from.
//   3. X-Forwarded-For — last resort, and read from the RIGHT: the final entry is the one appended
//      by the hop closest to us, i.e. the only one the client could not have written.
// With no proxy at all (local `next start`) every header is absent and everyone shares "unknown",
// which is the safe direction to fail: the limit becomes global instead of disappearing.
function clientIp(req: Request) {
  const trusted = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip");
  if (trusted?.trim()) return trusted.trim();

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1]!;
  }
  return "unknown";
}

// Deliberately loose — the point is to catch typos, not to re-implement RFC 5322.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

type Payload = { email?: unknown; consent?: unknown; company?: unknown };

async function deliver(email: string, consent: boolean) {
  const subject = `usectl landing — new subscriber: ${email}`;
  const lines = [
    `Email: ${email}`,
    `Terms accepted: ${consent ? "yes" : "no"}`,
    `Source: usectl.com footer subscribe form`,
  ];

  const web3 = process.env.WEB3FORMS_ACCESS_KEY;
  if (web3) {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: web3,
        subject,
        from_name: "usectl landing",
        email, // shows up as the reply-to address
        message: lines.join("\n"),
      }),
    });
    if (!res.ok) throw new Error(`web3forms ${res.status}`);
    return "web3forms";
  }

  const resend = process.env.RESEND_API_KEY;
  if (resend) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resend}` },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject,
        text: lines.join("\n"),
      }),
    });
    if (!res.ok) throw new Error(`resend ${res.status}`);
    return "resend";
  }

  console.warn(`[subscribe] no mail provider configured — would send to ${TO}:\n${lines.join("\n")}`);
  return "logged";
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  // honeypot: a real visitor never sees this field
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, dropped: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid-email" }, { status: 400 });
  }

  // the terms box is required (the UI refuses first; this is the backstop for anything posting
  // straight at the endpoint)
  if (body.consent !== true) {
    return NextResponse.json({ ok: false, error: "consent-required" }, { status: 400 });
  }

  const now = Date.now();
  prune(now);

  const ip = clientIp(req);
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_IP) {
    return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  // identity-independent backstop — see layer 2 at the top of this file
  if (globalHits.length >= MAX_GLOBAL) {
    return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  // already forwarded recently → answer like a success, send nothing
  const last = emailSeen.get(email);
  if (last !== undefined && now - last < DEDUPE_MS) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    const via = await deliver(email, body.consent === true);
    emailSeen.set(email, now);
    ipHits.set(ip, [...hits, now]);
    globalHits.push(now);
    return NextResponse.json({ ok: true, via });
  } catch (err) {
    console.error("[subscribe] delivery failed", err);
    return NextResponse.json({ ok: false, error: "send-failed" }, { status: 502 });
  }
}
