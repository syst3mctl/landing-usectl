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

  // Pricing — the /pricing page (app/_site/pricing.tsx; it was state 8 of the scene until
  // 2026-11-10). `unit` / `max` are composed at the render site, because the desktop panel
  // joins them with " - " and the phone card with " · " (design boards).
  s8: {
    eyebrow: "Pricing",
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
    machinePrice: "Your Machine Price", // the calculator receipt's badge (board 2026-11-17)
    freeNote: "The first month is free. You don’t need to link a card.",
  },

  // the /pricing page (app/_site/pricing.tsx, components/pricing/PricingPageClient.tsx; the
  // team's design of 2026-11-10). The calculator drawer behind the "Pricing Calculation" tab reuses
  // s8 above.
  pricingPage: {
    title: "Pricing",
    description:
      "One flat monthly price for the CPU, memory and storage you choose. No traffic fees, no per-seat charges. 30 days free, no credit card.",
    eyebrow: "Pricing",
    // one gradient runs across the whole line; the two parts wrap separately on a phone
    heading: ["Pick your resources.", "That’s your price."],
    body: "One flat monthly price for the CPU, memory and storage you choose. No usage meter, no traffic fees, no per-seat charges.",
    startFree: "Start Free",
    popular: "Most Popular",
    perMonth: "/month",
    perYear: "/year",
    machine: {
      name: "Machine",
      tagline: "Everything you need to run a product in production.",
      detail: "1 vCPU and 1 GB RAM. Add more as you grow: $10 per vCPU, $5 per GB RAM, $0.10 per GB storage",
      features: ["Resources", "Deploy", "Databases and services", "Network", "Observability", "Team and access"],
      cta: "Start 30 day free trial",
    },
    enterprise: {
      name: "Enterprise",
      tagline: "For companies running serious production workloads.",
      price: "Custom",
      lead: "Everything in Machine, plus:",
      features: [
        "Resources beyond the self-serve limits",
        "Dedicated nodes for your workloads",
        "Hands-on migration from your current provider",
        "Priority support with a named contact",
        "An uptime commitment (SLA)",
        "Annual contracts and invoice billing",
        "Architecture and security review with our engineers",
      ],
      cta: "Talk to sales",
    },
    trialNote: "30 days free. Any Machine up to 2 vCPU and 4 GB RAM. No credit card.",
    calcTab: "Pricing Calculation",
    calcClose: "Close the pricing calculator",
    invoice: {
      heading: "The price on this page is the price on your invoice.",
      items: [
        "No traffic fees. A viral launch doesn’t come with a bigger bill. Traffic and bandwidth are not metered.",
        "No per-seat fees. Invite your whole team to a Machine. People are free.",
        "No usage meter. Autoscaling grows into the headroom you already pay for. You only pay more when you choose more resources.",
      ],
    },
    // Only the first answer is the design's own text. Answers 2-10 are DRAFTS written from what
    // the rest of the page promises — the team has to confirm them (trial end, failed payments,
    // cancelling and yearly billing especially) before this ships.
    faq: {
      heading: "Frequently Asked Questions",
      items: [
        {
          q: "Is there a free plan?",
          a: "There’s a 30-day free trial on any Machine up to 2 vCPU and 4 GB RAM, with no credit card. There’s no permanent free plan.",
        },
        {
          q: "What happens when the trial ends?",
          a: "We remind you before the 30 days are up. To keep your Machine running, add a payment method; billing starts that day at the price shown on this page.",
        },
        {
          q: "What if my traffic spikes?",
          a: "Your bill doesn’t change. Traffic and bandwidth are not metered, and autoscaling grows into the headroom your Machine already has.",
        },
        {
          q: "Can I change resources later?",
          a: "Yes. Add or remove vCPU, memory and storage whenever you need to. You see the new monthly price before you confirm the change.",
        },
        {
          q: "Do teammates cost extra?",
          a: "No. There are no per-seat fees: invite your whole team to a Machine at no extra cost.",
        },
        {
          q: "Are databases included?",
          a: "Yes. Databases and services run on your Machine’s resources, so they are covered by the same flat monthly price.",
        },
        {
          q: "What happens if a payment fails?",
          a: "We email you and retry the payment, so you have time to update your card. Your Machine keeps running while it’s sorted out.",
        },
        {
          q: "Can I cancel at any time?",
          a: "Yes. There is no long-term contract on the Machine plan. Cancel from your dashboard and you won’t be charged for the next period.",
        },
        {
          q: "How does yearly billing work?",
          a: "Choose Annual and you pay for twelve months up front. Enterprise plans can also be billed annually by invoice.",
        },
        {
          q: "What currency do you charge in?",
          a: "All prices are in US dollars (USD).",
        },
      ],
    },
    final: {
      heading: "Start free. Pay when it’s live",
      body: "30 days free on any Machine up to 2 vCPU and 4 GB RAM. No credit card.",
      start: "Start Free",
      sales: "Talk to sales",
    },
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

  // "The Substrate" — the band between the closing CTA and the footer on the landing page
  // (components/sections/SubstrateSection.tsx). Two columns of technology icons on each side,
  // staggered; the icons and the section's background image are PLACEHOLDERS until the team's
  // assets land in design/.
  substrate: {
    eyebrow: "The Substrate",
    heading: "You build it. We help you run it.",
    body: "From choosing resources to deploying your app, usectl makes infrastructure simpler.",
    cta: "Deploy your app for free",
  },

  // the /features page (app/_site/features.tsx, components/features/FeaturesPageClient.tsx).
  // DRAFT copy: the user is sending the real block texts from their screenshots — the seven
  // `blocks` below (title / body / three cards) are placeholders in the right shape, so swapping
  // them is a text-only change. `tab` is the sticky bar's short label for the same block.
  // the /features page (app/_site/features.tsx, components/features/FeaturesPageClient.tsx).
  // Copy is VERBATIM from the team's boards in design/features/ (2026-11-16). `label` is the small
  // green line above a card's title and is OPTIONAL — the design's first card has none.
  featuresPage: {
    title: "Features",
    description:
      "Powerful infrastructure controls for modern developers: Git deploys, global routing, autoscaling, telemetry, security, configuration, logs and an interactive terminal.",
    eyebrow: "Complete Control",
    heading: "Everything you need to build, ship, and scale.",
    body:
      "Powerful infrastructure controls designed for modern developers. Manage your deployments, networking, and scaling effortlessly from a clean dashboard or CLI.",
    startFree: "Start Free",
    talkToSales: "Talk to sales",
    final: {
      eyebrow: "Secure sandboxes & autonomous OPS",
      heading: "Put your agents to work on usectl",
      body: "Host open-source AI agents in gVisor sandboxes and let native copilots manage your infrastructure.",
      start: "Start Free",
      docs: "Read Docs",
    },
    scrollUp: "Scroll UP",
    blocks: [
      {
        tab: "Deploy",
        title: "Instant Deploys via Git Push & Webhooks",
        body:
          "Connect your repository once and let usectl handle the rest. Every git push automatically builds and deploys your code in seconds, while open Pull Requests instantly generate temporary staging preview environments.",
        cards: [
          { label: "", title: "GitHub & Webhooks", body: "Connect any repository and trigger instant builds on every push." },
          { label: "usectl.app", title: "PR Preview Environments", body: "Automatically spin up temporary staging URLs for every pull request" },
          { label: "~0.8s build time", title: "Lightning Fast Builds", body: "Optimized container builds that ship your code to production in seconds." },
        ],
      },
      {
        tab: "Network & Routing",
        title: "Global Routing & Custom Domains",
        body:
          "Route incoming traffic seamlessly with built-in load balancing, automatic TLS certificates, and zero-configuration domains that point straight to your services.",
        cards: [
          { label: "Free usectl domain", title: "Public Networking", body: "Expose your application to the public internet instantly with automated routing and SSL provisioning." },
          { label: "Encrypted", title: "Private Networking", body: "Connect colocated services securely across your project with high-speed internal DNS resolution." },
          { label: "Configurable port", title: "TCP & UDP Proxy", body: "Send traffic to any service or custom protocol that doesn\u2019t support HTTP with full flexibility." },
        ],
      },
      {
        tab: "Scale",
        title: "Horizontal & Vertical Scaling",
        body:
          "Scale your application effortlessly. Adjust pod replicas instantly for high availability or resize machine resources granularly to handle peak workloads.",
        cards: [
          { label: "Replica count", title: "Horizontal Pod Replicas", body: "Scale your instance count up or down instantly with simple CLI updates (usectl machines pods set)." },
          { label: "vCPU & RAM tuning", title: "Granular Machine Resizing", body: "Tune CPU and memory allocations precisely to match your workload performance requirements." },
          { label: "Auto-distribution", title: "High Availability & Failover", body: "Distribute replicas across nodes automatically to ensure zero downtime during traffic spikes." },
        ],
      },
      {
        tab: "Monitoring & Metrics",
        title: "Real-Time Telemetry & AI Incident Response",
        body:
          "Comprehensive observability powered by Mimir, Loki, and Tempo. Monitor resource health, track traffic metrics, and let AI automatically resolve incidents before they impact users.",
        cards: [
          { label: "Zero Prometheus", title: "Metrics & Tracing Stack", body: "High-performance telemetry powered by Grafana Alloy, Mimir, Loki, and Tempo for complete visibility." },
          { label: "Auto-rollback", title: "Deploy-Safety Watcher", body: "Automatic rollbacks triggered instantly if error rates (HTTP 5xx) exceed safety thresholds during updates." },
          { label: "Qwen3-14B AI", title: "AI Incident Agent", body: "Autonomous diagnostics and 1-tap remediation powered by advanced LLMs analyzing logs and traces in real time." },
        ],
      },
      {
        tab: "Security",
        title: "Defense-in-Depth Security & Sandboxed Isolation",
        body:
          "Enterprise-grade security architecture featuring kernel-level gVisor isolation, strict network namespace policies, encrypted Vault storage, and secure AI guardrails.",
        cards: [
          { label: "System call isolation", title: "gVisor Container Sandbox", body: "Isolate untrusted workloads and AI agents completely using kernel-level system call interception (runsc)." },
          { label: "AES-256-GCM", title: "Vault Envelope Encryption", body: "Store sensitive secrets safely with AES-256-GCM encryption, hash-chained audit logs, and write-only protected variables." },
          { label: "Zero Direct Write", title: "AI Copilot Guardrails", body: "Maintain strict human oversight with \u201cModel Proposes, Human Approves\u201d workflows and scoped agent API keys." },
        ],
      },
      {
        tab: "Variables & Configuration",
        title: "Scoped Variables & Secure Configurations",
        body:
          "Manage environment variables and secrets with granular pod-level scoping, write-only protection, and zero-leakage encryption across your deployments.",
        cards: [
          { label: "Pod-level scoping", title: "Pod-Scoped Variables", body: "Bind environment configurations specifically to target pods rather than the entire machine for precise control." },
          { label: "Zero leakage", title: "Write-Only Secrets", body: "Secure sensitive tokens and keys with masked interfaces and write-only retrieval to prevent accidental exposure." },
          { label: "AES-256 protected", title: "Encrypted Storage", body: "Ensure all configuration data remains safe at rest with advanced encryption and audit-ready tracking." },
        ],
      },
      {
        tab: "Logs & Terminal",
        title: "Real-Time Logs & Interactive Terminal",
        body:
          "Diagnose issues instantly with centralized log streaming powered by Loki, or jump directly into secure interactive container terminals for advanced debugging.",
        cards: [
          { label: "Loki-powered", title: "Centralized Log Streaming", body: "Aggregate and tail container logs in real time across your entire cluster using high-performance Loki storage." },
          { label: "Secure exec", title: "Interactive Terminal Access", body: "Execute diagnostic commands safely inside target containers directly from your CLI or web dashboard." },
          { label: "Node-level agents", title: "Alloy Log Collection", body: "Benefit from efficient, node-level log harvesting managed seamlessly by Grafana Alloy agents." },
        ],
      },
    ],
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
    // the checkbox label; the middle part links to the Terms of Use (opens in a new tab, so a
    // typed address is not lost)
    consentBefore: "I agree to the ",
    consentLink: "terms and conditions",
    consentAfter: ".",
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
    // the banner's link to /privacy
    privacy: "Privacy policy",
  },

  // the /privacy and /terms pages (app/_site/legal.tsx) and the footers' links to them. The texts
  // themselves are in content/legal/*.md.
  legal: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    privacyDescription:
      "How UseCTL collects, uses and protects personal data, and which cookies usectl.com uses.",
    termsDescription:
      "The terms for using UseCTL: accounts, the free trial, billing, acceptable use and liability.",
    backHome: "Back to UseCTL",
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

  // the /agents page (app/_site/agents.tsx, components/agents/AgentsPageClient.tsx). Copy is
  // VERBATIM from the Figma board "Agents" (833:2833), 2026-11-16. `prompt` is copied to the
  // clipboard exactly as written (user, 2026-11-16).
  agentsPage: {
    title: "Agents",
    description:
      "Run open-source AI agents in isolated gVisor sandboxes with persistent storage, while autonomous native copilots triage failures and manage incidents safely.",
    eyebrow: "Usectl for agents",
    heading: "Connect your agent to usectl",
    body:
      "Run open-source AI agents in isolated gVisor sandboxes with persistent storage, while autonomous native copilots triage failures and manage incidents safely.",
    prompt: "https://manager.usectl.com/api/mcp", // the MCP endpoint, copied as is (user, 2026-11-17)
    copy: "Copy",
    copied: "Copied",
    logosLabel: "Works with Claude, ChatGPT, Cursor, OpenCode, Grok, Gemini and Devin",
    choose: {
      heading: "Choose your agent",
      setup: "Setup guide",
      cards: [
        { title: "Hermes Agent", body: "Persistent memory & isolated networks" },
        { title: "OpenClaw", body: "Secure zero-exposure deployment" },
        { title: "Task Agent", body: "Background workers & webhooks" },
      ],
    },
    copilots: {
      heading: "Built-in infrastructure copilots",
      cards: [
        { title: "Devo Admin Copilot", body: "Propose-and-Approve workflows with zero direct writes. Approve via CLI, Web, or Face ID." },
        { title: "Failed-Deploy Triage", body: "Auto-analyzes build logs on failure at zero user cost, commenting fixes on PRs." },
        { title: "Incident Remediation", body: "Monitors Grafana alerts across notify, approve, or auto modes with 1-tap approvals." },
        { title: "Ops & Weekly Digests", body: "Nightly cluster reports at 05:00 UTC and Monday machine summaries." },
      ],
    },
    untrusted: {
      heading: "Built for untrusted execution",
      cards: [
        { title: "Hermes Agent", body: "gVisor Kernel Sandbox (runsc)" },
        { title: "Scoped API Keys (usectl agt)", body: "Least-privilege tokens bound to project IDs and expiration." },
      ],
    },
    templates: {
      heading: "Explore templates",
      deploy: "Deploy template",
      items: ["Hermes on usectl", "OpenClaw Sandboxed", "CI/CD Triage Bot"],
    },
    final: {
      eyebrow: "Secure AI & Autonomous OPS",
      heading: "Put your agents to work on usectl",
      body: "Host open-source AI agents in gVisor sandboxes and let native copilots manage your infrastructure.",
      deploy: "Deploy Agent",
    },
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
