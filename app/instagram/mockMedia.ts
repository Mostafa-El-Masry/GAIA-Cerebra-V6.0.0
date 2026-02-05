import { MediaItem } from "./mediaTypes";

/** Fallback items: videos only (no local/public images). */
export const mockMediaItems: MediaItem[] = [
  {
    id: "vid-1",
    slug: "egypt-trip-walk",
    type: "video",
    title: "Walking in Cairo Streets",
    description: "Fast walk between old streets – noisy, alive.",
    tags: ["trip", "egypt", "walk"],
    source: "embed",
    src: "https://www.youtube.com/embed/jNQXAC9IVRw",
    embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    createdAt: "2024-02-11T09:00:00.000Z",
    updatedAt: "2024-02-11T09:00:00.000Z",
    thumbnails: [
      {
        index: 1,
        r2Key: "gallery/thumbs/egypt-trip-walk/thumb_001.jpg",
      },
      {
        index: 2,
        r2Key: "gallery/thumbs/egypt-trip-walk/thumb_002.jpg",
      },
      {
        index: 3,
        r2Key: "gallery/thumbs/egypt-trip-walk/thumb_003.jpg",
      },
      {
        index: 4,
        r2Key: "gallery/thumbs/egypt-trip-walk/thumb_004.jpg",
      },
      {
        index: 5,
        r2Key: "gallery/thumbs/egypt-trip-walk/thumb_005.jpg",
      },
      {
        index: 6,
        r2Key: "gallery/thumbs/egypt-trip-walk/thumb_006.jpg",
      },
    ],
    desiredThumbnailCount: 6,
    isFavorite: true,
  },
  {
    id: "vid-2",
    slug: "gym-session",
    type: "video",
    title: "Gym Session – Back Day",
    description: "Short clip from a back workout – Health Awakening vibes.",
    tags: ["health", "gym", "power"],
    source: "embed",
    src: "https://www.youtube.com/embed/jNQXAC9IVRw",
    embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    createdAt: "2024-04-05T17:10:00.000Z",
    updatedAt: "2024-04-05T17:10:00.000Z",
    thumbnails: [
      {
        index: 1,
        r2Key: "gallery/thumbs/gym-session/thumb_001.jpg",
      },
      {
        index: 2,
        r2Key: "gallery/thumbs/gym-session/thumb_002.jpg",
      },
      {
        index: 3,
        r2Key: "gallery/thumbs/gym-session/thumb_003.jpg",
      },
    ],
    needsMoreThumbs: true,
    desiredThumbnailCount: 6,
    isFavorite: true,
    pinnedForFeature: true,
  },
  {
    id: "vid-3",
    slug: "coding-timelapse",
    type: "video",
    title: "Coding Timelapse – GAIA Night",
    description: "Timelapse of a long GAIA coding night.",
    tags: ["work", "gaia", "timelapse"],
    source: "embed",
    src: "https://www.youtube.com/embed/jNQXAC9IVRw",
    embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    createdAt: "2023-01-18T21:00:00.000Z",
    updatedAt: "2023-01-18T21:00:00.000Z",
    thumbnails: [
      {
        index: 1,
        r2Key: "gallery/thumbs/coding-timelapse/thumb_001.jpg",
      },
      {
        index: 2,
        r2Key: "gallery/thumbs/coding-timelapse/thumb_002.jpg",
      },
      {
        index: 3,
        r2Key: "gallery/thumbs/coding-timelapse/thumb_003.jpg",
      },
      {
        index: 4,
        r2Key: "gallery/thumbs/coding-timelapse/thumb_004.jpg",
      },
    ],
    desiredThumbnailCount: 4,
  },
];
