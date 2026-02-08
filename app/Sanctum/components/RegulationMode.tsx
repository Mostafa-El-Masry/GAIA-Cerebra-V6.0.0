"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegulationMode({ onExit }: { onExit: () => void }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div>
        <h2>Body-based stabilization</h2>
        <p>
          Stabilize the nervous system during heightened emotional or physical
          arousal. This protocol restores baseline; no analysis or journaling.
        </p>
        <Link href="/sanctum/protocol/regulation">View full protocol</Link>
        <button type="button" onClick={() => setStarted(true)}>
          Start
        </button>
        <button type="button" onClick={onExit}>
          Exit
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Body-based stabilization</h2>
      <p>Follow the protocol (3–5 minutes).</p>
      <Link href="/sanctum/protocol/regulation">View full protocol</Link>
      <button type="button" onClick={onExit}>
        Exit
      </button>
    </div>
  );
}
