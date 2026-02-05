import React from "react";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

const PLACEHOLDER = "/gaia-intro-1.png";

/** Thumbnail/image URL for the card, or null if we should use video first frame. */
function getDisplayImageUrl(item: MediaItem): string | null {
  if (item.type === "image") {
    if (item.r2Path) return getR2Url(item.r2Path);
    if (item.localPath) return item.localPath;
    if (item.src) return item.src;
    return PLACEHOLDER;
  }
  if (item.type === "video" && item.thumbnails?.length) {
    const t = item.thumbnails[0];
    if (t.localPath) return t.localPath;
    if (t.r2Key && item.source !== "local_video") return getR2PreviewUrl(t.r2Key);
  }
  return null;
}

/** Video src URL for first-frame preview when there is no thumbnail. */
function getVideoPreviewSrc(item: MediaItem): string | null {
  if (item.type !== "video") return null;
  if (item.r2Path) return getR2Url(item.r2Path);
  if (item.localPath) return item.localPath;
  if (item.src && !item.embedUrl) return item.src;
  return null;
}

interface InstagramPostProps {
  item: MediaItem;
  onMediaClick?: (item: MediaItem) => void;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ item, onMediaClick }) => {
  const title = item.title || "Untitled";
  const thumbUrl = getDisplayImageUrl(item);
  const videoSrc = getVideoPreviewSrc(item);
  const isVideo = item.type === "video";
  /** For videos with no thumbnail, show first frame via <video>; otherwise show thumbnail image. */
  const useVideoPreview = isVideo && !thumbUrl && videoSrc;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-card-action]")) return;
    onMediaClick?.(item);
  };

  return (
    <article className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        role="button"
        tabIndex={0}
        className="relative block w-full cursor-pointer text-left"
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!(e.target as HTMLElement).closest("[data-card-action]")) onMediaClick?.(item);
          }
        }}
        aria-label={title}
      >
        {/* Full width, natural height per image/video (masonry) */}
        <div className="relative w-full overflow-hidden rounded-t-lg bg-gray-100">
          {useVideoPreview ? (
            <video
              src={videoSrc}
              className="block w-full"
              style={{ height: "auto", display: "block", verticalAlign: "middle" }}
              muted
              playsInline
              preload="metadata"
              aria-label={title}
            />
          ) : (
            <img
              src={thumbUrl ?? PLACEHOLDER}
              alt={title}
              className="block w-full"
              style={{ height: "auto", display: "block", verticalAlign: "middle" }}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== PLACEHOLDER) {
                  target.src = PLACEHOLDER;
                  target.onerror = null;
                }
              }}
            />
          )}

          {/* Top-left: Edit (image) or Play (video) icon */}
          <div className="absolute left-2 top-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white"
              aria-hidden
            >
              {isVideo ? (
                <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              ) : (
                <svg className="h-4 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              )}
            </span>
          </div>

          {/* Top-right: Like + Bookmark */}
          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              data-card-action
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:text-red-500"
              aria-label="Like"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              type="button"
              data-card-action
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:text-gray-900"
              aria-label="Save"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {/* Bottom overlay: gradient + credit (left) + Download (right) */}
          <div
            className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            <div className="min-w-0 flex-1 text-white">
              <p className="truncate text-sm font-medium" title={title}>
                {title}
              </p>
            </div>
            <a
              href={videoSrc ?? thumbUrl ?? PLACEHOLDER}
              download
              target="_blank"
              rel="noopener noreferrer"
              data-card-action
              onClick={(e) => e.stopPropagation()}
              className="ml-2 shrink-0 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export default InstagramPost;
