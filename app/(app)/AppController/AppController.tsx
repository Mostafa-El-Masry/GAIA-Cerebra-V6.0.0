"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppBar from "../../components/AppBar";

export default function AppController({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isIntroPage = pathname === "/";

  return (
    <div className="content gaia-scene-bg flex min-h-screen min-h-[100dvh] flex-col">
      {!isIntroPage && <AppBar />}
      <main className={`min-h-0 flex-1 ${isIntroPage ? "" : "pt-14 md:pt-16"}`}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
