"use client";

import { useEffect, useState } from "react";
import AddictionOverlay from "../overlays/AddictionOverlay";
import TriggerTagSelector from "../overlays/TriggerTagSelector";

type OverlayKind = "addiction" | "trigger-tag" | null;

type Props = {
  children: React.ReactNode;
  onRedirectToRegulation?: () => void;
};

export default function SanctumGate({
  children,
  onRedirectToRegulation,
}: Props) {
  const [isSanctumDay, setIsSanctumDay] = useState<boolean | null>(null);
  const [overlay, setOverlay] = useState<OverlayKind>(null);

  useEffect(() => {
    fetch("/api/academy/today")
      .then((r) => r.json())
      .then((data: { pathId: string | null }) => {
        setIsSanctumDay(data.pathId === "sanctum");
      })
      .catch(() => setIsSanctumDay(false));
  }, []);

  if (isSanctumDay !== true) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOverlay("addiction")}
            className="rounded-md border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-1.5 text-sm font-medium text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]/80"
          >
            I feel compulsive
          </button>
          <button
            type="button"
            onClick={() => setOverlay("trigger-tag")}
            className="rounded-md border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-1.5 text-sm font-medium text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]/80"
          >
            Tag trigger
          </button>
        </div>
        {children}
      </div>
      {overlay === "addiction" && (
        <AddictionOverlay
          onClose={() => setOverlay(null)}
          onRedirectToRegulation={() => {
            setOverlay(null);
            onRedirectToRegulation?.();
          }}
        />
      )}
      {overlay === "trigger-tag" && (
        <TriggerTagSelector onClose={() => setOverlay(null)} />
      )}
    </>
  );
}
