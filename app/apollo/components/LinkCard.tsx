"use client";

import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
};

export default function LinkCard({ href, title, description, icon }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[var(--gaia-border)] transition"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-default)] group-hover:bg-[var(--gaia-ink-soft)] group-hover:text-[var(--gaia-text-strong)] transition"
        >
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--gaia-text-strong)]">{title}</h3>
          {description ? (
            <p className="text-xs text-[var(--gaia-text-muted)] max-w-xs mt-1 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
