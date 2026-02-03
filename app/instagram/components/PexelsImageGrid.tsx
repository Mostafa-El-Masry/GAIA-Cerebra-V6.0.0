"use client";

import React, { useState } from "react";
import type { MediaItem } from "../mediaTypes";
import { PexelsImageCard } from "./PexelsImageCard";
import { PexelsLightbox } from "./PexelsLightbox";

type PexelsImageGridProps = {
  items: MediaItem[];
  title?: string;
};

export function PexelsImageGrid({ items, title }: PexelsImageGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const lightboxItem = lightboxIndex !== null ? items[lightboxIndex] ?? null : null;
  const hasPrev = lightboxIndex !== null && lightboxIndex > 0;
  const hasNext = lightboxIndex !== null && lightboxIndex < items.length - 1;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () => setLightboxIndex((i) => (i === null ? 0 : Math.max(0, i - 1)));
  const goNext = () => setLightboxIndex((i) => (i === null ? 0 : Math.min(items.length - 1, i + 1)));

  if (items.length === 0) return null;

  return (
    <section>
      {title && <h2>{title}</h2>}
      <div>
        {items.map((item, index) => (
          <div key={item.id}>
            <PexelsImageCard item={item} onClick={() => openLightbox(index)} />
          </div>
        ))}
      </div>
      {lightboxItem && (
        <PexelsLightbox
          item={lightboxItem}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
    </section>
  );
}
