"use client";

import { usePathname } from "next/navigation";
import AppBar from "./AppBar";

export default function RootShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIntro = pathname === "/";

  if (isIntro) {
    return <>{children}</>;
  }

  return (
    <>
      <AppBar />
      <div className="min-h-screen min-h-[100dvh] flex flex-col pt-14 md:pt-16">
        {children}
      </div>
    </>
  );
}
