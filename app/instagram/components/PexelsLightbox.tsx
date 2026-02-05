"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

const FALLBACK_IMAGE = "/gaia-intro-1.png";
const LIGHTBOX_STORAGE_KEY = "gaia_lightbox_media";

type SavedMediaState = { position: number; volume: number; muted: boolean };

function getSavedState(itemId: string): SavedMediaState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${LIGHTBOX_STORAGE_KEY}_${itemId}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedMediaState;
    if (typeof data.position !== "number" || typeof data.volume !== "number" || typeof data.muted !== "boolean")
      return null;
    return { position: data.position, volume: data.volume, muted: data.muted };
  } catch {
    return null;
  }
}

function saveState(itemId: string, state: SavedMediaState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${LIGHTBOX_STORAGE_KEY}_${itemId}`, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function getMediaSrc(item: MediaItem): string {
  if (item.type === "image") {
    if (item.r2Path) return getR2Url(item.r2Path);
    if (item.localPath) return item.localPath;
    if (item.src) return item.src;
  }
  if (item.type === "video" && item.thumbnails?.length) {
    const t = item.thumbnails[0];
    if (t.localPath) return t.localPath;
    if (t.r2Key) return getR2PreviewUrl(t.r2Key);
  }
  if (item.type === "video") {
    if (item.r2Path) return getR2Url(item.r2Path);
    if (item.localPath) return item.localPath;
    if (item.src) return item.src;
  }
  return FALLBACK_IMAGE;
}

function getDownloadUrl(item: MediaItem): string {
  if (item.r2Path) return getR2Url(item.r2Path);
  if (item.localPath) return item.localPath;
  if (item.src) return item.src;
  return getMediaSrc(item);
}

type PexelsLightboxProps = {
  item: MediaItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
};

export function PexelsLightbox({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PexelsLightboxProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const savePositionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cardPosition, setCardPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = (e.target as HTMLElement).closest("[data-lightbox-card]")?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startLeft: centerX, startTop: centerY };
  }, []);

  useEffect(() => {
    if (!dragRef.current) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setCardPosition({ x: dragRef.current.startLeft + dx, y: dragRef.current.startTop + dy });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [item?.id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    if (item) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  useEffect(() => {
    return () => {
      if (savePositionTimeoutRef.current) {
        clearTimeout(savePositionTimeoutRef.current);
        savePositionTimeoutRef.current = null;
      }
    };
  }, []);

  if (!item) return null;

  const title = item.title || "Untitled";
  const downloadUrl = getDownloadUrl(item);
  const mediaSrc = getMediaSrc(item);
  const isVideo = item.type === "video";
  const posterUrl =
    isVideo && item.thumbnails?.length
      ? item.thumbnails[0].localPath ?? (item.thumbnails[0].r2Key ? getR2PreviewUrl(item.thumbnails[0].r2Key) : undefined)
      : undefined;

  const isCentered = cardPosition === null;
  const cardStyle = isCentered
    ? undefined
    : { left: cardPosition.x, top: cardPosition.y, transform: "translate(-50%, -50%)" };

  return (
    <div
      className="z-[9999] flex items-center justify-center overflow-y-auto p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: "100dvh",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
      onClick={onClose}
    >
      <div
        data-lightbox-card
        className="relative flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{
          ...(isCentered ? {} : { position: "fixed", margin: 0 }),
          ...cardStyle,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: drag handle (left) + close/prev/next + actions (right) */}
        <div className="flex shrink-0 cursor-grab active:cursor-grabbing items-center justify-between gap-4 border-b border-gray-100 px-4 py-3">
          <div
            className="flex min-w-0 select-none items-center gap-3"
            onMouseDown={handleDragStart}
            role="button"
            aria-label="Drag to move"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" aria-hidden />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">GAIA Gallery</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {hasPrev && onPrev && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Previous"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {hasNext && onNext && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Next"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <button type="button" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Save">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button type="button" className="flex items-center gap-1 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Like">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">0</span>
            </button>
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Free download
            </a>
          </div>
        </div>

        {/* Media: image/video fills the area at full size (object-contain = no crop) */}
        <div className="relative flex min-h-0 flex-1 items-stretch justify-center overflow-hidden bg-black">
          {isVideo && (item.embedUrl || item.embedHtml) ? (
            <div
              className="aspect-video w-full max-h-full"
              dangerouslySetInnerHTML={{
                __html: item.embedHtml ?? `<iframe src="${item.embedUrl}" allowfullscreen class="h-full w-full" />`,
              }}
            />
          ) : isVideo ? (
            <video
              ref={videoRef}
              src={item.r2Path ? getR2Url(item.r2Path) : item.localPath ?? item.src ?? ""}
              poster={posterUrl ?? FALLBACK_IMAGE}
              controls
              muted
              className="h-full w-full object-contain"
              preload="metadata"
              onCanPlay={() => {
                const video = videoRef.current;
                if (!video || item.type !== "video") return;
                const saved = getSavedState(item.id);
                const position = saved?.position ?? 0;
                const volume = saved?.volume ?? 1;
                const muted = saved?.muted ?? true;
                if (position > 0 && position < video.duration) video.currentTime = position;
                video.volume = Math.max(0, Math.min(1, volume));
                video.muted = muted;
                video.play().catch(() => {});
              }}
              onTimeUpdate={() => {
                const video = videoRef.current;
                if (!video || item.type !== "video") return;
                if (savePositionTimeoutRef.current) return;
                savePositionTimeoutRef.current = setTimeout(() => {
                  savePositionTimeoutRef.current = null;
                  saveState(item.id, {
                    position: video.currentTime,
                    volume: video.volume,
                    muted: video.muted,
                  });
                }, 1000);
              }}
              onVolumeChange={() => {
                const video = videoRef.current;
                if (!video || item.type !== "video") return;
                saveState(item.id, {
                  position: video.currentTime,
                  volume: video.volume,
                  muted: video.muted,
                });
              }}
            />
          ) : (
            <img
              src={mediaSrc}
              alt={title}
              className="h-full w-full object-contain object-center"
              onError={(e) => {
                const t = e.currentTarget;
                if (t.src !== FALLBACK_IMAGE) {
                  t.src = FALLBACK_IMAGE;
                  t.onerror = null;
                }
              }}
            />
          )}
        </div>

        {/* Bottom bar: above video layer so it's never covered by native controls */}
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Free to use</p>
            <p className="truncate text-sm font-medium text-gray-900">{title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              More info
            </button>
            <button type="button" className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              Share
            </button>
            <button type="button" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Save">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
