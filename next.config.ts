import type { NextConfig } from "next";

// The landing page shipped with no security headers at all — a check against the live site
// returned nothing but `x-powered-by: Next.js`. Everything below is set here rather than in the
// Cloudflare dashboard for the same reason the GA id lives in env and not in a pasted tag: a
// setting that only exists outside the repo is one redeploy (or one dashboard edit) away from
// being lost silently.

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy, WITHOUT nonces — deliberately.
//
// Next's nonce route (proxy.ts) forces every page to be dynamically rendered: no static
// generation, no CDN caching. This page is prerendered and served by Cloudflare with
// `s-maxage=31536000`, and a lot of work went into its load time, so trading that for a
// strictly-better script policy is not worth it here. The "Without Nonces" variant in Next's own
// CSP guide (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md) is what
// this is.
//
// What `'unsafe-inline'` costs and what the policy still buys:
//   · it must be there — Next's bootstrap script, the JSON-LD block in layout.tsx and every
//     inline style (React style props, and every transform GSAP writes while the scene plays)
//     are inline;
//   · what remains enforced is still the part that matters for a brochure site: a script can
//     only be LOADED from this origin or googletagmanager, the page can't be framed, forms can't
//     be pointed at another host, <base> can't be rewritten, and no plugins can run.
//
// Allow-list notes:
//   · googletagmanager / google-analytics — GA4 via @next/third-parties (layout.tsx); gtag.js is
//     fetched from googletagmanager and beacons go to several google-analytics subdomains
//     (region-specific `*.analytics.google.com` included). With NEXT_PUBLIC_GA_ID unset nothing
//     is loaded, and the allowance costs nothing.
//   · `blob:`/`data:` on img-src — next/image and the inline SVG artwork.
//   · fonts are self-hosted by next/font at build time, so font-src stays 'self'.
//   · 'unsafe-eval' in development only: React uses eval there to rebuild server stacks.
//   · analytics.usectl.com + `worker-src blob:` — the self-hosted OpenReplay session replay
//     (src/components/SessionReplay.tsx). It posts to `/ingest` on that host, and the tracker
//     runs its uploader in a worker built from a blob
//     (`new Worker(URL.createObjectURL(new Blob([...])))`, verified in the package). Without
//     BOTH, `default-src 'self'` blocks it — and since the component swallows its own start-up
//     errors, the recording would simply never happen, with nothing in the console to say so.
//   · api.web3forms.com — the footer's Subscribe box posts there straight from the BROWSER
//     (src/components/layout/SubscribeForm.tsx). It has to be the browser: Web3Forms' free plan
//     refuses server-side submissions, so the old route through /api/subscribe could not deliver.
//     Without this line the fetch is blocked by connect-src and the form can only ever fail.
//   · connect.facebook.net + www.facebook.com — the Meta Pixel (src/components/MetaPixel.tsx,
//     src/lib/metaPixel.ts). fbevents.js is fetched from connect.facebook.net; the events
//     themselves go to facebook.com/tr as an IMAGE request, and fbevents.js also uses fetch for
//     some of them, which is why facebook.com appears in both img-src and connect-src. Nothing is
//     loaded at all until the cookie banner is accepted and NEXT_PUBLIC_META_PIXEL_ID is set, so
//     the allowance costs a visitor who declines nothing.
//     connect.facebook.net is in img-src as well because fbevents reports its own failures by
//     loading `connect.facebook.net//log/error?...` as an image — see the Open Bridge note below.
//
// DELIBERATELY NOT ALLOWED — Meta "Open Bridge" (CAPI Gateway). This dataset's config
// (connect.facebook.net/signals/config/<id>) turns the OpenBridge plugin on and points it at
//     https://1c-e0e78bd7d7fd408d87142c500d5b8890.ecs.us-west-1.on.aws/events
//     (fallback https://vwdb33u4tj1q.cloud.run/events)
// i.e. fbevents wants to POST every event to a third-party gateway as well as to Meta. Whoever
// owns the dataset configured that; until it is confirmed to be usectl's own gateway, connect-src
// does not list it — a host we cannot identify should not receive visitor event data. The
// consequence is contained and was measured: the beacon to facebook.com/tr still carries every
// event, the Pixel works, and the plugin's failure is reported to Meta's log endpoint instead of
// filling the console. The clean fix is one of: add the two hosts here, or switch Open Bridge off
// in Events Manager.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com https://connect.facebook.net`,
  `font-src 'self' data:`,
  `connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://analytics.usectl.com https://api.web3forms.com https://www.facebook.com https://connect.facebook.net`,
  `worker-src 'self' blob:`,
  // the hero's "Book a demo" popup frames the team's Google Calendar appointment schedule
  // (BOOKING_EMBED_URL in src/lib/nav.ts). Without this the iframe is simply blocked and the
  // popup shows an empty window — so this line and that URL belong together.
  //
  // www.facebook.com is the Pixel's SECOND transport: fbevents.js sends most events as an image
  // GET to facebook.com/tr, but it falls back to POSTing a form inside a hidden iframe (seen in
  // the browser as a `form-action` + `frame-src` violation when it is missing). Both are the same
  // trust boundary as loading fbevents.js at all, so both are allowed; without them an event that
  // takes the fallback path is silently lost.
  `frame-src https://calendar.google.com https://www.facebook.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self' https://www.facebook.com`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // frame-ancestors above already covers this for modern browsers; kept for the old ones.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // full URL to our own pages, origin only when leaving the site (the docs/manager links).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // nothing on this page asks for a device.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // HSTS deliberately WITHOUT `includeSubDomains`/`preload`: both are effectively irreversible
  // (a preloaded domain is baked into browsers), and they would bind docs./manager.usectl.com
  // too. Both serve HTTPS today, so widening this later is safe — but it should be a decision,
  // not a side effect of adding headers.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  // don't advertise the framework/version
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
