export function Spinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * Full-screen loading state with your G logo (eToro-style: bright logo on dark background with pulse).
 * Use for route-level loading (loading.tsx) or any full-page wait.
 */
export function GLogoLoader() {
  return (
    <div
      className="flex min-h-[100dvh] min-h-screen w-full flex-col items-center justify-center bg-[#1a1d24]"
      aria-label="Loading"
      role="status"
    >
      <div className="relative flex items-center justify-center">
        {/* Soft glow behind logo */}
        <div
          className="absolute inset-0 rounded-full opacity-40 blur-2xl transition-opacity duration-1000 animate-[pulse_2s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle, rgba(0,196,203,0.35) 0%, rgba(51,126,255,0.2) 40%, transparent 70%)",
            width: "140%",
            height: "140%",
            margin: "-20%",
          }}
        />
        {/* G logo - same as AppBar, with subtle pulse */}
        <div className="relative animate-[glogo-pulse_2s_ease-in-out_infinite]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gaia-intro.svg"
            alt=""
            className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
            aria-hidden
          />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium tracking-wide text-emerald-400/90">
        Loading…
      </p>
    </div>
  );
}

/**
 * Inline loading state with small G logo (for cards/sections).
 */
export function GLogoLoaderInline({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}
      aria-label="Loading"
      role="status"
    >
      <img
        src="/gaia-intro.svg"
        alt=""
        className="h-12 w-12 shrink-0 animate-[glogo-pulse_2s_ease-in-out_infinite] opacity-90"
        aria-hidden
      />
      <p className="text-sm text-[var(--gaia-text-muted)]">Loading…</p>
    </div>
  );
}
