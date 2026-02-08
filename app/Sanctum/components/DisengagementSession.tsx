"use client";

import { useState } from "react";

export default function DisengagementSession({
  onExit,
}: {
  onExit: () => void;
}) {
  const [waited, setWaited] = useState(false);
  const [didNotEscalate, setDidNotEscalate] = useState(false);
  const [noLateNight, setNoLateNight] = useState(false);
  const [willNotReopen, setWillNotReopen] = useState(false);

  const allChecked =
    waited && didNotEscalate && noLateNight && willNotReopen;

  const handleConfirm = () => {
    setWaited(false);
    setDidNotEscalate(false);
    setNoLateNight(false);
    setWillNotReopen(false);
    onExit();
  };

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
        I did not escalate the tone
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
      <button
        type="button"
        disabled={!allChecked}
        onClick={handleConfirm}
      >
        Confirm & Exit
      </button>
    </div>
  );
}
