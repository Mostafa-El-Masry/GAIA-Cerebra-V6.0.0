"use client";

import React, { useMemo } from "react";
import type { MediaItem, MediaType } from "../mediaTypes";
import { MediaCard } from "./MediaCard";

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  typeFilter?: MediaType;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  maxVisibleItems?: number;
  allowDelete?: boolean;
  onDeleteItem?: (id: string) => void;
  onRenameItem?: (id: string, nextTitle: string) => void;
  currentVideoId?: string | null;
  onSetCurrentVideo?: (id: string) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  title,
  items,
  typeFilter,
  page,
  perPage,
  onPageChange,
  maxVisibleItems,
  currentVideoId,
  onSetCurrentVideo,
}) => {
  const filtered = useMemo(() => {
    if (!typeFilter) return items;
    return items.filter((item) => item.type === typeFilter);
  }, [items, typeFilter]);

  if (filtered.length === 0) {
    return null;
  }

  const effective =
    typeof maxVisibleItems === "number" && maxVisibleItems >= 0
      ? filtered.slice(0, maxVisibleItems)
      : filtered;

  const totalPages =
    perPage && perPage > 0
      ? Math.max(1, Math.ceil(effective.length / perPage))
      : 1;
  const currentPage =
    perPage && perPage > 0 ? Math.min(page ?? 1, totalPages) : 1;
  const start = perPage && perPage > 0 ? (currentPage - 1) * perPage : 0;
  const end = perPage && perPage > 0 ? start + perPage : effective.length;
  const paged = effective.slice(start, end);

  return (
    <section>
      <header>
        <div>
          <h2>{title}</h2>
        </div>
        <p>
          {filtered.length}{" "}
          {typeFilter
            ? typeFilter === "image"
              ? "images"
              : "videos"
            : "items"}
        </p>
      </header>

      <div>
        {paged.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            onClick={() => onSetCurrentVideo && onSetCurrentVideo(item.id)}
            isCurrent={currentVideoId === item.id}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && perPage && (
        <div>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
