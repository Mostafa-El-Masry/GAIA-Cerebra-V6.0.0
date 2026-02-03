# Timeline feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Timeline page |
| `layout.tsx` | Layout |
| `components/TimelineWrapper.tsx` | Wrapper |
| `components/VerticalTimeline.tsx` | Timeline UI |
| `data/events.ts` | Event data |

## What imports them

- `app/(app)/page.tsx` links to `/timeline`.
- `app/timeline/page.tsx` imports `TimelineWrapper` from `./components/TimelineWrapper`.

## Routes

- `/timeline` – timeline page.

## Deletability

Removing `app/timeline/` would remove the timeline route. Feature is self-contained.
