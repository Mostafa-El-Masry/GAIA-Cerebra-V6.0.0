# Health feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Health main page |
| `layout.tsx` | Layout (uses HealthShell) |
| `ClientPage.tsx` | Client health view |
| `HealthGateWrapper.tsx` | Gate wrapper |
| `components/HealthShell.tsx` | Shell layout |
| `components/TodayView.tsx`, `HistoryList.tsx` | Today and history |
| `components/DaySnapshotCard.tsx`, `MoodCard.tsx`, `SleepCard.tsx`, etc. | Day/widget cards |
| `lib/clock.ts`, `healthStore.ts`, `sleepStore.ts`, `waterStore.ts`, etc. | Stores and helpers |
| `lib/types.ts`, `mockData.ts`, `supabaseClient.ts`, `remoteHealth.ts` | Types, mocks, API |
| `food-calendar/page.tsx`, `components/`, `planLadder.ts`, `types.ts` | Food calendar sub-feature |
| `training-calendar/page.tsx` | Training calendar route |

## What imports them

- `app/(app)/page.tsx` links to `/health`.
- Health pages import from `./components`, `./lib`, and `@/lib/user-storage` where needed.

## Routes

- `/health` – main health page.
- `/health/food-calendar` – food calendar.
- `/health/training-calendar` – training calendar.

## Deletability

Removing `app/health/` would remove all health routes. Feature is self-contained; shared usage is `lib/user-storage` and global utils.
