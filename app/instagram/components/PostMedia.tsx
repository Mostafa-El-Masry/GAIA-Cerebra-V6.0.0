import React from "react";
import Image from "next/image";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

const PLACEHOLDER_IMAGE = "/gaia-intro-1.png";

interface PostMediaProps {
  item: MediaItem;
  onImageClick?: () => void;
}

const PostMedia: React.FC<PostMediaProps> = ({ item, onImageClick }) => {
  const getSrc = () => {
    if (item.r2Path) return getR2Url(item.r2Path);
    if (item.localPath) return item.localPath;
    if (item.src) return item.src;
    return "";
  };

  /** Poster/thumbnail URL for video so preview shows instead of black. */
  const getPosterUrl = (): string | undefined => {
    if (item.type !== "video" || !item.thumbnails?.length) return undefined;
    const t = item.thumbnails[0];
    if (t.localPath) return t.localPath;
    if (t.r2Key) return getR2PreviewUrl(t.r2Key);
    return undefined;
  };

  const src = getSrc();
  const posterUrl = getPosterUrl();

  if (!src) return null;

  if (item.type === "image") {
    return (
      <div
        role="button"
        tabIndex={0}
        className="block h-full w-full cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onImageClick?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onImageClick?.();
          }
        }}
        aria-label={item.title ? `View ${item.title}` : "View image"}
      >
        <Image
          src={src}
          alt={item.title || "Instagram post image"}
          width={400}
          height={300}
          className="h-full w-full object-cover"
          unoptimized
          draggable={false}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== PLACEHOLDER_IMAGE) {
              target.src = PLACEHOLDER_IMAGE;
              target.onerror = null;
            }
          }}
        />
      </div>
    );
  }

  if (item.type === "video") {
    if (item.embedUrl || item.embedHtml) {
      return (
        <div
          role="button"
          tabIndex={0}
          className="block h-full w-full cursor-pointer [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:object-cover"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageClick?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onImageClick?.();
            }
          }}
          dangerouslySetInnerHTML={{
            __html:
              item.embedHtml || `<iframe src="${item.embedUrl}" allowFullScreen />`,
          }}
        />
      );
    }
    return (
      <div
        role="button"
        tabIndex={0}
        className="block h-full w-full cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName !== "VIDEO") {
            e.preventDefault();
            e.stopPropagation();
            onImageClick?.();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onImageClick?.();
          }
        }}
      >
        <video
          src={src}
          poster={posterUrl ?? PLACEHOLDER_IMAGE}
          controls
          className="h-full w-full object-cover"
          preload="metadata"
        />
      </div>
    );
  }

  return null;
};

export default PostMedia;
