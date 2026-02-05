import React from "react";
import type { MediaItem } from "../mediaTypes";
import PostMedia from "./PostMedia";

interface InstagramPostProps {
  item: MediaItem;
  onMediaClick?: (item: MediaItem) => void;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ item, onMediaClick }) => {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden">
        <PostMedia item={item} onImageClick={onMediaClick ? () => onMediaClick(item) : undefined} />
      </div>
      <div className="border-t p-3">
        <p className="truncate text-sm text-gray-700">{item.title || "No caption provided."}</p>
        {item.description && item.description !== "External embed" && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{item.description}</p>
        )}
      </div>
    </article>
  );
};

export default InstagramPost;
