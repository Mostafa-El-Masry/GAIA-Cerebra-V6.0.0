"use client";

import React from "react";
import { createPortal } from "react-dom";
import type { MediaItem } from "@/app/instagram/mediaTypes";
import { LightboxContent } from "./LightboxContent";

/**
 * Lightbox MUST be rendered via portal and mounted directly under document.body.
 * Do NOT render inside gallery, page, layout, or app wrappers.
 * This ensures no parent has transform/filter/perspective so the fixed overlay
 * appears correctly in the viewport (Pexels/Instagram behavior).
 */
export type GlobalLightboxProps = {
  isOpen: boolean;
  activeImage: MediaItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
};

export function GlobalLightbox({
  isOpen,
  activeImage,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: GlobalLightboxProps) {
  if (!isOpen || !activeImage || typeof document === "undefined") {
    return null;
  }

  // Portal target MUST be document.body so the lightbox has no wrapper with transform/filter/perspective.
  return createPortal(
    <LightboxContent
      item={activeImage}
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
      hasPrev={hasPrev}
      hasNext={hasNext}
    />,
    document.body
  );
}
