"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink, cx } from "./ui/Primitives";
import {
  IconArrowRight,
  IconChevronRight,
  IconClose,
  IconMenu
} from "./ui/Icons";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/explore", label: "Explorer" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" }
] as const;

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const onExplorer =
    pathname === "/explore" || pathname.startsWith("/explore/");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const closeMenu = () => setMenuOpen(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        menuButtonRef.current?.focus();
      }
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        headerRef.current &&
        event.target instanceof Node &&
        !headerRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktopQuery.addEventListener("change", onDesktop);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktopQuery.removeEventListener("change", onDesktop);
    };
  }, [menuOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="shell site-header-inner">
        <Link className="site-brand" href="/" aria-label="TerraCascade home">
          <span className="site-brand-mark" aria-hidden="true">
            TC
          </span>
          <span className="site-brand-text">
            <span className="site-brand-name">TerraCascade</span>
            <span className="site-brand-descriptor">
              Radar data explorer
            </span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              className="site-nav-link"
              href={item.href}
              key={item.href}
              aria-current={
                isCurrentRoute(pathname, item.href) ? "page" : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          {!onExplorer ? (
            <ButtonLink
              className="site-explorer-action"
              href="/explore"
              size="sm"
              variant="primary"
              trailingIcon={<IconArrowRight size={14} />}
            >
              Open Explorer
            </ButtonLink>
          ) : null}
          <button
            className={cx("site-menu-button", menuOpen && "is-open")}
            ref={menuButtonRef}
            type="button"
            aria-controls="site-mobile-menu"
            aria-expanded={menuOpen}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconClose size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      <div
        className="site-mobile-menu"
        id="site-mobile-menu"
        hidden={!menuOpen}
      >
        <div className="shell site-mobile-menu-inner">
          <nav aria-label="Mobile navigation" className="site-mobile-nav">
            {navigation.map((item) => (
              <Link
                className="site-mobile-link"
                href={item.href}
                key={item.href}
                aria-current={
                  isCurrentRoute(pathname, item.href) ? "page" : undefined
                }
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
                <IconChevronRight
                  className="site-mobile-link-icon"
                  size={16}
                />
              </Link>
            ))}
          </nav>
          {!onExplorer ? (
            <ButtonLink
              className="site-mobile-action"
              fullWidth
              href="/explore"
              size="md"
              variant="primary"
              trailingIcon={<IconArrowRight size={15} />}
              onClick={() => setMenuOpen(false)}
            >
              Open Explorer
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </header>
  );
}
