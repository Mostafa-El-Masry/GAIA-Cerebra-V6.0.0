"use client";

import { isSelfWorkDay } from "@/app/Academy/calendar";

export default function SanctumGate({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isSelfWorkDay() === false) {
    return null;
  }
  return <>{children}</>;
}
