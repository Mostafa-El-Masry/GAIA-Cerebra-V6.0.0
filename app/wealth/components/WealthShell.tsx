"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { href: "/wealth", label: "Overview" },
  { href: "/wealth/flows", label: "Flows" },
  { href: "/wealth/purchases", label: "Purchases" },
  { href: "/wealth/instruments", label: "Investments" },
  { href: "/wealth/plans", label: "Plans" },
  { href: "/wealth/phases", label: "Phases" },
  { href: "/wealth/projections", label: "Projections" },
];

export default function WealthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeDrawer = useCallback(() => setMobileOpen(false), []);
  useEffect(() => closeDrawer(), [pathname, closeDrawer]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, closeDrawer]);

  return (
    <div
      className={`min-h-screen min-h-[100dvh] bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] ${manrope.className}`}
    >
      <div className="flex min-h-screen min-h-[100dvh]">
        {/* Mobile: header + drawer */}
        <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b gaia-border bg-[var(--gaia-surface)]/95 shadow-sm lg:hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="touch-target -ml-1 inline-flex items-center justify-center rounded-lg p-2 text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]"
              onClick={() => setMobileOpen(true)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] gaia-muted">Gaia Wealth</p>
              <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">Wall Street Drive</p>
            </div>
          </div>
        </div>

        {/* Drawer overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[0.125rem] lg:hidden"
              aria-hidden
              onClick={closeDrawer}
            />
            <aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto border-r gaia-border bg-[var(--gaia-surface)] p-4 shadow-xl lg:hidden pt-[max(1rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              role="dialog"
              aria-label="Wealth navigation"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">Menu</p>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-[var(--gaia-text-muted)] hover:bg-[var(--gaia-surface-soft)]"
                  onClick={closeDrawer}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`touch-target flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-[var(--gaia-contrast-bg)]/15 text-[var(--gaia-text-strong)] ring-1 ring-[var(--gaia-contrast-bg)]/60"
                          : "text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-[var(--gaia-surface-soft)] px-2 py-0.5 text-[0.625rem] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r gaia-border bg-[var(--gaia-surface)]/95 px-5 py-6 shadow-[0.375rem_0_1.5rem_rgba(15,23,42,0.08)] lg:flex">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gaia-contrast-bg)]/20 text-lg font-bold text-[var(--gaia-contrast-bg)]">
              G
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] gaia-muted">Gaia Wealth</p>
              <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">Wall Street Drive</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--gaia-contrast-bg)]/15 text-[var(--gaia-text-strong)] ring-1 ring-[var(--gaia-contrast-bg)]/60"
                      : "text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-[var(--gaia-surface-soft)] px-2 py-0.5 text-[0.625rem] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto" />
        </aside>

        <div className="flex min-h-screen min-h-[100dvh] flex-1 flex-col">
          <main className="flex-1 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-20 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
