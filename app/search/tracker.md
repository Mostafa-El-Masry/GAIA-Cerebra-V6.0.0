# Search feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Search page |
| `layout.tsx` | Layout |

## What imports them

- AppBar (shared) links to `/search?q=...`.
- Search page uses API or client logic for search.

## Routes

- `/search` – search page (query param `q`).

## Deletability

Removing `app/search/` would remove the search route. Feature is self-contained.
