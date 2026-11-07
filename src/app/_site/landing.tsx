import { HeroSection } from "@/components/sections/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { FooterMobile } from "@/components/mobile/FooterMobile";
import { BookDemoModal } from "@/components/ui/BookDemoModal";
import { getDict, type Lang } from "@/lib/i18n";

// The page body, shared by both languages' page.tsx (app/(en)/page.tsx → `/`,
// app/(ka)/ka/page.tsx → `/ka`). Everything visible comes from the language's dictionary.
export function Landing({ lang }: { lang: Lang }) {
  const t = getDict(lang);

  return (
    <main className="flex flex-1 flex-col">
      <HeroSection lang={lang} />
      {/* The footer also supplies the trailing scroll room the hero's pin end needs (the
          "last section" trap documented in PROJECT.md — the temporary spacer lived here). */}
      <div data-footer-pinned className="max-lg:hidden">
        <Footer t={t} lang={lang} />
      </div>
      <FooterMobile t={t} lang={lang} />
      {/* The hero's "Book a demo" popup, mounted ONCE here: the button exists in both builds
          (pinned desktop + stacked phone/reduce-motion, one of them display:none) and they ask
          for it through a window event — see lib/bookDemo.ts. */}
      <BookDemoModal t={t} />
    </main>
  );
}
