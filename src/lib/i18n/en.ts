// Every visible string on the page, in English. This object's SHAPE is the contract: `Dict` is
// `typeof en`, so a missing (or extra) key in ka.ts is a TypeScript error, not a runtime blank.
//
// Deliberately NOT here — it stays English in EVERY language (user's call, 2026-11-06, logged in
// PROJECT.md): the terminal windows (title bar + the typed rows), the pod / deploy card titles and
// statuses (`[ POD // API ]`, `RUNNING v1.4.2`, `DEPLOYING ... v2.1.0`, `BUILD: IN-PROGRESS`,
// `[ ✓ LIVE // v2.1.0 ]`, `HTTPS Active`, `POD // AI AGENT`, `ACTIVE coding-assistant`) and the
// mono spec labels (`USECTL MANAGED INFRASTRUCTURE`, `MACHINE BOUNDARY`, `DEDICATED RESOURCES`,
// `ENVIRONMENT CONFIG`). Reasons: they are a real CLI/dashboard mock a Georgian developer also
// reads in English, there is no good Georgian monospace face, and they sit in fixed-width windows
// that would wrap. They are hardcoded at their render site — flipping one into the dictionary is a
// small, local change if the team ever wants it translated.
//
// Headings that the design breaks over two lines are arrays, one entry per line (rendered with
// <br/>), so a translation can break where ITS text wants to.
//
// This object crosses the server→client boundary as a prop, so it must stay plain JSON —
// no functions. Strings that need a value spliced in carry a `{name}` placeholder (see fill()).

