"use client";

import type { ReactNode } from "react";

export default function AppController({ children }: { children: ReactNode }) {
  return (
    <div className="content gaia-scene-bg flex min-h-screen min-h-[100dvh] flex-col">
      <main className="min-h-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
