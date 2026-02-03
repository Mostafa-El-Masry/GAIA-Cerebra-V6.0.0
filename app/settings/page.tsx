"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useDesign } from "@/app/DesignSystem/context/DesignProvider";
import { THEMES, type Theme } from "@/app/DesignSystem/theme";
import {
  onUserStorageReady,
  readJSON,
  setItem,
  subscribe as subscribeStorage,
} from "@/lib/user-storage";

const THEME_OPTIONS = THEMES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function SettingsContent() {
  const { theme, setTheme } = useDesign();

  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [voiceChoice, setVoiceChoice] = useState("__auto__");

  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    const applyStoredVoice = () => {
      const stored = readJSON<string | null>(
        "gaia.academy.voicePreference",
        null,
      );
      if (stored) setVoiceChoice(stored);
    };
    applyStoredVoice();
    const offReady = onUserStorageReady(applyStoredVoice);
    const offStorage = subscribeStorage(({ key, value }) => {
      if (key === "gaia.academy.voicePreference" && typeof value === "string") {
        setVoiceChoice(value);
      }
    });
    return () => {
      offReady();
      offStorage();
    };
  }, []);

  useEffect(() => {
    if (!speechSupported) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices || []);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, [speechSupported]);

  const voiceDisplayName = useMemo(() => {
    if (voiceChoice === "__auto__") return "Auto";
    return (
      availableVoices.find((v) => v.voiceURI === voiceChoice)?.name ?? "Unknown"
    );
  }, [voiceChoice, availableVoices]);

  const handleVoiceChange = useCallback((value: string) => {
    setVoiceChoice(value);
    setItem("gaia.academy.voicePreference", value);
  }, []);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">General</h2>

        <div className="space-y-3 rounded-lg border gaia-border p-4">
          <h3 className="font-medium">Theme</h3>
          <select
            className="w-full rounded border gaia-border px-3 py-2 text-sm"
            value={theme}
            onChange={(event) => setTheme(event.target.value as Theme)}
          >
            {THEME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs gaia-muted">
            Applies everywhere. Stored in your browser.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border gaia-border p-4">
          <h3 className="font-medium">Narrative voice</h3>
          <p className="text-xs gaia-muted">
            Voice used for lesson read-aloud. Stored in your browser.
          </p>
          {speechSupported && availableVoices.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={voiceChoice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="rounded border gaia-border bg-[var(--gaia-surface)] px-3 py-1.5 text-sm gaia-contrast focus:border-info focus:ring-2 focus:ring-info/20"
              >
                <option value="__auto__">Auto (female preferred)</option>
                {availableVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} {voice.lang ? `(${voice.lang})` : ""}
                  </option>
                ))}
              </select>
              <span className="text-[12px] gaia-muted">
                Currently: {voiceDisplayName}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-xs gaia-muted">
              Voice selection is unavailable in this browser.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
