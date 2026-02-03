# Instagram (gallery) feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Main feed page |
| `layout.tsx` | Layout |
| `embed.ts` | Embed entry |
| `mediaTypes.ts` | Media type definitions |
| `mockMedia.ts` | Mock media data |
| `r2.ts` | R2 URL helper |
| `useInstagramData.ts` | Data-fetch hook (R2/cache) |
| `components/InstagramHeader.tsx` | Header |
| `components/InstagramPost.tsx` | Post component |
| `components/PageTransition.tsx` | Page transition |
| `components/PexelsLightbox.tsx` | Lightbox |
| `components/PexelsImageGrid.tsx`, `PexelsImageCard.tsx` | Image grid/card |
| `components/MediaCard.tsx`, `MediaGrid.tsx`, `PostMedia.tsx` | Media UI |
| `components/ActorCard.tsx`, `ReviewBadge.tsx` | Actor/review UI |
| `hooks/useInstagramData.ts` | Hook with shuffle/options (uses useInstagramData.ts) |
| `hooks/useInfiniteScroll.ts`, `useLike.ts`, `useLocalStorage.ts` | Hooks |
| `lib/socialStore.ts`, `supabaseVideos.ts`, `videoStore.ts` | Stores / data |
| `explore/page.tsx` | Explore route |
| `messages/page.tsx` | Messages route |
| `people/[id]/page.tsx` | Person profile route |

## What imports them

- `app/(app)/page.tsx` links to `/instagram`.
- Pages under `app/instagram/` import from `./components`, `./hooks`, `./lib`, `./useInstagramData`, `./mediaTypes`, `./mockMedia`, `./r2`.

## Routes

- `/instagram` – main feed.
- `/instagram/explore` – explore.
- `/instagram/messages` – messages.
- `/instagram/people/[id]` – person profile.

## Deletability

Removing `app/instagram/` would remove all Instagram routes and the embed entry. Feature is self-contained; shared usage is only via `lib/` and API routes.
