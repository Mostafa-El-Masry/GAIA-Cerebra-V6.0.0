"use client";
import React, { useState } from "react";
import Image from "next/image";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";
type MediaCardProps = {
  item: MediaItem;
  onClick: () => void;
  isCurrent: boolean;
};

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onClick,
  isCurrent,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item.type === "video" && isHovered ? (
        <video
          src={
            item.localPath ||
            (item.r2Path ? getR2Url(item.r2Path) : item.src) ||
            "/gaia-intro-1.png"
          }
          autoPlay
          loop
          muted
          playsInline
        />
      ) : item.type === "image" ? (
        <Image
          src={
            item.r2Path
              ? getR2Url(item.r2Path)
              : item.localPath || item.src || "/gaia-intro-1.png"
          }
          alt={item.title}
          width={300}
          height={200}
          unoptimized
        />
      ) : item.type === "video" && item.thumbnails && item.thumbnails.length > 0 ? (
        <Image
          src={
            item.thumbnails[0].localPath
              ? item.thumbnails[0].localPath
              : item.thumbnails[0].r2Key
              ? getR2PreviewUrl(item.thumbnails[0].r2Key)
              : "/gaia-intro-1.png"
          }
          alt={item.title}
          width={300}
          height={200}
          unoptimized
        />
      ) : (
        <Image
          src={item.src || "/gaia-intro-1.png"}
          alt={item.title}
          width={300}
          height={200}
          unoptimized
        />
      )}
      <div>
        <h3>{item.title}</h3>
      </div>
    </div>
  );
};
