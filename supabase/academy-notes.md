# Academy — Completion Logic (Documentation Only)

## Automatic completion

- A lesson is marked **completed** automatically.
- Completion happens **on first open**.
- Once completed, it is **never reverted**.

## When a lesson is opened for the first time

Set in the database:

- `completed = true`
- `first_opened_at = now()`

No other persistence is required for completion.

## Content source

- **Lesson content is not stored in the database.**
- **Files are the source of lesson content.**
- The database holds metadata and completion state only; content lives in the Academy file tree.

## Summary

| Concept        | Location / behavior                          |
|----------------|----------------------------------------------|
| Lesson content | Files (e.g. `Academy/lessons/<path>/lessons/*.md`) |
| Completion     | DB: `academy_lessons.completed`, `first_opened_at` |
| Trigger        | First open of a lesson → set completed + first_opened_at |

No code is required in this step — documentation only. Future runtime will implement this logic when wiring the dashboard and lesson viewer.
