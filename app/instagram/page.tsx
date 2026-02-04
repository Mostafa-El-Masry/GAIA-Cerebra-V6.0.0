"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { PageTransition } from "./components/PageTransition";
import InstagramPost from "./components/InstagramPost";
import { PexelsLightbox } from "./components/PexelsLightbox";
import { useInstagramData } from "./hooks/useInstagramData";

const INITIAL_COUNT = 1;
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
      <main className="min-h-screen bg-gray-100">
        <section className="mx-auto max-w-6xl px-4 py-6">
          {/* Testing: video card (host blocks iframe embed; open on site instead) */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Testing embed
            </p>
            <a
              href="https://www.eporner.com/video-DckIFvYSBaH/chanel-preston-her-first-big-sale-2/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white transition group-hover:bg-gray-800">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30">
                  <svg
                    className="ml-1 h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
                <span className="text-center text-sm font-medium">
                  Chanel Preston - Her First Big Sale 2
                </span>
                <span className="text-xs text-white/70">Click to watch on site</span>
              </div>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <div aria-hidden="true">
            <PexelsLightbox
              item={lightboxItem}
              onClose={() => setLightboxItem(null)}
              onPrev={goPrev}
              onNext={goNext}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          </div>,
          document.body
        )}
    </PageTransition>
  );
};

export default InstagramPage;
