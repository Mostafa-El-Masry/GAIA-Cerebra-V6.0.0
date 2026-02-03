# TODO feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | TODO page |
| `layout.tsx` | Layout |
| `modules/DuePicker.tsx` | Due date picker |
| `modules/TaskDraggable.tsx` | Draggable task |
| `modules/types.ts`, `utils.ts` | Types and helpers |

## What imports them

- TODO page and modules import from `./modules`, `@/lib/user-storage`, `@/utils/dates`.

## Routes

- `/TODO` – TODO page (exact path).

## Deletability

Removing `app/TODO/` would remove the TODO route. Feature is self-contained.
