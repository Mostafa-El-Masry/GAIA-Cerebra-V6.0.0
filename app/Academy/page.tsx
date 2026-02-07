"use client";

import Link from "next/link";

export default function AcademyPage() {
  return (
    <div>
      <Link href="/academy/tracks/psychological">Psychological</Link>
      <Link href="/academy/tracks/hard-skills">Hard Skills</Link>
    </div>
  );
}
