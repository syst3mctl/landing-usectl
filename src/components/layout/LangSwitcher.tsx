"use client";

import { LANGS, LANG_COOKIE, LANG_LABEL, langPath, type Lang } from "@/lib/i18n";

// EN / KA. Lives in the header on ≥1024 and in the burger menu below that.
//
// A FULL page load on purpose (no next/link client navigation): `/` and `/ka` are two separately
// prerendered pages, and arriving fresh is what runs layout.tsx's pre-paint restore script — so
// switching language on, say, Pricing hides the stage, lands on Pricing in the new language and
// fades in, exactly like a reload does. The current hash is carried over because SECTION_HASHES is
// identical in both languages; without JS the plain href still goes to the language's home.

export function LangSwitcher({
  lang,
  label,
  className,
  size = "header",
  onNavigate,
}: {
  lang: Lang;
  label: string;
  className?: string;
  /** "header" = the compact row next to Start Now, "menu" = the bigger row in the burger menu */
  size?: "header" | "menu";
  onNavigate?: () => void;
}) {
  const menu = size === "menu";
  return (
    <div
      className={`flex items-center font-heading ${menu ? "gap-2 text-[14px]" : "gap-1.5"} ${className ?? ""}`}
      role="group"
      aria-label={label}
    >
      {LANGS.map((l, i) => {
        const current = l === lang;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className={`select-none text-white/20 ${menu ? "mr-2" : "mr-1.5"}`}>
                /
              </span>
            )}
            {current ? (
              <span aria-current="true" className="font-medium text-white/90">
                {LANG_LABEL[l]}
              </span>
            ) : (
              <a
                href={langPath(l)}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.();
                  // remembered for a year, so the country redirect in src/proxy.ts never overrides it
                  document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax; secure`;
                  window.location.assign(langPath(l) + window.location.hash);
                }}
                className="text-white/45 transition-colors duration-300 ease-out hover:text-brand"
              >
                {LANG_LABEL[l]}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
}
