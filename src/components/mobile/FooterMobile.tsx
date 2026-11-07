"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { m } from "./HeroMobile";
import {
  footerNavLinks,
  PHONE_HREF,
  PHONE_NUMBER,
  SHOW_PHONE,
  SHOW_STORE_BADGES,
  SOCIAL_LINKS,
  SYSTEMCTL_URL,
} from "@/lib/nav";
import { langPath, type Dict, type Lang } from "@/lib/i18n";
import { SubscribeForm } from "@/components/layout/SubscribeForm";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// PHONE footer (< 768px): the desktop Footer is an absolutely-positioned 1920 canvas that can't
// reflow, so phones get this flow-layout version with the same content, stacked. Same staggered
// fade-up on enter as the desktop one.

export function FooterMobile({ t, lang }: { t: Dict; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const navLinks = footerNavLinks(t);

  useGSAP(
    () => {
      if (!window.matchMedia("(max-width: 1023px)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-mf-reveal]", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    },
    { scope: ref },
  );

  // the design board's (S10-Footer) type: 16/500 white headings, 14/300 white-60 links
  const h3 = "font-heading font-medium text-white";
  const link = "font-heading font-light text-white/60";

  return (
    <footer
      ref={ref}
      // #contact: the footer's hash in SECTION_HASHES (lib/nav.ts) — the anchor a /#contact link lands on
      id="contact"
      data-footer-stacked
      className="relative overflow-hidden lg:hidden"
      style={{
        ["--m" as string]: "min(calc(100vw / 390), 1.3px)",
        background: "#1b1a1a",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: `${m(48)} max(${m(20)}, calc((100% - ${m(560)}) / 2)) ${m(28)}`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          right: m(-140),
          bottom: m(40),
          width: m(360),
          height: m(320),
          background: "radial-gradient(ellipse at center, rgba(90,255,200,0.12) 0%, rgba(90,255,200,0.05) 50%, rgba(90,255,200,0) 75%)",
          filter: "blur(24px)",
        }}
      />

      <div data-mf-reveal className="relative">
        <Link href={langPath(lang)} aria-label={t.a11y.home} className="inline-block">
          <Image src="/logo/logo.svg" alt="usectl" width={151} height={25} style={{ width: m(130), height: "auto" }} />
        </Link>
        <p className="font-heading font-light text-white/50" style={{ marginTop: m(14), fontSize: m(13), lineHeight: 1.5 }}>
          {t.footer.address}
        </p>
        {/* store badges — hidden until the apps ship (see SHOW_STORE_BADGES) */}
        {SHOW_STORE_BADGES && (
        <div className="flex flex-wrap items-center" style={{ marginTop: m(22), gap: m(12) }}>
          <a
            href="#"
            aria-label="Download on the App Store"
            className="flex items-center rounded-lg border border-white/25 bg-black"
            style={{ height: m(42), paddingLeft: m(12), paddingRight: m(14), gap: m(8) }}
          >
            <svg viewBox="0 0 384 512" fill="#fff" style={{ width: m(17), height: m(21) }} aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <span className="text-left leading-none">
              <span className="block text-white/80" style={{ fontSize: m(8.5) }}>
                Download on the
              </span>
              <span className="block font-medium text-white" style={{ marginTop: m(3), fontSize: m(15) }}>
                App Store
              </span>
            </span>
          </a>
          <a
            href="#"
            aria-label="Get it on Google Play"
            className="flex items-center rounded-lg border border-white/25 bg-black"
            style={{ height: m(42), paddingLeft: m(12), paddingRight: m(14), gap: m(8) }}
          >
            <svg viewBox="0 0 24 26" fill="none" style={{ width: m(17), height: m(19) }} aria-hidden="true">
              <defs>
                <linearGradient id="play-badge-grad-m" x1="0" y1="0" x2="22" y2="26" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#00d7fe" />
                  <stop offset="0.35" stopColor="#00f076" />
                  <stop offset="0.7" stopColor="#ffce00" />
                  <stop offset="1" stopColor="#f63448" />
                </linearGradient>
              </defs>
              <path d="M1 1.5 L22.5 13 L1 24.5 Z" fill="url(#play-badge-grad-m)" />
            </svg>
            <span className="text-left leading-none">
              <span className="block uppercase text-white/80" style={{ fontSize: m(8.5), letterSpacing: "0.04em" }}>
                Get it on
              </span>
              <span className="block font-medium text-white" style={{ marginTop: m(3), fontSize: m(15) }}>
                Google Play
              </span>
            </span>
          </a>
        </div>
        )}
      </div>

      <div className="relative grid grid-cols-2" style={{ marginTop: m(40), columnGap: m(20), rowGap: m(36) }}>
        <div data-mf-reveal>
          <h3 className={h3} style={{ fontSize: m(16) }}>
            {t.footer.navigation}
          </h3>
          <ul style={{ marginTop: m(16) }}>
            {navLinks.map((l) => (
              <li key={l.href} style={{ marginBottom: m(12) }}>
                <Link
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={link}
                  style={{ fontSize: m(14) }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div data-mf-reveal>
          <h3 className={h3} style={{ fontSize: m(16) }}>
            {t.footer.contact}
          </h3>
          <p style={{ marginTop: m(16) }}>
            <a href="mailto:hello@usectl.com" className={link} style={{ fontSize: m(14) }}>
              hello@usectl.com
            </a>
          </p>
          {SHOW_PHONE && (
            <p style={{ marginTop: m(10) }}>
              <a href={PHONE_HREF} className={link} style={{ fontSize: m(14) }}>
                {PHONE_NUMBER}
              </a>
            </p>
          )}
          <div className="flex items-center" style={{ marginTop: m(14), gap: m(14) }}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="inline-flex opacity-60 active:opacity-100"
              >
                <Image
                  src={social.icon}
                  alt=""
                  width={24}
                  height={24}
                  style={{ width: m(social.size), height: m(social.size) }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div data-mf-reveal className="relative" style={{ marginTop: m(36) }}>
        <h3 className={h3} style={{ fontSize: m(16) }}>
          {t.footer.subscribe}
        </h3>
        {/* same component the desktop footer uses, on the phone's --m scale */}
        <SubscribeForm variant="mobile" t={t.subscribe} sendLabel={t.a11y.subscribe} />
      </div>

      <Image
        src="/logo/logo.svg"
        alt=""
        width={151}
        height={25}
        aria-hidden="true"
        className="pointer-events-none relative block select-none"
        style={{ marginTop: m(40), width: "100%", height: "auto", opacity: 0.05, filter: "grayscale(1) brightness(2.5)" }}
      />

      <div
        data-mf-reveal
        className="relative flex items-center justify-between font-heading text-white/40"
        style={{ marginTop: m(24), fontSize: m(12) }}
      >
        <span>
          &copy; 2026{" "}
          <a
            href={SYSTEMCTL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand transition-opacity hover:opacity-70"
          >
            SYSTEMCTL
          </a>
        </span>
        <span>usectl.com</span>
      </div>
    </footer>
  );
}
