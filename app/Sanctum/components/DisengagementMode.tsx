"use client";

import Link from "next/link";
import { useState } from "react";

export default function DisengagementMode({ onExit }: { onExit: () => void }) {
  const [started, setStarted] = useState(false);
  const [waited, setWaited] = useState(false);
  const [didNotEscalate, setDidNotEscalate] = useState(false);
  const [noLateNight, setNoLateNight] = useState(false);
  const [willNotReopen, setWillNotReopen] = useState(false);

  const allChecked = waited && didNotEscalate && noLateNight && willNotReopen;

  if (!started) {
    return (
      <div>
        <h2>Emotional Disengagement</h2>
        <p>
          Break emotional attachment loops during or after interaction with a triggering person. Creates distance; no analysis or journaling.
        </p>
        <Link href="/sanctum/protocol">View full protocol</Link>
        <button type="button" onClick={() => setStarted(true)}>
          Start
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Emotional Disengagement</h2>
      <label>
        <input
          type="checkbox"
          checked={waited}
          onChange={(e) => setWaited(e.target.checked)}
          required
        />
        I waited before replying
      </label>
      <label>
        <input
          type="checkbox"
          checked={didNotEscalate}
          onChange={(e) => setDidNotEscalate(e.target.checked)}
          required
        />
        I did not escalate tone
      </label>
      <label>
        <input
          type="checkbox"
          checked={noLateNight}
          onChange={(e) => setNoLateNight(e.target.checked)}
          required
        />
        I did not reply late at night
      </label>
      <label>
        <input
          type="checkbox"
          checked={willNotReopen}
          onChange={(e) => setWillNotReopen(e.target.checked)}
          required
        />
        I will not reopen this conversation today
      </label>
      <button type="button" disabled={!allChecked} onClick={onExit}>
        Confirm & Exit
      </button>
    </div>
  );
}
