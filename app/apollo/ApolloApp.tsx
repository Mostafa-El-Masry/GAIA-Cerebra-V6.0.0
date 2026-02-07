"use client";

import AskPanel from "./components/AskPanel";
import LinkCard from "./components/LinkCard";
import ApolloStudyGate from "./components/ApolloStudyGate";

export default function ApolloApp() {
  return (
    <div className="min-h-screen bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] py-6">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gaia-text-muted)]">
              Apollo
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--gaia-text-strong)]">
              Ask, capture, and keep your study flow
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-[var(--gaia-text-default)]">
              Use this surface to ask focused questions and move the best bits
              into your archive. Academy handles lessons; Apollo keeps your
              running notes tidy.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-[var(--gaia-positive-border)] bg-[var(--gaia-positive-bg)] px-3 py-1 shadow-sm text-xs font-semibold text-[var(--gaia-positive)]">
            <span className="mr-2 h-2 w-2 rounded-full bg-[var(--gaia-positive)]" />
            Assistant online
          </span>
        </header>

        <section className="rounded-3xl border border-[var(--gaia-border)] bg-[var(--gaia-contrast-bg)] px-4 sm:px-6 py-4 sm:py-5 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--gaia-contrast-text)]/80">
              Your study assistant
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--gaia-contrast-text)]">
              Capture answers, then archive the signal
            </h2>
            <p className="text-xs sm:text-[13px] text-[var(--gaia-contrast-text)]/90 max-w-xl">
              Ask targeted questions, highlight the useful parts, and send them
              straight into your Apollo archive so you keep a clean record
              alongside Academy.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <a
              href="#ask"
              className="inline-flex items-center justify-center rounded-full bg-[var(--gaia-surface)] px-4 py-2 text-xs font-semibold text-[var(--gaia-text-strong)] shadow-sm hover:bg-[var(--gaia-surface-soft)] transition"
            >
              Jump to Ask panel
            </a>
            <a
              href="/apollo/archives"
              className="text-[11px] underline text-[var(--gaia-contrast-text)]/80 hover:text-[var(--gaia-contrast-text)] inline-flex items-center justify-end"
            >
              View your archive
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 sm:px-6 py-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
              Paths into Apollo
            </h2>
            <span className="text-xs text-[var(--gaia-text-muted)]">
              Open tools for where you are in the flow
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LinkCard
              href="/apollo/learning"
              title="Labs"
              description="Learning map, projects, skills, and reflections."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 13v3a4 4 0 0 0 8 0v-3" />
                  <path d="M9 8h6l1 3H8l1-3z" />
                  <path d="M12 3v5" />
                </svg>
              }
            />
            <LinkCard
              href="/apollo/academy"
              title="Academy"
              description="Browse topics and structured lessons to level up."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20l8-4V6l-8 4-8-4v10l8 4z"
                  />
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12v8"
                  />
                </svg>
              }
            />

            <LinkCard
              href="/apollo/archives"
              title="Archives"
              description="Your saved notes and useful answers from Apollo."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="4"
                    rx="1"
                    ry="1"
                    strokeWidth="1.5"
                  />
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"
                  />
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 12h4"
                  />
                </svg>
              }
            />
          </div>
        </section>

        <section
          id="ask"
          className="rounded-3xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-4 sm:p-6 shadow-sm space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gaia-text-muted)]">
                Ask & capture
              </p>
              <h2 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                Work with ChatGPT, then archive the signal
              </h2>
            </div>
            <span className="text-xs text-[var(--gaia-text-muted)]">
              Focused Q&amp;A for your current lessons
            </span>
          </div>
          <AskPanel />
        </section>
      </main>
    </div>
  );
}
