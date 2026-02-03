# Intro route – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Intro route page |
| `layout.tsx` | Layout |

## What imports them

- `app/intro/page.tsx` imports `Intro` from `../(app)/AppController/intro/components/Intro`.
- Route `/intro` renders this page.

## Routes

- `/intro` – intro page (uses Intro component from AppController/intro).

## Deletability

Removing `app/intro/` would remove the `/intro` route. The Intro UI lives in `app/(app)/AppController/intro/`.
