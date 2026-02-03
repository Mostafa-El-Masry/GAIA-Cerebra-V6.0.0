"use client";

import React from "react";
import Image from "next/image";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

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
  return "/gaia-intro-1.png";
}

type PexelsImageCardProps = {
  item: MediaItem;
  onClick: () => void;
};

export function PexelsImageCard({ item, onClick }: PexelsImageCardProps) {
  const src = getImageSrc(item);
  const title = item.title || "Untitled";

  return (
    <article>
      <button type="button" onClick={onClick} aria-label={title}>
        <div>
          <Image
            src={src}
            alt={title}
            width={400}
            height={300}
            unoptimized
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src && !target.src.endsWith("/gaia-intro-1.png")) {
                target.src = "/gaia-intro-1.png";
                target.onerror = null;
              }
            }}
          />
          <div>
            <span />
            <span />
          </div>
        </div>
        <div>
          <div>
            <span aria-hidden />
            <span>{title}</span>
          </div>
          <span>View</span>
        </div>
      </button>
    </article>
  );
}
