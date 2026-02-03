# Apollo feature – file and reference tracker

## Files in this feature (top-level)

| Path | Purpose |
|------|---------|
| `page.tsx` | Apollo app entry |
| `layout.tsx` | Layout |
| `ApolloApp.tsx` | Main app shell (AskPanel, LinkCard, ApolloStudyGate) |
| `components/*` | AskPanel, LinkCard, ApolloStudyGate, SectionViewer, SectionFullView, SectionEditor, ArchiveSidebar, ArchiveFullView, Toolbar, SearchBox |
| `lib/store.ts`, `lib/types.ts`, `lib/id.ts` | Store and types |
| `academy/` | Academy paths, lessons, programming/self-repair, calendar |
| `archives/` | Archives by subject, Records (CSS, HTML, JavaScript) |
| `labs/` | Labs page, BuildCard, LabsClient |
| `section/[sectionId]/` | Section full view route |
| `tower/` | Tower data and lessons |

## What imports them

- `app/(app)/page.tsx` links to `/apollo`.
- Apollo pages import from `./components`, `./lib`, `@/lib/user-storage`, `@/app/DesignSystem`, and academy/archives/labs/section/tower submodules.

## Routes

- `/apollo` – main Apollo app.
- `/apollo/archives`, `/apollo/archives/[subject]`, `/apollo/archives/Records/*` – archives.
- `/apollo/section/[sectionId]` – section view.
- `/apollo/academy/*`, `/apollo/labs` – academy and labs.

## Deletability

Removing `app/apollo/` would remove all Apollo routes. Feature is large and self-contained; shared usage is `lib/user-storage` and DesignSystem.
