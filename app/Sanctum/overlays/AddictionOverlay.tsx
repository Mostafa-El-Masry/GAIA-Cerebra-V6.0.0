"use client";

type Props = {
  onClose: () => void;
  onRedirectToRegulation: () => void;
};

export default function AddictionOverlay({
  onClose,
  onRedirectToRegulation,
}: Props) {
  const handleRedirect = () => {
    onClose();
    onRedirectToRegulation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
          Addiction Control
        </h2>
        <p className="mt-2 text-sm text-[var(--gaia-text-default)]">
          Interrupt → Delay → Redirect
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-1.5 text-sm font-medium text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]/80"
          >
            Interrupt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-1.5 text-sm font-medium text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]/80"
          >
            Delay
          </button>
          <button
            type="button"
            onClick={handleRedirect}
            className="rounded-md border border-[var(--gaia-positive)] bg-[var(--gaia-positive-bg)] px-3 py-1.5 text-sm font-medium text-[var(--gaia-positive)] hover:bg-[var(--gaia-positive)]/20"
          >
            Redirect to Regulation
          </button>
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