export const en = {
  // header + both footers; `doc` is the footer column's shorter label for the same destination
  nav: {
    machine: "The Machine",
    agents: "Agents",
    features: "Features",
    pricing: "Pricing",
    documentation: "Documentation",
    doc: "Doc",
  },

  header: {
    startNow: "Start Now",
  },

  // state 1
  hero: {
    eyebrow: "Managed Kubernetes & AI Agent Infrastructure",
    heading: "Build your product. We’ll handle the infrastructure.",
    body:
      "Deploy your apps, databases, workers, and AI agents without building a DevOps team. " +
      "usectl takes you from code to production with managed infrastructure and predictable pricing.",
    // the hero's single CTA (user 2026-11-07); startBuilding / seeHow are still state 9's pair
    bookDemo: "Book a demo",
    startBuilding: "Start Building",
    seeHow: "See how it works",
  },

  // the "Book a demo" popup (components/ui/BookDemoModal.tsx). Its title is hero.bookDemo.
  bookDemo: {
    close: "Close",
    loading: "Loading the calendar…",
    newTab: "Open in a new tab",
  },

  // state 2 — Infrastructure Freedom
  s2: {
    eyebrow: "Infrastructure Freedom",
    heading: "You came here to build.",
    body:
      "Your next feature. Your first customer. The idea you can’t stop thinking about. " +
      "usectl handles the infrastructure, giving you more time to move your product forward.",
    // desktop: the gradient-bordered box, two lines
    boxTop: "0 Hours spent on DevOps configuration.",
    boxBottom: "100% Focus on Product Logic",
    // phone: the same two figures as a pair of stats (design board S02)
    stats: [
      { value: "0 h", label: "spent on DevOps configuration" },
      { value: "100%", label: "focus on product logic" },
    ],
    // the three labels wired to the server's layers (desktop) / the mono bullets (phone)
    callouts: ["Auto-scaling K8s Cluster", "Isolated Micro-VM Kernel", "Encrypted Postgres Storage"],
  },

  // state 3 — Your Stacks
  s3: {
    eyebrow: "Infrastructure Freedom",
    heading: ["Your Stacks,", "in one place."],
    body:
      "Run your apps, databases, storage, and background jobs together. Everything stays " +
      "connected and organized while usectl manages the infrastructure underneath.",
    items: [
      { title: "Application Services", desc: "Automated deployment for APIs, web apps, and microservices." },
      { title: "Application Storage", desc: "High-availability managed databases and S3-compatible object storage." },
      { title: "Background Jobs", desc: "Isolated worker queues, scheduled CRONs, and async processing." },
    ],
  },

  // state 4 — Isolated Spaces (the Machine). The three TITLES are the uppercase mono spec labels
  // and stay English (see the note at the top) — only their descriptions live here.
  s4: {
    eyebrow: "Isolated Spaces",
    heading: ["Give every project", "its own space."],
    body:
      "Keep your app and the services it depends on together, with their own resources and " +
      "access settings. In usectl, we call this project space a Machine.",
    itemDescs: [
      "Zero cross-project interference",
      "CPU, RAM, and Storage isolated per space",
      "Independent secrets and access policies",
    ],
  },

  // state 5 — Pods. Card titles and statuses stay English; these are the third line of each card.
  s5: {
    eyebrow: "Isolated Spaces",
    heading: ["Run each part", "independently."],
    body:
      "Your frontend, API, and workers can each have their own resources and deploy separately " +
      "while staying connected inside the same project. In usectl, each running workload is a Pod.",
    podDescs: [
      "Independent Deploy • 1 vCPU / 2GB",
      "Zero Downtime • 2 vCPU / 4GB",
      "Async Processing • 1 vCPU / 1GB",
    ],
  },

  // state 6 — Continuous Deployment
  s6: {
    eyebrow: "Continuous Deployment",
    heading: ["Push your code.", "We’ll put it live."],
    body:
      "Connect your repository and push your next update. usectl builds it, deploys it, and " +
      "serves it over HTTPS while the rest of your project keeps running.",
  },

  // state 7 — AI Infrastructure
  s7: {
    eyebrow: "AI Infrastructure",
    heading: ["Give your agent", "a place to work."],
    body:
      "Run AI agents alongside the apps, APIs, databases, and tools they use. Your coding " +
      "assistant can also deploy updates and inspect logs through the usectl CLI.",
  },

  // state 8 — Pricing. `unit` / `max` are composed at the render site, because the desktop panel
  // joins them with " - " and the phone card with " · " (design boards).
  s8: {
    eyebrow: "Pricing", // phone only — the desktop state has no eyebrow
    heading: ["Know your hosting bill", "before you launch."],
    body:
      "Choose the CPU, memory, and storage your project needs and see the monthly price before " +
      "you deploy. Need more capacity later? You’ll see the new price before making the change.",
    cta: "Start now from $15 / month",
    ctaNote: "Not a surprise.",
    monthly: "Monthly",
    annual: "Annual",
    rows: [
      { label: "vCPU", unit: "1 vCPU — $10.00/mo", max: "Max 16" },
      { label: "Memory", unit: "1 GB — $5.00/mo", max: "Max 64GB" },
      { label: "Storage", unit: "1 GB — $0.10/mo", max: "Max 1TB" },
    ],
    perMonth: "/mo",
    perYear: "/yr",
    totalMonthly: "Your monthly price",
    totalAnnual: "Your annual price",
    freeNote: "The first month is free. You don’t need to link a card.",
  },

  // state 9 — closing CTA. The line is one sentence in four pieces: lead, the green span, the blue
  // span (desktop breaks the line between them), and the tail.
  s9: {
    kicker: "What will you build next?",
    lead: "Give your next product a place to run.",
    green: "Keep building",
    blue: "what matters",
    tail: " - we’ll handle the infrastructure behind",
  },

  footer: {
    navigation: "Navigation",
    contact: "Contact",
    subscribe: "Subscribe",
    address: "37 Zhiuli Shartava st., Tbilisi 2209 Georgia",
  },

  // the footer's subscribe box (both footers share one component)
  subscribe: {
    placeholder: "email",
    consent: "I agree to the terms and conditions.",
    needConsent: "Please accept the terms and conditions first.",
    already: "You’re already on the list — we’ll be in touch.",
    cooldown: "Just a moment — try again in a minute.",
    rateLimited: "Too many tries — please come back later.",
    invalid: "That address doesn’t look right.",
    failed: "Couldn’t send it. Please try again.",
    thanks: "Thanks — we’ll be in touch.",
  },

  // the cookie consent banner (components/layout/CookieBanner.tsx) and the footers' link that
  // reopens it. Accept and Reject are deliberately the same size and weight.
  cookies: {
    title: "Cookies",
    body:
      "We use cookies to measure how this page is used and how people find us. " +
      "Nothing optional loads until you choose.",
    accept: "Accept",
    reject: "Reject",
    // the footers' withdrawal link, and the banner's aria-label
    settings: "Cookie settings",
    // TODO: there is no privacy policy page yet. When one exists, add its URL to CookieBanner's
    // PRIVACY_URL and this becomes the link's label.
    privacy: "Privacy policy",
  },

  // screen-reader / assistive copy. `{name}` is filled in with the row's label — see fill().
  a11y: {
    home: "usectl home",
    primaryNav: "Primary",
    mobileNav: "Mobile",
    menu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    scrollDown: "Scroll to next section",
    scrollDownLabel: "Scroll Down",
    subscribe: "Subscribe",
    billAnnually: "Bill annually",
    decrease: "Decrease {name}",
    increase: "Increase {name}",
    language: "Language",
  },

  // <head>: search + share copy. Lengths are deliberate — Google cuts titles at ~60 characters
  // and descriptions at ~155, and link-preview cards truncate at roughly the same point.
  seo: {
    title: "UseCTL — Managed Kubernetes & AI Agent Infrastructure",
    description:
      "Deploy apps, databases, workers and AI agents without a DevOps team. UseCTL takes you from code to production on managed Kubernetes, from $15/month.",
    shareDescription:
      "Build your product. We'll handle the infrastructure. Managed Kubernetes and AI agent hosting with predictable pricing.",
    imageAlt:
      "UseCTL — Build your product. We'll handle the infrastructure. Managed Kubernetes & AI Agent Infrastructure.",
    // the two lines the link-preview card adds on top of the hero's own eyebrow + heading
    cardPitch: "Apps, databases, workers and AI agents — from code to production, without a DevOps team.",
    cardPrice: "From $15 / month",
    keywords: [
      "managed Kubernetes",
      "AI agent infrastructure",
      "AI agent hosting",
      "deploy apps",
      "managed databases",
      "background workers",
      "platform as a service",
      "PaaS",
      "DevOps",
      "cloud hosting",
      "UseCTL",
    ],
  },
};

/** The contract every other language has to satisfy. Lives here, not in index.ts, so ka.ts can
 *  import it without a (type-only, but still confusing) import cycle. */
export type Dict = typeof en;
