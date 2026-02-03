import "@/styles/theme.css";
import "@/styles/globals.css";
import type { Metadata } from "next";

import { DesignProvider } from "../DesignSystem/context/DesignProvider";
import AppController from "./AppController/AppController";

export const metadata: Metadata = {
  title: { default: "GAIA", template: "GAIA | %s" },
  description: "GAIA v2.0 · Phase 5",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 5,
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesignProvider>
      <AppController>{children}</AppController>
    </DesignProvider>
  );
}
