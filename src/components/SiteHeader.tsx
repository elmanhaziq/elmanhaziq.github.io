"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import styles from "./SiteHeader.module.css";

const NAV = [
  { href: "/#work", label: "Work" },
  { href: "/#systems", label: "Systems" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header} data-scrolled={scrolled || open}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.mark} onClick={() => setOpen(false)}>
          <span className={styles.name}>{SITE.name}</span>
          <span className={`label ${styles.role}`}>{SITE.positioning}</span>
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          <ul className={styles.list} id="primary-nav" data-open={open}>
            {NAV.map((item, i) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link} onClick={() => setOpen(false)}>
                  <span className={styles.num} aria-hidden="true">
                    0{i + 1}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className={styles.bars} aria-hidden="true" data-open={open} />
          </button>
        </nav>
      </div>
    </header>
  );
}
