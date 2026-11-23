# CMMS Frontend — Performance Audit

Scope: the whole `src/` tree (202 files, ~70.6k lines), the Vite build output,
and `node_modules` resolution for large dependencies. Findings were made by
reading the code and by scripted searches across all files, plus production
builds. **No browser profiling was done** (no browser or backend was available
in this session). Sizes come from `vite build`.

Severity: **High** = users notice it on every visit · **Medium** = noticeable
in specific flows · **Low** = small, or only matters as data grows.

| # | Finding | Severity | Affected files | Status |
|---|---|---|---|---|
| 1 | Whole app shipped as one 3.5 MB JS file (905 kB gzip), parsed before first paint | High | `src/routes/*.jsx` | Fixed (pass 1) |
| 2 | Broken `lucide-react` install: ESM build missing, so the CJS fallback bundled all 1,768 icons (462 kB) on the entry path | High | `node_modules/lucide-react` | Fixed (pass 1) |
| 3 | `getProfile()` called from 33 places, `getAllDepartments()` from 19; refetched on every page open | High | ~35 pages | Fixed (pass 1) |
| 4 | Workflow config (`getAllStages`, `getAllActivites`) refetched on every record open | Medium | all `*Panel.jsx` | Fixed (pass 1) |
| 5 | CMMS dashboard: 1-second clock state on the page component re-renders **every chart every second** | High | `UserDashboard.jsx` | Fixed |
| 6 | Dashboard `processRecords` falls back to a new `[]` each render, defeating 3 `useMemo`s | Low | `UserDashboard.jsx` | Fixed |
| 7 | 13 record dashboards have no guard against out-of-order responses: with debounced search or filter changes, a slow older response can overwrite newer results and loading state | Medium | 13 `*Dashboard.jsx` | Fixed |
| 8 | After save, 15 panels refresh detail, then permissions, then logs, strictly one after another (3 round trips) | Medium | 15 `*Panel.jsx` | Fixed (now 2 round trips) |
| 9 | Pass-1 change ran detail/permissions/logs fully in parallel in 4 panels, but permissions/logs read `isImportedRef`, which detail sets. Possible stale read | Medium (correctness) | Equipment, EquipmentMaster, FieldInstruments, SpareInstrument panels | Fixed (detail first, then parallel) |
| 10 | **`SessionTimeout.jsx` crashes on idle logout**: `sessionStorage.removeItem(user_token \|\| admin_token)` uses undefined identifiers (ReferenceError). Token and user state are never cleared. Before that, it removed from `localStorage`, where tokens are not stored | High (security) | `SessionTimeout.jsx` | Fixed |
| 11 | Double-submit window: `form.submit()` validates asynchronously before `isSaving` becomes true, so two quick clicks can both create a record | Medium | `FloatingActionButtons.jsx` (shared by all forms) | Fixed |
| 12 | No retry for transient network or gateway failures on reads; one dropped packet shows an error page | Low | `services/api.js` | Fixed (GET-only, once) |
| 13 | Header notification count polls every 60 s even when the tab is hidden | Low | `UserHeader.jsx` | Fixed |
| 14 | React StrictMode double-invokes effects in development, doubling API calls in dev only | Info | `main.jsx` | Left as is (dev-only, useful) |
| 15 | Panels load profile, then detail, then (after `isLoading`) permissions/stages. Part of this is a real dependency (`isImportedRef`, `processId`) | Low | `*Panel.jsx` | Partially mitigated by caching; dependency kept |
| 16 | `UserDashboard` chunk is 409 kB (113 kB gzip), mostly Recharts | Medium | `UserDashboard.jsx` | Isolated to its own chunk; library kept |
| 17 | 3 near-identical 1,622-line `ChecklistConfig` copies (`components/checklist`, `pages/user/Equipment`, `pages/user/FieldInstruments`) | Low (maintainability, bundle) | listed files | Not changed (needs feature-owner review) |
| 18 | Undefined `frequency` in `handleViewChild`: `ReferenceError` when a row has no `frequency` | Medium (bug, pre-existing) | `AddendumPreventivePlannerPanel.jsx:631` | Reported, not changed (intent unclear) |
| 19 | ESLint config lacks browser globals (`setTimeout`, `URLSearchParams`, `requestAnimationFrame` flagged as `no-undef`) | Low (tooling) | `eslint.config.js` | Reported |

## Things checked and found fine
- **Search inputs** on every list dashboard are already debounced (400 ms). Table column definitions are memoised.
- **Tables are paginated on the server** (10–100 rows per page), so virtualization would add complexity for no measurable gain at these sizes.
- **`useIdleTimeout`** throttles activity handling to once per second and uses passive listeners.
- **`useNetworkStatus`** heartbeat runs every 30 s and pauses when the tab is hidden.
- **`SessionTimer`** ticks every second but is an isolated 60-line component.
- **No tokens or passwords are logged** (searched for `console.*` with token, password or Authorization).
- **No remaining `localStorage` use for auth.**
