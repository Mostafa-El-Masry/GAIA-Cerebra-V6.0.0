# Home feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `components/NoScroll.tsx` | Client component: adds/removes no-scrollbar class on mount/unmount |
| `components/HomeView.tsx` | Main home UI: circle of nav links, logo, mobile strip |
| `data/links.ts` | Nav link list and circle radius constant |

## What imports them

- `app/(app)/page.tsx` imports `NoScroll` and `HomeView` from this feature.

## Routes

- `/` – `app/(app)/page.tsx` composes `NoScroll` + `HomeView` (this feature).

## Deletability

Removing the `app/(app)/home/` folder would break the root route; update `app/(app)/page.tsx` to either render an alternative or redirect.
