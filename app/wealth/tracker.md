# Wealth feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Wealth main page |
| `layout.tsx` | Layout (uses WealthShell) |
| `ClientPage.tsx` | Client wealth view |
| `WealthGateWrapper.tsx` | Gate wrapper |
| `components/WealthShell.tsx` | Shell layout |
| `components/PlanProjectionTable.tsx` | Plan projection table |
| `lib/types.ts`, `wealthStore.ts`, `summary.ts`, `levels.ts`, etc. | Types, stores, helpers |
| `lib/supabaseClient.ts`, `remoteWealth.ts`, `exchangeRate.ts`, `bankRates.ts` | API and rates |
| `accounts/page.tsx`, `flows/page.tsx`, `instruments/page.tsx` | Sub-routes |
| `levels/page.tsx`, `phases/page.tsx`, `plans/page.tsx` | Sub-routes |
| `projections/page.tsx`, `purchases/page.tsx` | Sub-routes |
| `hooks/useWealthUnlocks.ts` | Unlocks hook |

## What imports them

- `app/(app)/page.tsx` links to `/wealth`.
- Wealth pages import from `./components`, `./lib`, `./hooks`, and `@/lib/user-storage`, `@/app/components/Loading`, `@/utils/dates` where used.

## Routes

- `/wealth` – main wealth page.
- `/wealth/accounts`, `/wealth/flows`, `/wealth/instruments`, `/wealth/levels`, `/wealth/phases`, `/wealth/plans`, `/wealth/projections`, `/wealth/purchases` – sub-routes.

## Deletability

Removing `app/wealth/` would remove all wealth routes. Feature is self-contained; shared usage is `lib/user-storage`, `utils/dates`, and `app/components/Loading`.
