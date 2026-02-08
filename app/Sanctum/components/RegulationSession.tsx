"use client";

import { useState } from "react";

export default function RegulationSession({ onExit }: { onExit: () => void }) {
  const [text, setText] = useState("");

  const handleExit = () => {
    setText("");
    onExit();
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write anything. No structure. No analysis. This is only to release pressure."
      />
      <button type="button" onClick={handleExit}>
        Exit Sanctum
      </button>
    </div>
  );
}
