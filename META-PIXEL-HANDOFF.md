# Meta Pixel — what manager.usectl.com has to do

Written 2026-11-07 by the landing-page side (branch `fb-trefik`, not deployed yet). Everything
below is already live in the landing page's code; this is the other half.

The landing page (usectl.com) and the manager are two hosts sharing one parent domain. The Pixel
only works end to end if both sides use the same dataset, read the same consent decision, and
split the events the way described here.

---

## 1. The dataset

```
2506256846565789
```

Public (it ships in the browser bundle), not a secret. **Use the same id on
manager.usectl.com** — a different one means the click on usectl.com and the signup on the manager
land in two datasets that can never be joined.

On the landing page it comes from the env var `NEXT_PUBLIC_META_PIXEL_ID`, set in the host's
environment **before the build** (Next inlines `NEXT_PUBLIC_*` at build time). Unset ⇒ no Pixel is
loaded at all.

## 2. Consent — read it, do not re-ask

The landing page shows a cookie banner and stores the answer in a cookie:

| cookie | value | domain | lifetime |
|---|---|---|---|
| `usectl_consent` | `v1:granted` or `v1:denied` | `.usectl.com` | 180 days |

* Stored **verbatim**, not percent-encoded — compare the exact string.
* `v1:` is a version prefix. If the string does not start with `v1:`, treat it as *no answer*.
* **No cookie at all = no answer = load nothing.** A visitor can reach the manager directly,
  without passing through the landing page, so the manager needs its own banner for that case;
  when the cookie already says `v1:granted` it must not ask again.
* **Without `v1:granted`, do not load the Pixel on the manager either.** The consent is for
  usectl.com as a whole.
* When a visitor withdraws consent on either host, the landing page deletes `usectl_attr`,
  `_fbp` and `_fbc` on `.usectl.com`; please do the same there.

## 3. Attribution — the cookie to read when an account is created

| cookie | content | domain | lifetime |
|---|---|---|---|
| `usectl_attr` | percent-encoded JSON | `.usectl.com` | 90 days |

```json
{"utm_source":"meta","utm_medium":"cpc","utm_campaign":"launch","utm_content":"...","utm_term":"...","ts":"2026-11-07T18:43:28.889Z"}
```

Every key is optional except that at least one `utm_*` is present; `ts` is when those UTMs were
last seen. URL-decode before `JSON.parse`. Attach it to the account/lead record at signup — that
is the join between an ad click and a real customer.

Written only after consent. **Nothing is appended to the links that point at the manager**: no
`utm_*`, no `fbclid`, no `_fbp`. That is deliberate — a query string leaks the campaign into
referrers, logs and any URL a visitor copies, and the cookie already crosses both hosts.

`_fbp` and `_fbc` are set by the Pixel itself on `.usectl.com` (`_fbc` from an `fbclid` in the
landing URL), so the manager's own Pixel picks them up with no work. Do not copy them anywhere.

## 4. The event split

| event | where | when |
|---|---|---|
| `PageView` | both | once per real page load. Not on hash/section changes — see §6 |
| `SignupClick` (custom) | landing only | a click on any link to `manager.usectl.com/login`, with `{ placement }` |
| **`CompleteRegistration`** | **manager only** | **after a real, successful signup — never on the landing page** |

The landing page never emits `CompleteRegistration` or `Lead`, and never will: a click is not a
registration. If the manager also wants `Lead`, define it there.

`SignupClick`'s only parameter is `placement`, one of:
`header`, `mobile-menu`, `pricing`, `pricing-mobile`, `closing-start`, `closing-start-mobile`,
`closing-see-how`, `closing-see-how-mobile`. No personal data is ever sent with it.

## 5. If you also use the Conversions API

* Send the **same `event_id`** from the browser and the server for the same event, or Meta counts
  it twice. (The landing page sends browser events only, so this is about the manager's own.)
* Include `fbp` / `fbc` from the cookies above in the CAPI payload.
* The CAPI access token is a real secret: server side only, never in the browser bundle.

## 6. Two things that will bite you (measured, not guessed)

1. **`fbq.disablePushState = true` before fbevents.js loads.** fbevents patches
   `history.pushState` / `replaceState` and re-fires `PageView` on every one of them. The landing
   page rewrites the hash on each of its nine sections, so without this a visitor who only
   scrolled sent **nine** PageViews. If the manager is an SPA that rewrites the URL, it has the
   same problem — set the flag and send `PageView` yourself on real route changes.
   `fbq('set','autoConfig',false,<id>)` does **not** cover this (we set that too, to stop Meta
   auto-collecting button clicks and page metadata).
2. **Testing in an automated browser shows nothing.** Meta's BotBlocking plugin drops every event
   when it detects automation: fbevents loads, `fbq` counts the event, no request is sent and
   nothing appears in the console. Test in a normal browser window, or with the automation flags
   masked.

## 7. CSP

If the manager sets a Content-Security-Policy, the Pixel needs all of these — the failure mode is
silence, not an error:

```
script-src   https://connect.facebook.net
img-src      https://www.facebook.com https://connect.facebook.net
connect-src  https://www.facebook.com https://connect.facebook.net
form-action  https://www.facebook.com
frame-src    https://www.facebook.com
```

(`form-action` + `frame-src` are needed because fbevents falls back to POSTing a form inside a
hidden iframe; `connect.facebook.net` in `img-src` because it reports its own failures as an image
load.)

## 8. Open — needs a decision from whoever owns the dataset

This dataset's config has **Open Bridge (CAPI Gateway)** switched on and points the browser at:

```
https://1c-e0e78bd7d7fd408d87142c500d5b8890.ecs.us-west-1.on.aws/events
fallback: https://vwdb33u4tj1q.cloud.run/events
```

i.e. fbevents tries to POST every event to that gateway as well as to Meta. The landing page's CSP
does **not** allow those hosts: until it is confirmed that this gateway is usectl's own, it does
not get visitor event data. Nothing is lost in the meantime — the normal beacon to
`facebook.com/tr` carries every event, verified.

Either confirm the gateway and add the two hosts to `connect-src` on both sites, or switch Open
Bridge off in Events Manager.
