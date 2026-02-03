"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    { href: "/ELEUTHIA", label: "ELEUTHIA" },
    { href: "/timeline", label: "Timeline" },
    { href: "/health", label: "Health" },
    { href: "/wealth", label: "Wealth" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="gaia-glass-strong gaia-border fixed inset-x-0 top-0 z-50 h-14 border-b border backdrop-blur md:h-16 [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)]">
      <div className="mx-auto flex h-full max-w-screen-xl items-center gap-3 px-3 sm:px-4">
        <div className="flex items-center gap-2">
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

          {/* Mobile menu button */}
          <button
            type="button"
            className="touch-target -ml-1 inline-flex items-center justify-center rounded-lg p-2 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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

        {/* Mobile slide-down panel */}
        {mobileOpen && (
          <div className="absolute inset-x-0 top-full z-40 flex flex-col gap-3 border-b gaia-border gaia-glass p-3 md:hidden [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))]">
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
