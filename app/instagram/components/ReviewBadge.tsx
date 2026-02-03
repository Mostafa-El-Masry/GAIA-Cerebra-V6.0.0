"use client";

export function ReviewBadge({ rating }: { rating: number }) {
  if (!rating) return null;
  return (
    <div>
      ⭐ {rating.toFixed(1)}
    </div>
  );
}
