"use client";

import { useState } from "react";

const TRIGGER_TAGS = [
  "Sexual urge",
  "Loneliness",
  "Anger",
  "Family",
  "Powerlessness",
  "Boredom",
] as const;

type Props = {
  onClose: () => void;
};

export default function TriggerTagSelector({ onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
          Tag trigger
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRIGGER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelected(selected === tag ? null : tag)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                selected === tag
                  ? "border-[var(--gaia-positive)] bg-[var(--gaia-positive-bg)] text-[var(--gaia-positive)]"
                  : "border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-default)] hover:border-[var(--gaia-border)]/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-xs text-[var(--gaia-text-muted)] hover:text-[var(--gaia-text-default)]"
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </div>
  );
}
