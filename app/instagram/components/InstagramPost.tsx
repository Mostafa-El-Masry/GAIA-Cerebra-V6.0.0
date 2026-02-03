import React from "react";
import type { MediaItem } from "../mediaTypes";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, Share01Icon } from "@hugeicons/core-free-icons";
import { useLike } from "../hooks/useLike";
import PostMedia from "./PostMedia";

interface InstagramPostProps {
  item: MediaItem;
  onMediaClick?: (item: MediaItem) => void;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ item, onMediaClick }) => {
  const { isLiked, likes, handleLikeClick } = useLike(item.id);

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden">
        <PostMedia item={item} onImageClick={onMediaClick ? () => onMediaClick(item) : undefined} />
      </div>
      <div className="flex items-center gap-2 p-2">
        {isLiked ? (
          <HugeiconsIcon icon={FavouriteIcon} onClick={handleLikeClick} className="cursor-pointer text-red-500" />
        ) : (
          <HugeiconsIcon icon={FavouriteIcon} onClick={handleLikeClick} className="cursor-pointer text-gray-600" />
        )}
        <HugeiconsIcon icon={Share01Icon} className="cursor-pointer text-gray-600" />
      </div>
      <div className="border-t p-3">
        {likes > 0 && <p className="text-sm font-semibold text-gray-800">{likes} likes</p>}
        <p className="truncate text-sm text-gray-700">{item.title || "No caption provided."}</p>
        {item.description && item.description !== "External embed" && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{item.description}</p>
        )}
      </div>
    </article>
  );
};

export default InstagramPost;
