# ELEUTHIA feature – file and reference tracker

## Files in this feature

| File | Purpose |
|------|---------|
| `page.tsx` | Main page (PermissionGate + EleuthiaClient) |
| `layout.tsx` | Layout |
| `components/EleuthiaClient.tsx` | Main client view |
| `components/EleuGate.tsx` | Gate component |
| `components/Vault.tsx`, `Unlock.tsx` | Vault/unlock UI |
| `components/ImportChrome.tsx` | Chrome import UI |
| `lib/crypto.ts`, `storage.ts`, `uid.ts` | Crypto, storage, IDs |
| `lib/snapshots.ts` | Backup snapshots |
| `types.ts` | Types |
| `Backups/page.tsx`, `Backups/components/BackupsClient.tsx` | Backups sub-route |

## What imports them

- `app/(app)/page.tsx` links to `/ELEUTHIA`.
- `app/Locked/page.tsx` imports `EleuGate` from this feature.
- ELEUTHIA and Backups pages import from `./components`, `./lib`, `@/app/DesignSystem/components/Button`, `@/lib/user-storage`, `@/app/ELEUTHIA/lib/snapshots` and `storage`.

## Routes

- `/ELEUTHIA` – main ELEUTHIA page.
- `/ELEUTHIA/Backups` – backups page.

## Deletability

Removing `app/ELEUTHIA/` would break `/ELEUTHIA`, `/ELEUTHIA/Backups`, and `app/Locked/page.tsx` (EleuGate). Move or replace EleuGate usage before removal.
