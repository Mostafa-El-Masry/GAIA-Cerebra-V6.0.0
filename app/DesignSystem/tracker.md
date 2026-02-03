# DesignSystem feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `theme.ts` | Theme list and default |
| `ThemeRoot.tsx` | Theme root component |
| `context/DesignProvider.tsx` | Design context provider |
| `components/Button.tsx`, `SearchInput.tsx` | Primitives |
| `hooks/useClientSetting.ts` | Client setting hook |
| `index.ts` | Re-exports |

## What imports them

- `app/layout.tsx` uses `DesignProvider` and theme for initial theme.
- `app/(app)/layout.tsx` uses `DesignProvider`.
- ELEUTHIA, settings, apollo, and other features import `Button`, `SearchInput` from `@/app/DesignSystem` or `DesignSystem/components`.
- DesignProvider uses `@/lib/user-storage`.

## Routes

- No direct route; used as global primitives and layout provider.

## Deletability

Removing `app/DesignSystem/` would break root and (app) layouts and all consumers of Button/SearchInput/theme. This is a shared primitive layer.
