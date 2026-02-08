"use client";

import { useState } from "react";
import SanctumGate from "./components/SanctumGate";
import RegulationSession from "./components/RegulationSession";
import DisengagementSession from "./components/DisengagementSession";

export default function SanctumPage() {
  const [active, setActive] = useState<"regulation" | "disengagement" | null>(
    null
  );

  return (
    <SanctumGate onRedirectToRegulation={() => setActive("regulation")}>
      {active === "regulation" ? (
        <RegulationSession onExit={() => setActive(null)} />
      ) : active === "disengagement" ? (
        <DisengagementSession onExit={() => setActive(null)} />
      ) : (
        <div>
          <h1>Sanctum</h1>
          <button type="button" onClick={() => setActive("regulation")}>
            Regulation
          </button>
          <button type="button" onClick={() => setActive("disengagement")}>
            Emotional Disengagement
          </button>
        </div>
      )}
    </SanctumGate>
  );
}
