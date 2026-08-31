"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { APP_NAME, APP_TAGLINE, navLinks } from "@/lib/data";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations();
  const navT = t.raw("nav") as Record<string, string>;

  const isDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  if (isDashboard) return null;

  function getLinkHref(href: string): string {
    if (href.startsWith("#")) {
      return pathname === "/" ? href : "/" + href;
    }
    return href;
  }

  function handleLinkClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const footerLinks = navLinks.filter((l) => l.key !== "dashboard");

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-[var(--border)] bg-[var(--card)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-md"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs select-none">
              T
            </span>
            <span className="font-bold text-[var(--foreground)] text-sm tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <p className="text-xs text-[var(--muted-foreground)] max-w-[220px] text-center sm:text-left leading-relaxed">
            {APP_TAGLINE}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.key}
              href={getLinkHref(link.href)}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
            >
              {navT[link.key] ?? link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs text-[var(--muted-foreground)]">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </motion.footer>
  );
}