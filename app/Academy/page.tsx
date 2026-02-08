"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SANCTUM_CALENDAR_NODE } from "./calendarNodes";

export default function AcademyPage() {
  const [isSanctumDay, setIsSanctumDay] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/academy/today")
      .then((r) => r.json())
      .then((data: { pathId: string | null }) => {
        setIsSanctumDay(data.pathId === "sanctum");
      })
      .catch(() => setIsSanctumDay(false));
  }, []);

  return (
    <div>
      <Link href="/academy/tracks/hard-skills">Hard Skills</Link>
      {isSanctumDay === true && (
        <Link href={SANCTUM_CALENDAR_NODE.route}>
          {SANCTUM_CALENDAR_NODE.label}
        </Link>
      )}
    </div>
  );
}
