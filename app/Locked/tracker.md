# Locked feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `layout.tsx` | Layout (PermissionGate, LessonGate) |
| `page.tsx` | Renders EleuGate from ELEUTHIA |

## What imports them

- `app/Locked/page.tsx` imports `EleuGate` from `../ELEUTHIA/components/EleuGate`.
- Layout imports from `@/components/permissions`.

## Routes

- `/Locked` – locked gate page.

## Deletability

Removing `app/Locked/` would remove the Locked route. Depends on ELEUTHIA (EleuGate) and `@/components/permissions`.
