"use client";

import React, { useEffect, useState } from "react";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

const FALLBACK_IMAGE = "/gaia-intro-1.png";

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

  if (!item) return null;

  const title = item.title || "Untitled";
  const downloadUrl = getDownloadUrl(item);
  const mediaSrc = getMediaSrc(item);
  const isVideo = item.type === "video";
  const posterUrl =
    isVideo && item.thumbnails?.length
      ? item.thumbnails[0].localPath ?? (item.thumbnails[0].r2Key ? getR2PreviewUrl(item.thumbnails[0].r2Key) : undefined)
      : undefined;

  return (
    <div
      className="z-[9999] flex items-center justify-center overflow-y-auto bg-neutral-900/95 p-4"
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
      {/* Close button - top right of screen */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous / Next - large arrows on sides of card */}
      {hasPrev && onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700/90 text-white hover:bg-neutral-600 md:left-4"
          aria-label="Previous"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {hasNext && onNext && (
        <button
          type="button"
          onClick={onNext}
          className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700/90 text-white hover:bg-neutral-600 md:right-4"
          aria-label="Next"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Centered white card (Pexels-style) */}
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: creator (left) + actions (right) */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" aria-hidden />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">GAIA Gallery</p>
            </div>
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

        {/* Media: full width, adaptive height; contained so video controls don't overlap bottom bar */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
          {isVideo && (item.embedUrl || item.embedHtml) ? (
            <div
              className="aspect-video w-full"
              dangerouslySetInnerHTML={{
                __html: item.embedHtml ?? `<iframe src="${item.embedUrl}" allowfullscreen class="h-full w-full" />`,
              }}
            />
          ) : isVideo ? (
            <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
              <video
                src={item.r2Path ? getR2Url(item.r2Path) : item.localPath ?? item.src ?? ""}
                poster={posterUrl ?? FALLBACK_IMAGE}
                controls
                className="max-h-full max-w-full object-contain"
                preload="metadata"
              />
            </div>
          ) : (
            <img
              src={mediaSrc}
              alt={title}
              className="block h-auto w-full object-contain"
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
