"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function AppBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/instagram", label: "Instagram" },
    { href: "/apollo", label: "Apollo" },
    { href: "/Eleuthia", label: "Eleuthia" },
    { href: "/timeline", label: "Timeline" },
    { href: "/health", label: "Health" },
    { href: "/wealth", label: "Wealth" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
  ];

  const isIntro = pathname === "/";
  const headerClass = isIntro
    ? "fixed inset-x-0 top-0 z-50 h-14 md:h-16 bg-transparent border-none shadow-none [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)]"
    : "gaia-glass-strong gaia-border fixed inset-x-0 top-0 z-50 h-14 border-b border backdrop-blur md:h-16 [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)]";

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-full max-w-screen-xl items-center gap-3 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          {!isIntro && (
            <Link href="/" className="flex items-center gap-2 touch-target min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gaia-intro.svg"
                onError={(event) => {
                  const el = event.currentTarget as HTMLImageElement;
                  el.src = "/gaia-intro.png";
                }}
                alt="GAIA"
                className="h-9 w-auto shrink-0"
              />
              <span className="sr-only">GAIA Home</span>
            </Link>
          )}

          {/* Hamburger: toggles main nav + search panel; on intro this is the only visible control */}
          <button
            type="button"
            className={`touch-target -ml-1 inline-flex items-center justify-center rounded-lg p-2 ${isIntro ? "" : "md:hidden"} ${isIntro ? "rounded-full gaia-glass-strong gaia-border border shadow-sm" : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>

        <div className="flex flex-1 items-center gap-3">
          {pathname !== "/" && (
            <form
              className="hidden w-full max-w-lg md:block"
              onSubmit={submitSearch}
              role="search"
            >
              <label htmlFor="gaia-search" className="sr-only">
                Search the site
              </label>
              <input
                id="gaia-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search site..."
                className="w-full rounded-lg border gaia-border bg-white/6 px-3 py-2 text-sm placeholder:gaia-muted"
              />
            </form>
          )}

          <div className="flex-shrink-0" />
        </div>

        {/* Slide-down menu panel (always when open on intro; on other pages only on mobile) */}
        {mobileOpen && (
          <div className={`absolute inset-x-0 top-full z-40 flex flex-col gap-3 border-b gaia-border gaia-glass p-3 ${isIntro ? "" : "md:hidden"} [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))]`}>
            {pathname !== "/" && (
              <form onSubmit={submitSearch} role="search">
                <label htmlFor="gaia-search-mobile" className="sr-only">
                  Search the site
                </label>
                <input
                  id="gaia-search-mobile"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search site..."
                  className="w-full rounded-lg border gaia-border bg-white/6 px-3 py-3 text-base placeholder:gaia-muted"
                />
              </form>
            )}
            <nav className="grid grid-cols-2 gap-2" aria-label="Main">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border gaia-border bg-white/5 px-3 py-2 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
