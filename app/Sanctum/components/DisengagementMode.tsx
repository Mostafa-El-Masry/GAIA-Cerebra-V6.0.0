"use client";

import { useState } from "react";

export default function DisengagementMode({ onExit }: { onExit: () => void }) {
  const [waited, setWaited] = useState(false);
  const [didNotEscalate, setDidNotEscalate] = useState(false);
  const [noLateNight, setNoLateNight] = useState(false);
  const [willNotReopen, setWillNotReopen] = useState(false);

  const allChecked = waited && didNotEscalate && noLateNight && willNotReopen;

  return (
    <div>
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
