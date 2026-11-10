import Image from "next/image";
import Link from "next/link";
import { ColumnLines } from "@/components/layout/BackgroundLines";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavItemLink } from "@/components/layout/NavItemLink";
import { ButtonArrow } from "@/components/ui/icons";
import { INSET_VW, HEADER_HIDE_WIDE, HEADER_HIDE_NARROW, LINE_COLOR, LINE_THICKNESS_PX } from "@/lib/grid";
import { ctaAttr, navLinks, SIGNUP_URL } from "@/lib/nav";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import type { Dict, Lang } from "@/lib/i18n";
import { langPath } from "@/lib/i18n";

export function Header({ t, lang }: { t: Dict; lang: Lang }) {
  const links = navLinks(t, lang);
  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-white/10 bg-background/60 backdrop-blur-md">
      {/* Rendered here (a child of <header>, above its own bg-background/60 + backdrop-blur-md
          layer) rather than in BackgroundLines.tsx's fixed background — at this grid's real
          opacity, sitting behind the header's blur washes the lines out to fully invisible. See
          BackgroundLines.tsx's own note at the removed call site. */}
      <ColumnLines
        hideWide={HEADER_HIDE_WIDE}
        hideNarrow={HEADER_HIDE_NARROW}
        className="header-cols pointer-events-none absolute top-0 h-16 max-lg:hidden lg:h-24"
        style={{ left: INSET_VW, right: INSET_VW }}
      />
      {/* < 1024: the phone/tablet grid (globals.css --grid-*), masked clear of the logo and the
          burger so no line runs through either */}
      <div
        aria-hidden="true"
        className="header-cols-m pointer-events-none absolute inset-y-0 lg:hidden"
        style={{
          left: "var(--grid-inset)",
          right: "calc(var(--grid-inset) - var(--grid-edge))",
          backgroundImage: `repeating-linear-gradient(to right, ${LINE_COLOR} 0, ${LINE_COLOR} ${LINE_THICKNESS_PX}px, transparent ${LINE_THICKNESS_PX}px, transparent var(--grid-pitch))`,
          backgroundPositionX: `-${LINE_THICKNESS_PX / 2}px`,
        }}
      />
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
