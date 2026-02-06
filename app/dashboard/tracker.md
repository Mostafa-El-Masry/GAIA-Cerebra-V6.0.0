# Dashboard feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Dashboard route page |
| `layout.tsx` | Dashboard layout |
| `components/TodoDaily.tsx` | Daily todo component |
| `components/TodoQuickAdd.tsx` | Quick-add todo UI |
| `components/TodoSlot.tsx` | Single todo slot |
| `hooks/useTodoDaily.ts` | Hook for daily todos |
| `widgets/Sparkline.tsx` | Sparkline widget |
| `widgets/WealthSpark.tsx` | Wealth sparkline |
| `calendars/page.tsx` | Calendars sub-route |

## What imports them

- `app/(app)/page.tsx` links to `/dashboard` (home nav).
- Dashboard pages import from `./components`, `./hooks`, `./widgets`, and from `@/lib/user-storage`, `@/utils/dates`.

## Routes

- `/dashboard` – main dashboard page.
- `/dashboard/calendars` – calendars page.

## Deletability

Removing `app/dashboard/` would remove the dashboard and calendars routes. No other feature folder should contain dashboard-only logic; shared utils remain in `lib/` and `utils/`.
