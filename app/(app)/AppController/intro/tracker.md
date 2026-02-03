# Intro (AppController) – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `components/Brand.tsx` | Brand/logo component |
| `components/Intro.tsx` | Main intro view |
| `components/IntroClient.tsx` | Client wrapper for intro |
| `components/TopLeftHome.tsx` | Top-left home link |
| `components/UserDropdown.tsx` | User dropdown UI |

## What imports them

- `app/(app)/AppController/AppController.tsx` imports `AppBar` from `app/components/AppBar` (shared).
- `app/intro/page.tsx` imports `Intro` from `../(app)/AppController/intro/components/Intro`.

## Routes

- `/intro` – `app/intro/page.tsx` renders `<Intro />`.

## Deletability

Removing this folder would break `/intro` and any references to Brand/IntroClient/TopLeftHome/UserDropdown. Ensure no other route or shared component depends on these before removal.
