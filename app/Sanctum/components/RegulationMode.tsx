"use client";

import { useState } from "react";

export default function RegulationMode({ onExit }: { onExit: () => void }) {
  const [text, setText] = useState("");

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button" onClick={onExit}>
        Exit Sanctum
      </button>
    </div>
  );
}
