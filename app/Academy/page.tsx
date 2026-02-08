"use client";

import Link from "next/link";
import { isSelfWorkDay } from "./calendar";
import { SANCTUM_CALENDAR_NODE } from "./calendarNodes";

export default function AcademyPage() {
  const showSanctumSlot = isSelfWorkDay();

  return (
    <div>
      <Link href="/academy/tracks/hard-skills">Hard Skills</Link>
      {showSanctumSlot && (
        <Link href={SANCTUM_CALENDAR_NODE.route}>{SANCTUM_CALENDAR_NODE.label}</Link>
      )}
    </div>
  );
}
