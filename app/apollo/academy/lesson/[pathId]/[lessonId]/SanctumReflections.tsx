"use client";

import { useCallback, useRef, useState } from "react";

const MAX_VIDEO_MS = 5 * 60 * 1000;

type Props = {
  pathId: string;
  lessonId: string;
  lessonUuid: string | null;
  allowsReflection: boolean;
  allowsAudio: boolean;
  allowsVideo: boolean;
};

export default function SanctumReflections({
  pathId,
  lessonId,
  allowsReflection,
  allowsAudio,
  allowsVideo,
}: Props) {
  const [text, setText] = useState("");
  const [textSaving, setTextSaving] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceSaving, setVoiceSaving] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const saveText = useCallback(async () => {
    if (!text.trim()) return;
    setTextSaving(true);
    try {
      const form = new FormData();
      form.set("pathId", pathId);
      form.set("lessonId", lessonId);
      form.set("type", "text");
      form.set("content", text.trim());
      const res = await fetch("/api/apollo/academy/reflections", { method: "POST", body: form });
      if (res.ok) setText("");
    } finally {
      setTextSaving(false);
    }
  }, [pathId, lessonId, text]);

  const voiceTranscriptRef = useRef("");
  const voiceRecRef = useRef<{ stop: () => void } | null>(null);
  const voiceMediaRecRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);

  const startVoice = useCallback(async () => {
    const Win = typeof window !== "undefined" ? window : null;
    const SR = Win && ((Win as unknown as { SpeechRecognition?: new () => { start: () => void; stop: () => void; continuous: boolean; interimResults: boolean; lang: string; onresult: (e: { results: unknown[] }) => void } }).SpeechRecognition ?? (Win as unknown as { webkitSpeechRecognition?: new () => { start: () => void; stop: () => void; continuous: boolean; interimResults: boolean; lang: string; onresult: (e: { results: unknown[] }) => void } }).webkitSpeechRecognition);
    if (!SR) {
      setVoiceTranscript("Speech recognition not supported.");
      return;
    }
    voiceTranscriptRef.current = "";
    setVoiceTranscript("");
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: { results: unknown[] }) => {
      const t = Array.from(e.results)
        .map((r) => (r as { [i: number]: { transcript: string } })[0]?.transcript ?? "")
        .join(" ");
      voiceTranscriptRef.current = t;
      setVoiceTranscript(t);
    };
    rec.start();
    voiceRecRef.current = rec;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && voiceChunksRef.current.push(e.data);
      mr.start(1000);
      voiceMediaRecRef.current = mr;
    } catch {
      // audio recording optional
    }
    setIsRecordingVoice(true);
  }, []);

  const stopVoice = useCallback(async () => {
    const rec = voiceRecRef.current;
    if (rec) {
      rec.stop();
      voiceRecRef.current = null;
    }
    const mr = voiceMediaRecRef.current;
    if (mr?.state === "recording") {
      mr.stop();
      voiceMediaRecRef.current = null;
      mr.stream?.getTracks().forEach((t) => t.stop());
    }
    setIsRecordingVoice(false);
    const transcript = voiceTranscriptRef.current.trim();
    setVoiceSaving(true);
    try {
      const form = new FormData();
      form.set("pathId", pathId);
      form.set("lessonId", lessonId);
      form.set("type", "voice");
      form.set("content", transcript);
      const blob = voiceChunksRef.current.length ? new Blob(voiceChunksRef.current, { type: "audio/webm" }) : null;
      if (blob) form.set("file", blob, "audio.webm");
      await fetch("/api/apollo/academy/reflections", { method: "POST", body: form });
      setVoiceTranscript("");
    } finally {
      setVoiceSaving(false);
    }
  }, [pathId, lessonId]);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoSaving(true);
        try {
          const form = new FormData();
          form.set("pathId", pathId);
          form.set("lessonId", lessonId);
          form.set("type", "video");
          form.set("file", blob, "reflection.webm");
          await fetch("/api/apollo/academy/reflections", { method: "POST", body: form });
        } finally {
          setVideoSaving(false);
        }
        setIsRecordingVideo(false);
      };
      rec.start(1000);
      mediaRecorderRef.current = rec;
      setIsRecordingVideo(true);
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = null;
        }
      }, MAX_VIDEO_MS);
    } catch (e) {
      console.error(e);
      setIsRecordingVideo(false);
    }
  }, [pathId, lessonId]);

  const stopVideo = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  if (!allowsReflection && !allowsAudio && !allowsVideo) return null;

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gaia-text-muted)]">
        Reflection (optional)
      </p>

      {allowsReflection && (
        <div>
          <label className="block text-sm text-[var(--gaia-text-default)] mb-1">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Optional written reflection..."
            className="w-full rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-3 py-2 text-sm min-h-[100px]"
            rows={4}
          />
          <button
            type="button"
            onClick={saveText}
            disabled={!text.trim() || textSaving}
            className="mt-2 rounded-lg border border-[var(--gaia-border)] px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {textSaving ? "Saving…" : "Save"}
          </button>
        </div>
      )}

      {allowsAudio && (
        <div>
          <label className="block text-sm text-[var(--gaia-text-default)] mb-1">Voice</label>
          <p className="text-xs text-[var(--gaia-text-muted)] mb-2">
            Browser speech-to-text. Transcript saved to DB; audio stored locally.
          </p>
          {!isRecordingVoice ? (
            <button
              type="button"
              onClick={startVoice}
              disabled={voiceSaving}
              className="rounded-lg border border-[var(--gaia-border)] px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              Start recording
            </button>
          ) : (
            <div>
              <p className="text-sm text-[var(--gaia-text-muted)]">Recording… Speak now.</p>
              <button type="button" onClick={stopVoice} className="mt-2 rounded-lg border border-[var(--gaia-border)] px-3 py-1.5 text-sm font-medium">
                Stop and save
              </button>
            </div>
          )}
          {voiceTranscript && <p className="mt-2 text-sm text-[var(--gaia-text-default)]">{voiceTranscript}</p>}
          {voiceSaving && <p className="text-xs text-[var(--gaia-text-muted)]">Saving…</p>}
        </div>
      )}

      {allowsVideo && (
        <div>
          <label className="block text-sm text-[var(--gaia-text-default)] mb-1">Video</label>
          <p className="text-xs text-[var(--gaia-text-muted)] mb-2">Max 5 minutes. Stored locally.</p>
          {!isRecordingVideo ? (
            <button
              type="button"
              onClick={startVideo}
              disabled={videoSaving}
              className="rounded-lg border border-[var(--gaia-border)] px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            >
              {videoSaving ? "Saving…" : "Start video"}
            </button>
          ) : (
            <div>
              <p className="text-sm text-[var(--gaia-text-muted)]">Recording (max 5 min)…</p>
              <button
                type="button"
                onClick={stopVideo}
                className="mt-2 rounded-lg border border-[var(--gaia-border)] px-3 py-1.5 text-sm font-medium"
              >
                Stop
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
