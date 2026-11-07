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
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://analytics.usectl.com`,
  `worker-src 'self' blob:`,
  // the hero's "Book a demo" popup frames the team's Google Calendar appointment schedule
  // (BOOKING_EMBED_URL in src/lib/nav.ts). Without this the iframe is simply blocked and the
  // popup shows an empty window — so this line and that URL belong together.
  `frame-src https://calendar.google.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
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
