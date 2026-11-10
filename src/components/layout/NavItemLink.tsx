"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

// A nav link that turns brand green while you are ON the page it points at (user, 2026-11-10:
// "როცა გვერდზე ვარ გადასული ის გვერდი გამწვანებული უნდა იყოს"). Only path links can be "the page
// you are on" — the hash links into the scene (#the-machine, #agents…) and the external
// Documentation link never match, so they keep their normal colour.
export const isCurrentPath = (pathname: string | null, href: string) =>
  !!pathname && href.startsWith("/") && pathname.replace(/\/$/, "") === href.replace(/\/$/, "");

export function NavItemLink({
  href,
  className = "",
  activeClassName = "text-brand",
  ...rest
}: ComponentProps<typeof Link> & { href: string; activeClassName?: string }) {
  const current = isCurrentPath(usePathname(), href);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`${className} ${current ? activeClassName : ""}`}
      {...rest}
    />
  );
}
