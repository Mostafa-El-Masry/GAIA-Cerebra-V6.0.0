"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { PageTransition } from "./components/PageTransition";
import InstagramPost from "./components/InstagramPost";
import { PexelsLightbox } from "./components/PexelsLightbox";
import { useInstagramData } from "./hooks/useInstagramData";

const INITIAL_COUNT = 21;
const LOAD_MORE_COUNT = 20;

const InstagramPage: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { items } = useInstagramData({ randomizeOrder: true });
  const [itemsToShow, setItemsToShow] = useState(INITIAL_COUNT);
  const [lightboxItem, setLightboxItem] = useState<typeof items[0] | null>(null);
  const visibleItems = items.slice(0, itemsToShow);
  const hasMore = itemsToShow < items.length;

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  const lightboxIndex = lightboxItem ? visibleItems.findIndex((i) => i.id === lightboxItem.id) : -1;
  const hasPrev = lightboxIndex > 0;
  const hasNext = lightboxIndex >= 0 && lightboxIndex < visibleItems.length - 1;
  const goPrev = () => setLightboxItem(hasPrev ? visibleItems[lightboxIndex - 1] ?? null : null);
  const goNext = () => setLightboxItem(hasNext ? visibleItems[lightboxIndex + 1] ?? null : null);

  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-[1600px] px-4 py-6">
          <div className="columns-3 gap-4">
            {visibleItems.map((item) => (
              <InstagramPost
                key={item.id}
                item={item}
                onMediaClick={() => setLightboxItem(item)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setItemsToShow((n) => Math.min(n + LOAD_MORE_COUNT, items.length))}
                className="rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-gray-50"
              >
                Load more
              </button>
            </div>
          )}
        </section>
      </main>
      {lightboxItem &&
        typeof document !== "undefined" &&
        createPortal(
          <PexelsLightbox
            item={lightboxItem}
            onClose={() => setLightboxItem(null)}
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />,
          document.body
        )}
    </PageTransition>
  );
};

export default InstagramPage;
