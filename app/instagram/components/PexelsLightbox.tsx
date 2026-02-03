"use client";

import React, { useEffect, useState } from "react";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

const FALLBACK_IMAGE = "/gaia-intro-1.png";

function getImageSrc(item: MediaItem): string {
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

  const initialSrc = getImageSrc(item);
  const title = item.title || "Untitled";
  const [src, setSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(initialSrc);
    setLoaded(false);
  }, [item?.id, initialSrc]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Image preview">
      <button type="button" onClick={onClose} aria-label="Close" />
      <div onClick={(e) => e.stopPropagation()}>
        <div>
          <div>
            <span aria-hidden />
            <span>GAIA Gallery</span>
          </div>
          <div>
            <button type="button" aria-label="Save">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </button>
            <button type="button" onClick={onClose}>
              Free download
            </button>
          </div>
        </div>

        <div>
          <div>
            {!loaded && (
              <div aria-hidden />
            )}
            <img
              src={src}
              alt={title}
              loading="eager"
              onLoad={() => setLoaded(true)}
              onError={() => {
                setLoaded(true);
                setSrc(FALLBACK_IMAGE);
              }}
            />
          </div>
          {hasPrev && onPrev && (
            <button type="button" onClick={onPrev} aria-label="Previous image">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          {hasNext && onNext && (
            <button type="button" onClick={onNext} aria-label="Next image">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          )}
        </div>

        <div>
          <div>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Free to use
            </span>
            <span>{title}</span>
          </div>
          <div>
            <button type="button">More info</button>
            <button type="button">Share</button>
            <button type="button" aria-label="Save">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <button type="button" onClick={onClose} aria-label="Close preview">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
}
