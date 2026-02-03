# Settings feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Settings page |
| `layout.tsx` | Layout |
| `ClientPage.tsx` | Client settings view |
| `components/ThemePicker.tsx`, `PrimitivesPicker.tsx` | Theme/primitives UI |
| `sections/AccessibilityCard.tsx`, `BackupPanel.tsx`, `DefaultsCard.tsx` | Section cards |
| `sections/PrivacyCard.tsx`, `ProfilesCard.tsx`, `SceneCard.tsx`, `ThemeCard.tsx` | Section cards |
| `users/page.tsx`, `UsersSettingsClient.tsx` | Users sub-route |

## What imports them

- `app/(app)/page.tsx` links to `/settings`.
- Settings pages import from `./components`, `./sections`, `@/app/DesignSystem/`, `@/lib/user-storage`, `@/lib/users/types`.

## Routes

- `/settings` – main settings.
- `/settings/users` – users settings.

## Deletability

Removing `app/settings/` would remove settings and users settings routes. Feature is self-contained; shared usage is DesignSystem and `lib/user-storage`, `lib/users`.
