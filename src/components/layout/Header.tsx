import Image from "next/image";
import Link from "next/link";
import { ColumnLines } from "@/components/layout/BackgroundLines";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavItemLink } from "@/components/layout/NavItemLink";
import { ButtonArrow } from "@/components/ui/icons";
import { INSET_VW, HEADER_HIDE_WIDE, HEADER_HIDE_NARROW, LINE_COLOR, LINE_W, LINE_HALF } from "@/lib/grid";
import { ctaAttr, navLinks, SIGNUP_URL } from "@/lib/nav";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import { Noise } from "@/components/ui/Noise";
import type { Dict, Lang } from "@/lib/i18n";
import { langPath } from "@/lib/i18n";

export function Header({ t, lang }: { t: Dict; lang: Lang }) {
  const links = navLinks(t, lang);
  return (
    // The header is painted with THE PAGE'S OWN LAYERS (2026-11-17): #1e1d1d, the same grain tile at
    // the same size and place (both start at the viewport's top-left), then the #00000040 sheet — so
    // it is the body's colour AND texture, pixel for pixel. Every cheaper attempt left a band:
    // a page-coloured fill can't carry the grain (bg-background/60, bg-page/60 read lighter), and a
    // see-through blur smears the grain flat (bg-black/5 + backdrop-blur read as a smooth, darker
    // strip on a retina screen). Opaque now: content scrolling under it is hidden, not blurred.
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-transparent bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* the page's grain — the SAME Noise tile BackgroundLines draws, so both rasterise alike on
            any screen (the old 1920×13528 sheet did not on retina) */}
        <Noise />
      </div>
      {/* Rendered here (a child of <header>, above its page layers) rather than in
          BackgroundLines.tsx's fixed background — at this grid's real opacity, sitting behind the
          header's (former) blur washed the lines out to fully invisible. See
          BackgroundLines.tsx's own note at the removed call site. */}
      <ColumnLines
        hideWide={HEADER_HIDE_WIDE}
        hideNarrow={HEADER_HIDE_NARROW}
        className="header-cols pointer-events-none absolute top-0 h-16 max-lg:hidden lg:h-24"
        // the outer columns belong to EdgeLines (BackgroundLines.tsx) — clipped here, drawn there once
        style={{ left: INSET_VW, right: INSET_VW, clipPath: "inset(0 20px 0 20px)" /* well clear of the outer lines, well short of the next */ }}
      />
      {/* < 1024: the phone/tablet grid (globals.css --grid-*), masked clear of the logo and the
          burger so no line runs through either */}
      <div
        aria-hidden="true"
        className="header-cols-m pointer-events-none absolute inset-y-0 lg:hidden"
        style={{
          left: "var(--grid-inset)",
          right: "calc(var(--grid-inset) - var(--grid-edge))",
          backgroundImage: `repeating-linear-gradient(to right, ${LINE_COLOR} 0, ${LINE_COLOR} ${LINE_W}, transparent ${LINE_W}, transparent var(--grid-pitch))`,
          backgroundPositionX: `calc(-1 * ${LINE_HALF})`,
          clipPath: "inset(0 calc(var(--grid-edge, 0px) + 10px) 0 10px)", // outer columns: EdgeLines'
        }}
      />
      {/* The seam under the header is drawn as ONE MORE GRID LINE (width/colour of the page grid,
          × 0.75 for the #00000040 sheet the page's lines sit under) — it was white 10 %, twice a
          grid line, and that bright seam is what made the header read as a separate band. The
          1px transparent border keeps the header's height (97) exactly as the scene measures it;
          the line sits in that border's place. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{ bottom: "-1px", height: "var(--grid-line-w)", background: "var(--grid-line-color)", opacity: 0.75 }}
      />
      {/* the #00000040 sheet LAST among the background layers — over the grain AND the header's
          lines, exactly as BackgroundLines lays it over the page's (variant A), so the header's
          lines are dimmed like the page's; the row below is positioned and later, so it stays
          above the sheet */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "var(--bg-tint)" }} />
      {/* The row's ≥1024 geometry (width, centring, the 130/99 design paddings) lives in
          globals.css's `.header-row`, because it is written in --sh — the scale the pinned scene is
          really drawn at — so the logo keeps sitting on the content's column on any display. Below
          1024 the `px-(--grid-inset)!` utility still rules. */}
      <div className="header-row relative flex h-16 w-full items-center max-lg:px-(--grid-inset)! lg:h-24">
        <Link href={langPath(lang)} aria-label={t.a11y.home} className="shrink-0">
          {/* ≥1024 the width comes from .header-logo (max(150px, sh×150)) */}
          <Image src="/logo/logo.svg" alt="usectl" width={150} height={24} priority className="header-logo h-auto w-[120px]" />
        </Link>

        <nav
          aria-label={t.a11y.primaryNav}
          className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
        >
          <ul className="header-nav flex items-center gap-8 whitespace-nowrap font-heading text-base text-white/80 max-[1279.98px]:gap-6 max-[1279.98px]:text-[15px]">
            {links.map((link) => (
              <li key={link.href}>
                {/* hover: the label warms to the brand green — colour only, no underline rule */}
                {/* NavItemLink: green while you are on the page it points at (/pricing) */}
                <NavItemLink
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="inline-block py-1 transition-colors duration-300 ease-out hover:text-brand"
                >
                  {link.label}
                </NavItemLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* "Start Now" — the header's own CTA, opposite the logo (Figma: left 1606 / top 27 on the
            1920 frame, 132 wide, r40, Space Grotesk Medium 14; height = the scene's pills since 2026-11-06, see `.header-cta`). Its right edge lands on grid column
            21 (1739 = 1920 − 99 − 82), which is why the offset is one column inside the content
            inset; the geometry lives in globals.css's `.header-cta` because it is written in --sh,
            the scale the scene is really drawn at, exactly like the logo and the nav.
            Unlike the logo and the nav, the band's grid lines are NOT masked away behind it — the
            user wants them running through (2026-11-05: "მაგის უკან უნდა იყოს ხაზები").
            Phones don't get it here — the phone header is logo + burger, and Start Now lives in
            the burger menu instead. */}
        {/* EN / KA + Start Now share one right-aligned group, so the pill keeps its own
            `margin-right: sh(82)` (= one grid column) and its right edge still lands on column 21 */}
        <div className="ml-auto hidden items-center lg:flex">
          <LangSwitcher lang={lang} label={t.a11y.language} className="header-lang" />
          <Link
            href={SIGNUP_URL}
            {...ctaAttr("header")}
            className="header-cta hidden shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-white/25 font-heading font-medium text-foreground transition-colors duration-300 ease-out hover:border-brand hover:text-brand lg:flex"
          >
            {t.header.startNow} <ButtonArrow size="1.15em" />
          </Link>
        </div>
        <MobileMenu links={links} t={t} lang={lang} />
      </div>
    </header>
  );
}
