"use client";

import { useState } from "react";
import type { SanctumMode } from "../config";
import RegulationMode from "./RegulationMode";
import DisengagementMode from "./DisengagementMode";

export default function SanctumModeSelect() {
  const [mode, setMode] = useState<SanctumMode | null>(null);

  if (mode === "regulation") {
    return <RegulationMode onExit={() => setMode(null)} />;
  }
  if (mode === "disengagement") {
    return <DisengagementMode onExit={() => setMode(null)} />;
  }

  return (
    <div>
      <button type="button" onClick={() => setMode("regulation")}>
        Regulation
      </button>
      <button type="button" onClick={() => setMode("disengagement")}>
        Disengagement
      </button>
    </div>
  );
}
